using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;

namespace MdLabScience.Utility
{
    /// <summary>
    /// Verifies Google Play subscription purchases server-side against the
    /// Google Play Developer API (purchases.subscriptionsv2.get).
    ///
    /// Configuration (appsettings.json → "GooglePlay"):
    ///   PackageName            - the Play application id, e.g. com.onlinecrashcourse.app
    ///   ServiceAccountJsonPath - path to the service-account JSON key file
    ///   ServiceAccountJson     - inline JSON alternative to the path
    ///
    /// The service account must be granted access to the app in the Play
    /// Console (Users &amp; permissions) and the "Google Play Android Developer
    /// API" must be enabled on the Google Cloud project that owns it.
    ///
    /// When nothing is configured, <see cref="IsConfigured"/> is false and the
    /// caller falls back to the manual owner-approval flow.
    /// </summary>
    public class GooglePlayVerifier
    {
        private const string Scope = "https://www.googleapis.com/auth/androidpublisher";

        private readonly IConfiguration _config;

        public GooglePlayVerifier(IConfiguration config)
        {
            _config = config;
        }

        public bool IsConfigured
        {
            get
            {
                string packageName = _config["GooglePlay:PackageName"];
                bool hasCredential =
                    !string.IsNullOrWhiteSpace(_config["GooglePlay:ServiceAccountJsonPath"])
                    || !string.IsNullOrWhiteSpace(_config["GooglePlay:ServiceAccountJson"]);
                return !string.IsNullOrWhiteSpace(packageName) && hasCredential;
            }
        }

        public async Task<GooglePlayVerificationResult> VerifySubscriptionAsync(
            string productId,
            string purchaseToken,
            CancellationToken cancellationToken = default)
        {
            if (!IsConfigured)
            {
                return new GooglePlayVerificationResult { Configured = false };
            }

            string packageName = _config["GooglePlay:PackageName"]!.Trim();

            GoogleCredential credential = BuildCredential().CreateScoped(Scope);
            string accessToken = await credential
                .UnderlyingCredential
                .GetAccessTokenForRequestAsync("https://oauth2.googleapis.com/token", cancellationToken);

            string url = "https://androidpublisher.googleapis.com/androidpublisher/v3/applications/"
                + Uri.EscapeDataString(packageName)
                + "/purchases/subscriptionsv2/tokens/"
                + Uri.EscapeDataString(purchaseToken);

            using (HttpClient http = new HttpClient())
            {
                http.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                http.DefaultRequestHeaders.TryAddWithoutValidation("Accept", "application/json");

                using (HttpResponseMessage response = await http.GetAsync(url, cancellationToken))
                {
                    string body = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        return new GooglePlayVerificationResult
                        {
                            Configured = true,
                            Active = false,
                            Message = "Google Play rejected the purchase (HTTP " + (int)response.StatusCode + ")."
                        };
                    }

                    JObject json = JObject.Parse(body);

                    // Active and in-grace-period subscriptions still grant access;
                    // canceled/expired/on-hold ones do not.
                    string state = (string?)json["subscriptionState"] ?? "";
                    bool active = state.Equals("SUBSCRIPTION_STATE_ACTIVE", StringComparison.OrdinalIgnoreCase)
                        || state.Equals("SUBSCRIPTION_STATE_IN_GRACE_PERIOD", StringComparison.OrdinalIgnoreCase);

                    DateTime? expiryUtc = null;
                    if (json["lineItems"] is JArray lineItems && lineItems.Count > 0)
                    {
                        JToken? item = lineItems.FirstOrDefault(li =>
                            string.Equals((string?)li["productId"], productId, StringComparison.OrdinalIgnoreCase))
                            ?? lineItems[0];

                        string expiry = (string?)item["expiryTime"] ?? "";
                        if (!string.IsNullOrWhiteSpace(expiry)
                            && DateTime.TryParse(
                                expiry,
                                CultureInfo.InvariantCulture,
                                DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal,
                                out DateTime parsed))
                        {
                            expiryUtc = parsed;
                        }
                    }

                    return new GooglePlayVerificationResult
                    {
                        Configured = true,
                        Active = active,
                        ExpiryUtc = expiryUtc,
                        Message = active ? null : "This subscription is not active."
                    };
                }
            }
        }

        private GoogleCredential BuildCredential()
        {
            string path = _config["GooglePlay:ServiceAccountJsonPath"];
            if (!string.IsNullOrWhiteSpace(path) && File.Exists(path))
            {
                return GoogleCredential.FromFile(path);
            }

            string json = _config["GooglePlay:ServiceAccountJson"];
            if (!string.IsNullOrWhiteSpace(json))
            {
                return GoogleCredential.FromJson(json);
            }

            throw new InvalidOperationException("Google Play service account credentials are missing.");
        }
    }

    public class GooglePlayVerificationResult
    {
        /// <summary>True when Play credentials were present and the token was checked.</summary>
        public bool Configured { get; set; }

        /// <summary>True only when the subscription is active (or in its grace period).</summary>
        public bool Active { get; set; }

        /// <summary>Subscription expiry in UTC, when the store reported one.</summary>
        public DateTime? ExpiryUtc { get; set; }

        public string? Message { get; set; }
    }
}
