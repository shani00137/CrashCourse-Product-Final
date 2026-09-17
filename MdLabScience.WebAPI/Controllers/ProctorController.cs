using MdLabScience.Utility;
using MdLabScience.Utility.Yolo;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MdLabScience.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class ProctorController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;
        private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png" };

        public ProctorController(IWebHostEnvironment env, IConfiguration configuration)
        {
            _env = env;
            _configuration = configuration;
        }

        /// <summary>
        /// Receives a proctor frame captured by a student while taking an
        /// exercise, saves the image into the site web root (wwwroot) so it is
        /// served over HTTP, then runs the server-side YOLO phone detector.
        /// Returns whether a mobile phone was found in the frame.
        /// </summary>
        [HttpPost]
        [Route("api/Proctor/AnalyzeFrame")]
        [RequestSizeLimit(30_000_000)]
        public async Task<IActionResult> AnalyzeFrame(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return Ok(new AnalyzedFrameResponse(false, null, "No image file provided."));
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
            {
                return Ok(new AnalyzedFrameResponse(false, null, "Unsupported file type."));
            }

            string wwwRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
            Directory.CreateDirectory(Path.Combine(wwwRoot, "Proctor"));

            // Preserve the original image quality but normalize the extension
            // to jpg (the app uploads JPEG frames). The annotated result (red
            // box + label) is saved next to it and returned as imageUrl.
            string fileName = $"proctor_{DateTime.Now:yyyyMMdd_HHmmssfff}_{Guid.NewGuid():N}.jpg";
            string filePath = Path.Combine(wwwRoot, "Proctor", fileName);
            string annotatedName = Path.ChangeExtension(fileName, ".annotated.jpg");
            string annotatedPath = Path.Combine(wwwRoot, "Proctor", annotatedName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            bool phoneDetected;
            try
            {
                string modelPath = _configuration["Proctor:ModelPath"] ?? "Utility/yolo/yolov8n.onnx";
                string modelFullPath = Path.IsPathRooted(modelPath)
                    ? modelPath
                    : Path.Combine(_env.ContentRootPath, modelPath);
                byte[] model = await System.IO.File.ReadAllBytesAsync(modelFullPath);
                float confidence = float.TryParse(_configuration["Proctor:Confidence"], out var c)
                    ? c
                    : 0.35f;

                using (var image = new FileStream(filePath, FileMode.Open, FileAccess.Read))
                {
                    phoneDetected = Yolov8PhoneDetector.Annotate(image, model, confidence, annotatedPath);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Proctor] Detection failed: {ex.Message}");
                return Ok(new AnalyzedFrameResponse(false, "/Proctor/" + fileName, "Detection unavailable."));
            }

            return Ok(new AnalyzedFrameResponse(
                phoneDetected,
                "/Proctor/" + annotatedName,
                phoneDetected ? "Mobile phone detected." : "No phone detected."));
        }

        public sealed class AnalyzedFrameResponse
        {
            public AnalyzedFrameResponse(bool phoneDetected, string? imageUrl, string message)
            {
                PhoneDetected = phoneDetected;
                ImageUrl = imageUrl;
                Message = message;
            }

            public bool PhoneDetected { get; set; }
            public string? ImageUrl { get; set; }
            public string Message { get; set; }
        }
    }
}