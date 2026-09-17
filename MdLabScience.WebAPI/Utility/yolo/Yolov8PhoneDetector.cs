using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using SkiaSharp;

namespace MdLabScience.Utility.Yolo
{
    /// <summary>
    /// Runs the YOLOv8n (COCO) ONNX model to detect a "cell phone" (class 67)
    /// inside a captured proctor frame. The model file is embedded in the
    /// project at startup so inference happens server-side.
    /// </summary>
    public static class Yolov8PhoneDetector
    {
        public const int ModelSize = 320;
        public const int PhoneClassId = 67; // COCO: cell phone
        public const int ClassCount = 80;
        public const int FeatureCount = 4 + ClassCount;

        private static readonly object _gate = new object();
        private static InferenceSession? _session;
        private static bool _triedLoad;

        public static bool PhoneDetected(Stream imageStream, byte[] modelBytes, float confidenceThreshold)
        {
            using var source = SKBitmap.Decode(imageStream);
            if (source == null) return false;

            return DetectPhonesInOriginal(source, modelBytes, confidenceThreshold).Count > 0;
        }

        /// <summary>
        /// Runs inference on the given source frame and writes an annotated copy
        /// to <paramref name="outputPath"/>. Every detected phone is outlined with
        /// a red box and labelled "Mobile phone detected (NN%)"; when no phone is
        /// found a red "No phone detected" caption is drawn at the top-left.
        /// Returns true when at least one phone was detected.
        /// </summary>
        public static bool Annotate(
            Stream imageStream,
            byte[] modelBytes,
            float confidenceThreshold,
            string outputPath)
        {
            using var source = SKBitmap.Decode(imageStream);
            if (source == null) return false;

            var detections = DetectPhonesInOriginal(source, modelBytes, confidenceThreshold);

            using var canvas = new SKBitmap(source.Width, source.Height, SKColorType.Rgba8888, SKAlphaType.Premul);
            using (var g = new SKCanvas(canvas))
            {
                g.DrawBitmap(source, 0f, 0f);

                if (detections.Count > 0)
                {
                    var outline = new SKPaint
                    {
                        Color = SKColors.Red,
                        Style = SKPaintStyle.Stroke,
                        StrokeWidth = Math.Max(3f, source.Width * 0.005f),
                        IsAntialias = true,
                    };
                    var label = new SKPaint
                    {
                        Color = SKColors.Red,
                        IsAntialias = true,
                        TextSize = Math.Max(16f, source.Width * 0.04f),
                        Typeface = SKTypeface.Default,
                    };
                    var labelBackground = new SKPaint
                    {
                        Color = SKColor.Parse("#CCFF0000"),
                        Style = SKPaintStyle.Fill,
                    };

                    foreach (var d in detections)
                    {
                        g.DrawRect(new SKRect(d.X1, d.Y1, d.X2, d.Y2), outline);

                        string text = $"Mobile phone detected ({d.Score:P0})";
                        float textY = Math.Max(Math.Max(d.Y1 - 6f, 0f) + label.TextSize, label.TextSize);
                        float textW = label.MeasureText(text);
                        g.DrawRect(
                            new SKRect(d.X1, textY - label.TextSize, d.X1 + textW + 8f, textY + 4f),
                            labelBackground);
                        g.DrawText(text, d.X1 + 4f, textY, label);
                    }
                }
                else
                {
                    const string text = "No phone detected";
                    var label = new SKPaint
                    {
                        Color = SKColors.Red,
                        IsAntialias = true,
                        TextSize = Math.Max(18f, source.Width * 0.05f),
                        Typeface = SKTypeface.Default,
                    };
                    var labelBackground = new SKPaint
                    {
                        Color = SKColor.Parse("#CCFF0000"),
                        Style = SKPaintStyle.Fill,
                    };
                    float textW = label.MeasureText(text);
                    float x = source.Width * 0.04f;
                    float y = label.TextSize + source.Height * 0.04f;
                    g.DrawRect(new SKRect(x - 4f, y - label.TextSize, x + textW + 4f, y + 4f), labelBackground);
                    g.DrawText(text, x, y, label);
                }
            }

            using var image = SKImage.FromBitmap(canvas);
            using var data = image.Encode(SKEncodedImageFormat.Jpeg, 90);
            using (var stream = new FileStream(outputPath, FileMode.Create))
            {
                data.SaveTo(stream);
            }

            return detections.Count > 0;
        }

