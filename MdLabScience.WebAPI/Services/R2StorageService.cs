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
                Console.WriteLine("[R2] Not configured - uploads will be stored locally in Uploads/. Set Cloudflare:R2:* in appsettings.json.");
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

                if (!string.IsNullOrEmpty(_publicUrl))
                {
                    return $"{_publicUrl.TrimEnd('/')}/{key}";
                }

                if (!string.IsNullOrEmpty(_accountId))
                {
                    return $"https://pub-{_accountId}.r2.dev/{key}";
                }

                return $"https://{_bucketName}.r2.dev/{key}";
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
    }
}
