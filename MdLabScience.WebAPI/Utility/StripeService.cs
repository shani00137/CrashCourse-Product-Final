using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;
using System;
using System.Globalization;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace MdLabScience.Utility
{
    /// <summary>
    /// Server-side helper around Stripe's PaymentIntents API for the mobile
    /// course / Pro purchase. Replaces the previous Paymob integration.
    ///
    /// Flow:
    ///   1. The mobile app asks the backend to create a PaymentIntent for the
    ///      course the user tapped (the amount is read from the course object,
    ///      CourseTb.SaleRate — never trusted from the client).
    ///   2. <see cref="CreatePaymentIntentAsync"/> returns the PaymentIntent's
    ///      <c>client_secret</c>, which the native Stripe SDK uses to open the
    ///      PaymentSheet (card + Google Pay).
    ///   3. After the payment the app calls the backend Confirm endpoint, which
    ///      retrieves the PaymentIntent with the secret key and only grants
    ///      access when it is genuinely <c>succeeded</c>. Stripe also posts a
    ///       server-to-server webhook that the controller verifies with
    ///      <see cref="VerifyWebhookSignature"/>; both paths activate access.
    ///
    /// Configuration (appsettings.json → "Stripe"):
    ///   SecretKey      - secret API key (sk_...). Server only, never shipped.
    ///   PublishableKey - publishable key (pk_...) handed to the mobile SDK.
    ///   WebhookSecret  - signing secret (whsec_...) used to verify webhooks.
    ///   Currency       - ISO currency code, default PKR.
    ///   ProMonths      - how many months a single payment grants (default 1).
    ///   ProAmountCents - price of one Pro month in the smallest unit; when 0
    ///                    the Pro-only paywall is treated as unconfigured.
    ///
    /// When the required values are missing <see cref="IsConfigured"/> is false
    /// and callers fall back to the manual owner-approval flow.
    /// </summary>
    public class StripeService
    {
        private const string StripeApiBase = "https://api.stripe.com";

        private readonly IConfiguration _config;

        public StripeService(IConfiguration config)
        {
            _config = config;
        }

        private string SecretKey => _config["Stripe:SecretKey"]?.Trim() ?? "";
        public string PublishableKey => _config["Stripe:PublishableKey"]?.Trim() ?? "";
        private string WebhookSecret => _config["Stripe:WebhookSecret"]?.Trim() ?? "";

        public string Currency
        {
            get
            {
                string currency = _config["Stripe:Currency"]?.Trim() ?? "";
                return string.IsNullOrWhiteSpace(currency) ? "PKR" : currency.ToUpperInvariant();
            }
        }

        public int ProMonths
        {
            get
            {
                int months = int.TryParse(_config["Stripe:ProMonths"], out int m) ? m : 1;
                return months > 0 ? months : 1;
            }
        }

        /// <summary>Price of one Pro month, in the currency's smallest unit.</summary>
        public int ProAmountCents =>
            int.TryParse(_config["Stripe:ProAmountCents"], out int amount) ? amount : 0;

        /// <summary>
        /// Base price of the AI Assistant add-on in whole US dollars, as a
        /// static amount (default 10). Charged to every buyer identically.
        /// </summary>
        public double AIAssistantUsd
        {
            get
            {
                double usd = double.TryParse(
                    _config["Stripe:AIAssistantUsd"],
                    NumberStyles.Any,
                    CultureInfo.InvariantCulture,
                    out double value)
                    ? value
                    : 10.0;
                return usd > 0 ? usd : 10.0;
            }
        }

        /// <summary>
        /// Fixed conversion rate applied to <see cref="AIAssistantUsd"/> so the
        /// add-on can be charged in the configured (non-USD) currency without a
        /// live FX lookup. e.g. 280 → $10 ≈ PKR 2,800. Defaults to 1 (treat the
        /// base as already being in the gateway currency).
        /// </summary>
        public double AIAssistantRate
        {
            get
            {
                double rate = double.TryParse(
                    _config["Stripe:AIAssistantRate"],
                    NumberStyles.Any,
                    CultureInfo.InvariantCulture,
                    out double value)
                    ? value
                    : 1.0;
                return rate > 0 ? rate : 1.0;
            }
        }

        /// <summary>
        /// Price of the AI Assistant add-on in the currency's smallest unit:
        /// the static USD base converted by the fixed rate.
        /// </summary>
        public long AIAssistantAmountMinorUnits =>
            ToMinorUnits(AIAssistantUsd * AIAssistantRate);

        /// <summary>
        /// True when the server can talk to Stripe at all. Course purchases only
        /// need a secret key (the amount comes from the course); the Pro-only
        /// paywall additionally needs a positive <see cref="ProAmountCents"/>.
        /// </summary>
        public bool IsConfigured => !string.IsNullOrWhiteSpace(SecretKey);

        /// <summary>
        /// Converts a major-unit amount from the course object into Stripe's
        /// smallest currency unit. Uses decimal to avoid binary floating point
        /// drift on values like 12,500.50.
        /// </summary>
        public static long ToMinorUnits(double amount)
        {
            return (long)Math.Round((decimal)amount * 100m, MidpointRounding.AwayFromZero);
        }

        /// <summary>
        /// Creates a PaymentIntent for the given amount (already in the smallest
        /// currency unit) and returns its client secret. The metadata carries the
        /// app user, applicant and course so the webhook can map the payment back
        /// without a dedicated lookup table.
        /// </summary>
        public async Task<StripePaymentIntentResult> CreatePaymentIntentAsync(
            long amountMinorUnits,
            StripeIntentionContext context,
            CancellationToken cancellationToken = default)
        {
            if (!IsConfigured)
            {
                return new StripePaymentIntentResult
                {
                    Configured = false,
                    Succeeded = false,
                    Message = "Card payments aren't configured yet."
                };
            }

            if (amountMinorUnits <= 0)
            {
                return new StripePaymentIntentResult
                {
                    Configured = true,
                    Succeeded = false,
                    Message = "This course has no price configured."
                };
            }

            try
            {
                using (HttpClient http = CreateClient())
                using (FormUrlEncodedContent content = new FormUrlEncodedContent(
                    BuildPaymentIntentForm(amountMinorUnits, context)))
                using (HttpResponseMessage response = await http.PostAsync(
                    StripeApiBase + "/v1/payment_intents", content, cancellationToken))
                {
                    string body = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        return new StripePaymentIntentResult
                        {
                            Configured = true,
                            Succeeded = false,
                            Message = ExtractStripeError(body)
                                ?? "Stripe rejected the request (HTTP " + (int)response.StatusCode + ")."
                        };
                    }

                    JObject json = JObject.Parse(body);
                    string? clientSecret = (string?)json["client_secret"];
                    if (string.IsNullOrWhiteSpace(clientSecret))
                    {
                        return new StripePaymentIntentResult
                        {
                            Configured = true,
                            Succeeded = false,
                            Message = "Stripe did not return a client secret."
                        };
                    }

                    return new StripePaymentIntentResult
                    {
                        Configured = true,
                        Succeeded = true,
                        PaymentIntentId = (string?)json["id"],
                        ClientSecret = clientSecret,
                        AmountCents = amountMinorUnits,
                        Currency = Currency
                    };
                }
            }
            catch (Exception ex)
            {
                return new StripePaymentIntentResult
                {
                    Configured = true,
                    Succeeded = false,
                    Message = "We couldn't reach the payment provider. Please try again. (" + ex.Message + ")"
                };
            }
        }

        /// <summary>
        /// Retrieves a PaymentIntent so the server can independently confirm it
        /// succeeded before granting access. The amount is also checked against
        /// the expected value, so a tampered client can't pay less for more.
        /// </summary>
        public async Task<StripePaymentIntentResult> RetrievePaymentIntentAsync(
            string paymentIntentId,
            CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(paymentIntentId) || !IsConfigured)
            {
                return new StripePaymentIntentResult
                {
                    Configured = IsConfigured,
                    Succeeded = false,
                    Message = "Transaction couldn't be confirmed yet."
                };
            }

            try
            {
                using (HttpClient http = CreateClient())
                using (HttpResponseMessage response = await http.GetAsync(
                    StripeApiBase + "/v1/payment_intents/" + Uri.EscapeDataString(paymentIntentId),
                    cancellationToken))
                {
                    string body = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        return new StripePaymentIntentResult
                        {
                            Configured = true,
                            Succeeded = false,
                            Message = ExtractStripeError(body)
                                ?? "Transaction wasn't found (HTTP " + (int)response.StatusCode + ")."
                        };
                    }

                    JObject json = JObject.Parse(body);
                    string status = (string?)json["status"] ?? "";
                    bool succeeded = status == "succeeded";
                    bool processing = status == "processing" || status == "requires_capture";

                    // The metadata carries whether this payment included the AI
                    // Assistant add-on, so the server never trusts the client.
                    JObject? metadata = (JObject?)json["metadata"];
                    bool includesAI = string.Equals(
                        (string?)metadata?["includeAIAssistant"],
                        "true",
                        StringComparison.OrdinalIgnoreCase);

                    return new StripePaymentIntentResult
                    {
                        Configured = true,
                        Succeeded = true,
                        Paid = succeeded,
                        Pending = processing,
                        PaymentIntentId = (string?)json["id"],
                        AmountCents = json["amount"]?.Type == JTokenType.Integer
                            ? (long)json["amount"]!
                            : (long?)null,
                        Currency = ((string?)json["currency"] ?? "").ToUpperInvariant(),
                        Status = status,
                        IncludesAIAssistant = includesAI,
                        Message = succeeded ? null : "This payment wasn't completed."
                    };
                }
            }
            catch (Exception ex)
            {
                return new StripePaymentIntentResult
                {
                    Configured = true,
                    Succeeded = false,
                    Message = "We couldn't confirm this payment right now. (" + ex.Message + ")"
                };
            }
        }

        /// <summary>
        /// Validates the <c>Stripe-Signature</c> header of a webhook using the
        /// standard "t=timestamp,v1=signature" scheme (HMAC-SHA256 over
        /// "{timestamp}.{payload}"). Returns false when unsigned or mismatched.
        /// </summary>
        public bool VerifyWebhookSignature(string payload, string? signatureHeader)
        {
            if (string.IsNullOrWhiteSpace(WebhookSecret) || string.IsNullOrWhiteSpace(signatureHeader))
            {
                return false;
            }

            string? timestamp = null;
            string? received = null;

            foreach (string part in signatureHeader.Split(','))
            {
                string[] pair = part.Split('=', 2);
                if (pair.Length != 2) continue;
                if (pair[0] == "t") timestamp = pair[1];
                else if (pair[0] == "v1") received = pair[1];
            }

            if (string.IsNullOrWhiteSpace(timestamp) || string.IsNullOrWhiteSpace(received))
            {
                return false;
            }

            string signedPayload = timestamp + "." + payload;
            byte[] key = Encoding.UTF8.GetBytes(WebhookSecret);
            byte[] bytes = Encoding.UTF8.GetBytes(signedPayload);

            using (HMACSHA256 hmac = new HMACSHA256(key))
            {
                string computed = BitConverter
                    .ToString(hmac.ComputeHash(bytes))
                    .Replace("-", "")
                    .ToLowerInvariant();
                return FixedTimeEquals(computed, received.Trim().ToLowerInvariant());
            }
        }

        private HttpClient CreateClient()
        {
            HttpClient http = new HttpClient();
            http.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", SecretKey);
            http.DefaultRequestHeaders.TryAddWithoutValidation("Accept", "application/json");
            http.DefaultRequestHeaders.TryAddWithoutValidation("Stripe-Version", "2024-06-20");
            return http;
        }

        private System.Collections.Generic.List<System.Collections.Generic.KeyValuePair<string, string>>
            BuildPaymentIntentForm(long amount, StripeIntentionContext context)
        {
            var form = new System.Collections.Generic.List<System.Collections.Generic.KeyValuePair<string, string>>
            {
                new("amount", amount.ToString(CultureInfo.InvariantCulture)),
                new("currency", Currency.ToLowerInvariant()),
                new("automatic_payment_methods[enabled]", "true"),
                new("description", string.IsNullOrWhiteSpace(context.ItemName)
                    ? "Crash Course payment"
                    : context.ItemName),
                new("metadata[appUserId]", context.AppUserId.ToString(CultureInfo.InvariantCulture)),
                new("metadata[applicantId]", context.ApplicantId.ToString(CultureInfo.InvariantCulture)),
                new("metadata[courseId]", (context.CourseId ?? 0).ToString(CultureInfo.InvariantCulture)),
                new("metadata[includeAIAssistant]", context.IncludeAIAssistant ? "true" : "false"),
                new("metadata[months]", context.Months.ToString(CultureInfo.InvariantCulture))
            };

            if (!string.IsNullOrWhiteSpace(context.Email))
            {
                form.Add(new("receipt_email", context.Email));
            }

            return form;
        }

        private static string? ExtractStripeError(string body)
        {
            try
            {
                JObject json = JObject.Parse(body);
                string? message = (string?)json["error"]?["message"];
                return string.IsNullOrWhiteSpace(message) ? null : message;
            }
            catch
            {
                return null;
            }
        }

        // Constant-time comparison so signature checking doesn't leak timing.
        private static bool FixedTimeEquals(string a, string b)
        {
            if (a.Length != b.Length) return false;
            int diff = 0;
            for (int i = 0; i < a.Length; i++)
            {
                diff |= a[i] ^ b[i];
            }
            return diff == 0;
        }
    }

    public class StripeIntentionContext
    {
        public int AppUserId { get; set; }
        public int ApplicantId { get; set; }
        public int? CourseId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? ItemName { get; set; }
        public int Months { get; set; } = 1;
        // When true the payment also covers the AI Assistant add-on, and the
        // paid user gets IsAIAllowed enabled.
        public bool IncludeAIAssistant { get; set; }
    }

    public class StripePaymentIntentResult
    {
        public bool Configured { get; set; }
        public bool Succeeded { get; set; }
        public bool Paid { get; set; }
        public bool Pending { get; set; }
        public string? PaymentIntentId { get; set; }
        public string? ClientSecret { get; set; }
        public long? AmountCents { get; set; }
        public string Currency { get; set; } = "";
        public string? Status { get; set; }
        public string? Message { get; set; }
        // Whether the PaymentIntent's metadata says the AI add-on was included.
        public bool IncludesAIAssistant { get; set; }
    }
}