        /// <summary>
        /// Decodes the source frame, letterboxes it for the model and returns the
        /// final phone boxes mapped back to the original image pixel space.
        /// </summary>
        private static List<PhoneDetection> DetectPhonesInOriginal(
            SKBitmap source,
            byte[] modelBytes,
            float confidenceThreshold)
        {
            if (source == null || source.Width <= 0 || source.Height <= 0) return new List<PhoneDetection>();

            var session = GetSession(modelBytes);
            if (session == null) return new List<PhoneDetection>();

            float scale = Math.Min((float)ModelSize / source.Width, (float)ModelSize / source.Height);
            using var letterbox = DecodeLetterboxed(source, out int padX, out int padY);

            var input = new DenseTensor<float>(new[] { 1, 3, ModelSize, ModelSize });
            FillRgbInput(letterbox, input);

            using var results = session.Run(new[]
            {
                NamedOnnxValue.CreateFromTensor(session.InputNames[0], input),
            });

            var output = results.First().AsTensor<float>();
            var detections = DecodePhoneDetections(output, padX, padY, confidenceThreshold);

            var mapped = new List<PhoneDetection>(detections.Count);
            foreach (var b in detections)
            {
                float x1 = Math.Clamp((b.X1 - padX) / scale, 0f, source.Width);
                float y1 = Math.Clamp((b.Y1 - padY) / scale, 0f, source.Height);
                float x2 = Math.Clamp((b.X2 - padX) / scale, 0f, source.Width);
                float y2 = Math.Clamp((b.Y2 - padY) / scale, 0f, source.Height);
                mapped.Add(new PhoneDetection { X1 = x1, Y1 = y1, X2 = x2, Y2 = y2, Score = b.Score });
            }
            return mapped;
        }

        private static InferenceSession? GetSession(byte[] modelBytes)
        {
            lock (_gate)
            {
                if (_session != null) return _session;
                if (_triedLoad) return null;
                _triedLoad = true;
                try
                {
                    var options = new Microsoft.ML.OnnxRuntime.SessionOptions
                    {
                        GraphOptimizationLevel = GraphOptimizationLevel.ORT_ENABLE_ALL,
                        IntraOpNumThreads = 2,
                    };
                    _session = new InferenceSession(modelBytes, options);
                    return _session;
                }
                catch
                {
                    _session = null;
                    return null;
                }
            }
        }

        /// <summary>
        /// Decodes and letterboxes the uploaded image onto a gray 320x320
        /// canvas, mirroring the preprocessing used at export time.
        /// </summary>
        private static SKBitmap? DecodeLetterboxed(Stream imageStream, out int padX, out int padY)
        {
            using var src = SKBitmap.Decode(imageStream);
            if (src == null)
            {
                padX = 0;
                padY = 0;
                return null;
            }
            return DecodeLetterboxed(src, out padX, out padY);
        }

        private static SKBitmap DecodeLetterboxed(SKBitmap src, out int padX, out int padY)
        {
            float scale = Math.Min((float)ModelSize / src.Width, (float)ModelSize / src.Height);
            int newW = Math.Max(1, (int)Math.Round(src.Width * scale));
            int newH = Math.Max(1, (int)Math.Round(src.Height * scale));
            padX = (ModelSize - newW) / 2;
            padY = (ModelSize - newH) / 2;

            var canvas = new SKBitmap(ModelSize, ModelSize, SKColorType.Rgba8888, SKAlphaType.Premul);
            canvas.Erase(SKColor.Parse("#727272")); // letterbox gray ~ 114/255

            using var resized = src.Resize(new SKSizeI(newW, newH), SKFilterQuality.High);
            if (resized != null)
            {
                using var image = SKImage.FromBitmap(resized);
                using var g = new SKCanvas(canvas);
                g.DrawImage(image, new SKPoint(padX, padY));
            }
            return canvas;
        }

