using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.AspNetCore.Http;

namespace MdLabScience.Services
{
    public class R2StorageService
    {
        private readonly IAmazonS3? _s3Client;
        private readonly string _bucketName;
        private readonly string _publicUrl;
        private readonly string _accountId;
        private readonly bool _isConfigured;
        private readonly ILogger<R2StorageService>? _logger;

        public R2StorageService(IConfiguration configuration, ILogger<R2StorageService>? logger = null)
        {
            _logger = logger;
            _accountId = configuration["Cloudflare:R2:AccountId"] ?? configuration["R2:AccountId"] ?? "";
            var accessKey = configuration["Cloudflare:R2:AccessKeyId"] ?? configuration["R2:AccessKeyId"] ?? "";
            var secretKey = configuration["Cloudflare:R2:SecretAccessKey"] ?? configuration["R2:SecretAccessKey"] ?? "";
            _bucketName = configuration["Cloudflare:R2:BucketName"] ?? configuration["R2:BucketName"] ?? "uploads";
            _publicUrl = configuration["Cloudflare:R2:PublicUrl"] ?? configuration["R2:PublicUrl"] ?? "";

            _isConfigured = !string.IsNullOrWhiteSpace(_accountId) && !string.IsNullOrWhiteSpace(accessKey) && !string.IsNullOrWhiteSpace(secretKey) && !string.IsNullOrWhiteSpace(_bucketName) && !_accountId.Contains("REPLACE_ME") && !accessKey.Contains("REPLACE_ME");

            if (!_isConfigured || string.IsNullOrWhiteSpace(_accountId))
            {
                _s3Client = null;
                Console.WriteLine("[R2] Not configured - uploads will fail. Set Cloudflare:R2:* in appsettings.json.");
                return;
            }

            try
            {
                var config = new AmazonS3Config
                {
                    ServiceURL = $"https://{_accountId}.r2.cloudflarestorage.com",
                    ForcePathStyle = true,
                    AuthenticationRegion = "auto"
                };
                _s3Client = new AmazonS3Client(accessKey, secretKey, config);
            }
            catch
            {
                _s3Client = null;
                _isConfigured = false;
            }
        }

        public async Task<string?> UploadAsync(IFormFile file, string folder = "uploads")
        {
            if (file == null || file.Length == 0 || _s3Client == null || !_isConfigured) return null;

            try
            {
                var extension = Path.GetExtension(file.FileName);
                var key = $"{folder}/{Guid.NewGuid():N}{extension}";

                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);
                ms.Position = 0;

                var request = new PutObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key,
                    InputStream = ms,
                    ContentType = string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType,
                    UseChunkEncoding = false
                };

                await _s3Client.PutObjectAsync(request);

