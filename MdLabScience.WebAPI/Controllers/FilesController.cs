using MdLabScience.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;

namespace MdLabScience.Controllers
{
    // Serves uploaded course assets through the API instead of handing out the
    // private R2 S3 endpoint. Rows now store "api/Files/<key>" so the browser and
    // the mobile app can load them without credentials or CORS problems.
    [ApiController]
    [Route("api/[controller]")]
    public class FilesController : ControllerBase
    {
        private static readonly FileExtensionContentTypeProvider ContentTypes = new();
        private readonly R2StorageService _r2Storage;

        public FilesController(R2StorageService r2Storage)
        {
            _r2Storage = r2Storage;
        }

        [HttpGet("{**key}")]
        [AllowAnonymous]
        public async Task<IActionResult> Get(string key)
        {
            // Only course assets and question images are public. Everything else
            // (applicant photos, certificates, ...) stays offline unless served
            // by its own endpoint.
            var isCourseAsset = key?.StartsWith("courses/", StringComparison.OrdinalIgnoreCase) == true;
            var isQuestionImage = key?.StartsWith("questions/images/", StringComparison.OrdinalIgnoreCase) == true;
            if (string.IsNullOrWhiteSpace(key) ||
                (!isCourseAsset && !isQuestionImage) ||
                key.Contains("..", StringComparison.Ordinal))
            {
                return NotFound();
            }

            var stored = await _r2Storage.OpenReadAsync(key, HttpContext.RequestAborted);
            if (stored == null)
            {
                return NotFound();
            }

            Response.RegisterForDispose(stored);
            Response.Headers.CacheControl = "public,max-age=31536000,immutable";
            Response.Headers["X-Content-Type-Options"] = "nosniff";

            var contentType = stored.Headers.ContentType;
            if (string.IsNullOrWhiteSpace(contentType) ||
                string.Equals(contentType, "application/octet-stream", StringComparison.OrdinalIgnoreCase))
            {
                if (!ContentTypes.TryGetContentType(key, out contentType) || string.IsNullOrWhiteSpace(contentType))
                {
                    contentType = "application/octet-stream";
                }
            }

            return File(stored.ResponseStream, contentType, enableRangeProcessing: true);
        }
    }
}