        private static void FillRgbInput(SKBitmap bitmap, DenseTensor<float> input)
        {
            var pixels = bitmap.Pixels;
            for (int i = 0; i < ModelSize * ModelSize; i++)
            {
                var p = pixels[i];
                input[0, 0, i / ModelSize, i % ModelSize] = p.Red / 255f;
                input[0, 1, i / ModelSize, i % ModelSize] = p.Green / 255f;
                input[0, 2, i / ModelSize, i % ModelSize] = p.Blue / 255f;
            }
        }

        /// <summary>
        /// YOLOv8 output is output0[1,84,2100] (feature-major). Each anchor is
        /// 4 box coords + 80 class logits. Phone is the class achieving the
        /// highest sigmoid score for that anchor.
        /// </summary>
        private static List<PhoneDetection> DecodePhoneDetections(
            Tensor<float> output, int padX, int padY, float confidenceThreshold)
        {
            var dims = output.Dimensions; // 1, 84, 2100
            int anchorCount = dims.Length >= 3 ? (int)dims[2] : 0;
            var boxes = new List<PhoneDetection>();

            for (int a = 0; a < anchorCount; a++)
            {
                float bestScore = 0f;
                float secondScore = 0f;
                int bestClass = -1;
                int secondClass = -1;
                for (int c = 0; c < ClassCount; c++)
                {
                    float logit = output[0, 4 + c, a];
                    float score = 1f / (1f + (float)Math.Exp(-logit));
                    if (score > bestScore)
                    {
                        secondScore = bestScore;
                        secondClass = bestClass;
                        bestScore = score;
                        bestClass = c;
                    }
                    else if (score > secondScore)
                    {
                        secondScore = score;
                        secondClass = c;
                    }
                }

                if (bestClass != PhoneClassId || bestScore < confidenceThreshold) continue;
                if (bestScore - secondScore < 0.05f) continue;

                float cx = output[0, 0, a];
                float cy = output[0, 1, a];
                float w = output[0, 2, a];
                float h = output[0, 3, a];
                if (w < 4 || h < 4 || cx <= 0 || cy <= 0) continue;

                boxes.Add(new PhoneDetection
                {
                    X1 = cx - w / 2f,
                    Y1 = cy - h / 2f,
                    X2 = cx + w / 2f,
                    Y2 = cy + h / 2f,
                    Score = bestScore,
                });
            }

            return Nms(boxes);
        }

        private static List<PhoneDetection> Nms(List<PhoneDetection> boxes)
        {
            var sorted = boxes.OrderByDescending(b => b.Score).ToList();
            var keep = new List<PhoneDetection>();
            foreach (var box in sorted)
            {
                bool suppressed = false;
                foreach (var kept in keep)
                {
                    float ix = Math.Max(0, Math.Min(box.X2, kept.X2) - Math.Max(box.X1, kept.X1));
                    float iy = Math.Max(0, Math.Min(box.Y2, kept.Y2) - Math.Max(box.Y1, kept.Y1));
                    float inter = ix * iy;
                    float areaBox = (box.X2 - box.X1) * (box.Y2 - box.Y1);
                    float areaKept = (kept.X2 - kept.X1) * (kept.Y2 - kept.Y1);
                    float iou = inter / (areaBox + areaKept - inter + 1e-9f);
                    if (iou > 0.45f)
                    {
                        suppressed = true;
                        break;
                    }
                }
                if (!suppressed) keep.Add(box);
            }
            return keep;
        }

        public sealed class PhoneDetection
        {
            public float X1 { get; set; }
            public float Y1 { get; set; }
            public float X2 { get; set; }
            public float Y2 { get; set; }
            public float Score { get; set; }
        }
    }
}