                // Store a path that the API (and therefore the browser/app) can
                // always resolve. The R2 S3 endpoint is private, so handing out
                // a direct URL results in 403 XML when opened in a browser.
                return PublicPathFor(key);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[R2] Upload failed: {ex.GetType().Name}: {ex.Message}");
                _logger?.LogError(ex, "R2 upload failed for bucket {Bucket}", _bucketName);
                return null;
            }
        }

        public async Task<bool> DeleteAsync(string key)
        {
            if (string.IsNullOrEmpty(key) || _s3Client == null) return false;
            try
            {
                await _s3Client.DeleteObjectAsync(_bucketName, key);
                return true;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// API path that serves a stored object, e.g. <c>api/Files/courses/x.pdf</c>.
        /// This is what should be saved in the database.
        /// </summary>
        public static string PublicPathFor(string key)
        {
            return $"api/Files/{key.TrimStart('/')}";
        }

        /// <summary>
        /// Converts any stored value (new relative path, legacy private R2 URL,
        /// public bucket URL or bare key) into the API path used by clients.
        /// Values that are not ours (local Uploads paths, external URLs) are
        /// returned unchanged.
        /// </summary>
        public string ToPublicPath(string? storedPath)
        {
            var key = GetObjectKey(storedPath);
            return string.IsNullOrEmpty(key) ? (storedPath ?? string.Empty) : PublicPathFor(key);
        }

        /// <summary>
        /// Extracts the R2 object key from a stored file path or URL.
        /// </summary>
        public string? GetObjectKey(string? storedPath)
        {
            if (string.IsNullOrWhiteSpace(storedPath)) return null;

            var value = storedPath.Trim();
            const string apiPrefix = "api/Files/";

            if (value.StartsWith("/" + apiPrefix, StringComparison.OrdinalIgnoreCase))
            {
                value = value.Substring(apiPrefix.Length + 1);
            }
            else if (value.StartsWith(apiPrefix, StringComparison.OrdinalIgnoreCase))
            {
                value = value.Substring(apiPrefix.Length);
            }

            if (!value.Contains("://", StringComparison.Ordinal))
            {
                var bare = value.TrimStart('/');
                var isKnownKey = bare.StartsWith("courses/", StringComparison.OrdinalIgnoreCase) ||
                                 bare.StartsWith("questions/images/", StringComparison.OrdinalIgnoreCase);
                return isKnownKey
                    ? Uri.UnescapeDataString(bare.Split('?', '#')[0])
                    : null;
            }

            if (!Uri.TryCreate(value, UriKind.Absolute, out var uri)) return null;

            var host = uri.Host;
            if (host.EndsWith(".r2.cloudflarestorage.com", StringComparison.OrdinalIgnoreCase) ||
                host.EndsWith(".r2.dev", StringComparison.OrdinalIgnoreCase))
            {
                var key = uri.AbsolutePath.TrimStart('/');
                var bucketPrefix = _bucketName + "/";
                if (key.StartsWith(bucketPrefix, StringComparison.OrdinalIgnoreCase))
                {
                    key = key.Substring(bucketPrefix.Length);
                }
                key = Uri.UnescapeDataString(key);
                return string.IsNullOrWhiteSpace(key) ? null : key;
            }

            var publicUrl = _publicUrl?.TrimEnd('/');
            if (!string.IsNullOrEmpty(publicUrl) &&
                value.StartsWith(publicUrl + "/", StringComparison.OrdinalIgnoreCase))
            {
                var key = value.Substring(publicUrl.Length + 1).Split('?', '#')[0];
                return string.IsNullOrWhiteSpace(key) ? null : Uri.UnescapeDataString(key);
            }

            // A full URL to our own api/Files proxy.
            var proxyIndex = uri.AbsolutePath.IndexOf("/api/Files/", StringComparison.OrdinalIgnoreCase);
            if (proxyIndex >= 0)
            {
                var key = uri.AbsolutePath.Substring(proxyIndex + "/api/Files/".Length);
                return string.IsNullOrWhiteSpace(key) ? null : Uri.UnescapeDataString(key);
            }

            return null;
        }

        public string? CreatePresignedReadUrl(string storedPath, string? downloadFileName = null, TimeSpan? expiresIn = null)
        {
            if (_s3Client == null || !_isConfigured) return null;

            var key = GetObjectKey(storedPath);
            if (string.IsNullOrEmpty(key)) return null;

            var fileName = string.IsNullOrWhiteSpace(downloadFileName)
                ? Path.GetFileName(key)
                : Path.GetFileName(downloadFileName);
            if (string.IsNullOrWhiteSpace(fileName)) fileName = "download";
            var safeFileName = new string(fileName
                .Select(c => char.IsControl(c) || c == '"' || c > 127 ? '_' : c)
                .ToArray());

            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = key,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.Add(expiresIn ?? TimeSpan.FromMinutes(10)),
                ResponseHeaderOverrides = new ResponseHeaderOverrides
                {
                    ContentDisposition = $"attachment; filename=\"{safeFileName}\""
                }
            };

            return _s3Client.GetPreSignedURL(request);
        }

        /// <summary>
        /// Opens an object in the configured bucket for reading. The caller owns
        /// the returned response and must dispose it after the stream is copied.
        /// </summary>
        public async Task<GetObjectResponse?> OpenReadAsync(string storedPath, CancellationToken cancellationToken = default)
        {
            if (_s3Client == null || !_isConfigured) return null;
            var key = GetObjectKey(storedPath);
            if (string.IsNullOrEmpty(key)) return null;

            try
            {
                return await _s3Client.GetObjectAsync(new GetObjectRequest
                {
                    BucketName = _bucketName,
                    Key = key
                }, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "R2 download failed for key {Key}", key);
                return null;
            }
        }
    }
}
