using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using RapidOcrNet;
using SkiaSharp;

namespace MdLabScience.Utility
{
    public class PaddleOcrPageResult
    {
        public int Width { get; set; }
        public int Height { get; set; }
        public string Text { get; set; }
    }

    public static class PaddleOcrService
    {
        private static RapidOcr _ocr;
        private static readonly object _initLock = new object();
        private static readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

        private static RapidOcr GetOcr()
        {
            if (_ocr != null)
            {
                return _ocr;
            }

            lock (_initLock)
            {
                if (_ocr != null)
                {
                    return _ocr;
                }

                var ocr = new RapidOcr();
                string modelsDir = Path.Combine(AppContext.BaseDirectory, "models", "v5");
                string det = Path.Combine(modelsDir, "ch_PP-OCRv5_mobile_det.onnx");
                string cls = Path.Combine(modelsDir, "ch_ppocr_mobile_v2.0_cls_infer.onnx");
                string rec = Path.Combine(modelsDir, "latin_PP-OCRv5_rec_mobile_infer.onnx");
                string keys = Path.Combine(modelsDir, "ppocrv5_latin_dict.txt");

                if (File.Exists(det) && File.Exists(rec) && File.Exists(keys))
                {
                    ocr.InitModels(det, cls, rec, keys, Math.Max(1, Environment.ProcessorCount / 2));
                }
                else
                {
                    ocr.InitModels(Math.Max(1, Environment.ProcessorCount / 2));
                }

                _ocr = ocr;
                return _ocr;
            }
        }

        public static async Task<PaddleOcrPageResult> RunOcrAsync(string base64, string? modelName = null)
        {
            byte[] imageBytes = Convert.FromBase64String(base64);

            using var ms = new MemoryStream(imageBytes);
            using var src = SKBitmap.Decode(ms);
            if (src == null)
            {
                throw new InvalidOperationException("Could not decode the provided image.");
            }

            using var bitmap = src.Copy(SKColorType.Bgra8888) ?? src;

            RapidOcr ocr = GetOcr();

            OcrResult result;
            await _semaphore.WaitAsync();
            try
            {
                result = await Task.Run(() => ocr.Detect(bitmap, new RapidOcrOptions { DoAngle = false }));
            }
            finally
            {
                _semaphore.Release();
            }

            string text = result.StrRes ?? string.Empty;
            text = string.Join("\n", text.Split('\n').Select(l => l.Trim()));

            return new PaddleOcrPageResult
            {
                Width = bitmap.Width,
                Height = bitmap.Height,
                Text = text
            };
        }
    }
}
