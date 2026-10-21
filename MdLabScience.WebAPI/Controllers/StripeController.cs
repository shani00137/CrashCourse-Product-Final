using MdLabScience.DbContext;
using MdLabScience.Models;
using MdLabScience.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace MdLabScience.Controllers
{
    // Mobile app payments for course purchases and the Pro subscription,
    // processed through Stripe instead of the app stores. The native Stripe SDK
    // opens the PaymentSheet (card + Google Pay); the backend is the single
    // source of truth: it prices the payment from the course object and only
    // ever grants access after Stripe itself confirms the PaymentIntent (via an
    // authenticated retrieve or the signed webhook).
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class StripeController : ControllerBase
    {
        private static readonly TimeZoneInfo Pakistan_Standard_Time =
            TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");

        private readonly Microsoft.Extensions.Configuration.IConfiguration _config;

        public StripeController(Microsoft.Extensions.Configuration.IConfiguration config)
        {
            _config = config;
        }

        private bool IsAdmin =>
            string.Equals(User.FindFirst("UserType")?.Value, "Admin", StringComparison.OrdinalIgnoreCase);

        private string CurrentUserId =>
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "";

        // Tells the app (a) whether card payments are configured at all and
        // (b) the publishable key + Pro price to display on the paywall, so
        // neither is hardcoded in the client. Anonymous: the publishable key and
        // price are public, and this keeps the paywall working with a slightly
        // stale token.
        [AllowAnonymous]
        [AcceptVerbs("GET", "POST")]
        [Route("api/Stripe/Plan")]
        public IActionResult Plan()
        {
            StripeService service = new StripeService(_config);
            return Ok(new
            {
                configured = service.IsConfigured,
                publishableKey = service.PublishableKey,
                amountCents = service.ProAmountCents,
                currency = service.Currency,
                months = service.ProMonths,
                // Optional AI Assistant add-on the app can offer at checkout.
                aiAssistantAvailable = service.AIAssistantAmountMinorUnits > 0,
                aiAssistantAmountCents = service.AIAssistantAmountMinorUnits,
                aiAssistantUsd = service.AIAssistantUsd
            });
        }

        // Creates a Stripe PaymentIntent for the signed-in user and returns the
        // client secret the native SDK needs to open the PaymentSheet. The
        // amount comes from the course object (CourseTb.SaleRate); the
        // Pro-only paywall falls back to the configured Pro price.
        [HttpPost]
        [Route("api/Stripe/CreatePaymentIntent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] StripeIntentionModel value)
        {
            try
            {
                if (!IsAdmin && (string.IsNullOrEmpty(CurrentUserId) || CurrentUserId != value.AppUserId.ToString()))
                {
                    return StatusCode(403, new
                    {
                        succeeded = false,
                        configured = false,
                        message = "You can only pay for your own account."
                    });
                }

                if (value.AppUserId <= 0)
                {
                    return Ok(new { succeeded = false, configured = false, message = "Missing account details." });
                }

                StripeService service = new StripeService(_config);
                if (!service.IsConfigured)
                {
                    return Ok(new
                    {
                        succeeded = false,
                        configured = false,
                        message = "Card payments aren't available right now."
                    });
                }

                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var appUser = db.AppUserTbs.Where(x => x.AppUserId == value.AppUserId).FirstOrDefault();
                    if (appUser == null)
                    {
                        return Ok(new { succeeded = false, configured = true, message = "User not found." });
                    }

                    var applicant = db.ApplicantsTbs.Where(x => x.ApplicantId == appUser.ApplicantId).FirstOrDefault();
                    if (applicant == null)
                    {
                        return Ok(new { succeeded = false, configured = true, message = "Applicant not found." });
                    }

                    int? courseId = value.CourseId.HasValue && value.CourseId.Value > 0
                        ? value.CourseId
                        : (int?)null;

                    // Price the payment. When a course is being bought the cost
                    // is the course's sale rate; otherwise it's the Pro price.
                    long amountMinorUnits;
                    string itemName;

                    if (courseId.HasValue)
                    {
                        var course = db.CourseTbs.Where(x => x.CourseId == courseId.Value).FirstOrDefault();
                        if (course == null)
                        {
                            return Ok(new { succeeded = false, configured = true, message = "Course not found." });
                        }

                        amountMinorUnits = StripeService.ToMinorUnits(course.SaleRate);
                        itemName = course.CourseName ?? "Course access";
                    }
                    else
                    {
                        amountMinorUnits = service.ProAmountCents;
                        itemName = "Pro subscription (" + service.ProMonths + " month)";
                    }

                    // Optional AI Assistant add-on ($10 static, converted by the
                    // fixed rate). Added on top of the course / Pro price.
                    bool includeAI = value.IncludeAIAssistant;
                    long aiAmountMinorUnits = 0;
                    if (includeAI)
                    {
                        aiAmountMinorUnits = service.AIAssistantAmountMinorUnits;
                        amountMinorUnits += aiAmountMinorUnits;
                        itemName += " + AI Assistant";
                    }

                    if (amountMinorUnits <= 0)
                    {
                        return Ok(new
                        {
                            succeeded = false,
                            configured = true,
                            message = "This item has no price configured."
                        });
                    }

                    StripeIntentionContext context = new StripeIntentionContext
                    {
                        AppUserId = value.AppUserId,
                        ApplicantId = applicant.ApplicantId ?? 0,
                        CourseId = courseId,
                        FirstName = applicant.FirstName,
                        LastName = applicant.LastName,
                        Email = applicant.Email,
                        Phone = applicant.Mobile,
                        ItemName = itemName,
                        Months = service.ProMonths,
                        IncludeAIAssistant = includeAI
                    };

                    StripePaymentIntentResult result =
                        await service.CreatePaymentIntentAsync(amountMinorUnits, context);

                    return Ok(new
                    {
                        succeeded = result.Succeeded,
                        configured = result.Configured,
                        clientSecret = result.ClientSecret,
                        publishableKey = service.PublishableKey,
                        paymentIntentId = result.PaymentIntentId,
                        amountCents = result.AmountCents ?? amountMinorUnits,
                        currency = service.Currency,
                        months = service.ProMonths,
                        includeAIAssistant = includeAI,
                        aiAssistantAmountCents = aiAmountMinorUnits,
                        message = result.Message ?? (result.Succeeded ? "Payment session ready." : "Couldn't start the payment.")
                    });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { succeeded = false, configured = true, message = ex.Message });
            }
        }

        // Called by the app after the native Stripe SDK reports success. The
        // server re-checks the PaymentIntent with Stripe; if that can't be done
        // it records a manual owner-approval request rather than trusting the
        // client. The paid amount is matched against the expected course price.
        [HttpPost]
        [Route("api/Stripe/Confirm")]
        public async Task<IActionResult> Confirm([FromBody] StripeConfirmModel value)
        {
            try
            {
                if (!IsAdmin && (string.IsNullOrEmpty(CurrentUserId) || CurrentUserId != value.AppUserId.ToString()))
                {
                    return StatusCode(403, new
                    {
                        succeeded = false,
                        verified = false,
                        pending = false,
                        message = "You can only confirm a payment for your own account."
                    });
                }

                if (value.AppUserId <= 0)
                {
                    return Ok(new { succeeded = false, verified = false, pending = false, message = "Missing account details." });
                }

                StripeService service = new StripeService(_config);

                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var appUser = db.AppUserTbs.Where(x => x.AppUserId == value.AppUserId).FirstOrDefault();
                    if (appUser == null)
                    {
                        return Ok(new { succeeded = false, verified = false, pending = false, message = "User not found." });
                    }

                    var applicant = db.ApplicantsTbs.Where(x => x.ApplicantId == appUser.ApplicantId).FirstOrDefault();
                    if (applicant == null)
                    {
                        return Ok(new { succeeded = false, verified = false, pending = false, message = "Applicant not found." });
                    }

                    int? courseId = value.CourseId.HasValue && value.CourseId.Value > 0
                        ? value.CourseId
                        : (int?)null;

                    long expectedAmount = ExpectedAmountMinorUnits(db, service, courseId);

                    if (service.IsConfigured && !string.IsNullOrWhiteSpace(value.PaymentIntentId))
                    {
                        StripePaymentIntentResult intent =
                            await service.RetrievePaymentIntentAsync(value.PaymentIntentId!);

                        if (intent.Succeeded && intent.Paid)
                        {
                            if (expectedAmount > 0
                                && intent.AmountCents.HasValue
                                && intent.AmountCents.Value < expectedAmount)
                            {
                                return Ok(new
                                {
                                    succeeded = false,
                                    verified = false,
                                    pending = false,
                                    message = "The paid amount doesn't match the course price."
                                });
                            }

                            DateTime nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                            // The add-on is honoured from the PaymentIntent's
                            // metadata when Stripe reports it; otherwise fall
                            // back to the client flag (guarded by the amount
                            // check above).
                            bool includeAI = intent.IncludesAIAssistant || value.IncludeAIAssistant;
                            ActivateAccess(db, value.AppUserId, applicant, courseId, nowLocal, service.ProMonths, value.PaymentIntentId, includeAI);

                            return Ok(new
                            {
                                succeeded = true,
                                verified = true,
                                pending = false,
                                isActive = applicant.IsActive,
                                isAIAllowed = includeAI ? true : (bool?)null,
                                expiryDate = applicant.ExpiryDate,
                                message = courseId.HasValue
                                    ? (includeAI
                                        ? "Payment confirmed. This course and the AI Assistant are now unlocked."
                                        : "Payment confirmed. This course is now unlocked.")
                                    : (includeAI
                                        ? "Payment confirmed. Your Pro access and AI Assistant are now active."
                                        : "Payment confirmed. Your Pro access is now active.")
                            });
                        }

                        if (intent.Succeeded && intent.Pending)
                        {
                            return Ok(new
                            {
                                succeeded = true,
                                verified = false,
                                pending = true,
                                message = "Your payment is still processing. We'll unlock access as soon as it clears."
                            });
                        }

                        if (intent.Configured && intent.Succeeded && !intent.Paid && !intent.Pending)
                        {
                            return Ok(new
                            {
                                succeeded = false,
                                verified = false,
                                pending = false,
                                message = intent.Message ?? "This payment wasn't completed."
                            });
                        }
                    }

                    // Couldn't independently confirm the payment (no payment
                    // intent id, missing secret key, or Stripe unreachable).
                    // Record an owner approval request so nothing is activated
                    // on trust alone.
                    DateTime requestedOn = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                    RecordPendingApproval(db, value.AppUserId, applicant.ApplicantId ?? 0, courseId, requestedOn);

                    return Ok(new
                    {
                        succeeded = true,
                        verified = false,
                        pending = true,
                        message = "Payment received. Your access will be activated after a quick verification."
                    });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { succeeded = false, verified = false, pending = false, message = ex.Message });
            }
        }

        // Server-to-server webhook from Stripe. Anonymous on purpose — it is
        // authenticated by the Stripe-Signature header, not a bearer token.
        [HttpPost]
        [AllowAnonymous]
        [Route("api/Stripe/Webhook")]
        public async Task<IActionResult> Webhook()
        {
            try
            {
                string raw;
                using (StreamReader reader = new StreamReader(Request.Body))
                {
                    raw = await reader.ReadToEndAsync();
                }

                if (string.IsNullOrWhiteSpace(raw))
                {
                    return BadRequest();
                }

                StripeService service = new StripeService(_config);
                if (!service.VerifyWebhookSignature(raw, Request.Headers["Stripe-Signature"]))
                {
                    return Unauthorized();
                }

                JObject evt = JObject.Parse(raw);
                string eventType = (string?)evt["type"] ?? "";

                // Only settled, successful payments grant access.
                if (eventType != "payment_intent.succeeded")
                {
                    return Ok();
                }

                JObject intent = (JObject?)evt["data"]?["object"] ?? new JObject();
                JObject metadata = (JObject?)intent["metadata"] ?? new JObject();

                int.TryParse((string?)metadata["appUserId"], out int appUserId);
                int.TryParse((string?)metadata["courseId"], out int courseId);
                bool includeAI = string.Equals(
                    (string?)metadata["includeAIAssistant"],
                    "true",
                    StringComparison.OrdinalIgnoreCase);

                if (appUserId <= 0)
                {
                    // Verified but unmappable — acknowledge so Stripe stops retrying.
                    return Ok();
                }

                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var appUser = db.AppUserTbs.Where(x => x.AppUserId == appUserId).FirstOrDefault();
                    if (appUser == null)
                    {
                        return Ok();
                    }

                    var applicant = db.ApplicantsTbs.Where(x => x.ApplicantId == appUser.ApplicantId).FirstOrDefault();
                    if (applicant == null)
                    {
                        return Ok();
                    }

                    DateTime nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                    ActivateAccess(
                        db,
                        appUserId,
                        applicant,
                        courseId > 0 ? courseId : (int?)null,
                        nowLocal,
                        service.ProMonths,
                        (string?)intent["id"],
                        includeAI);

                    return Ok();
                }
            }
            catch
            {
                return Ok();
            }
        }

        // The expected price (smallest unit) for the item being paid for:
        // the course's sale rate when a course is set, otherwise the Pro price.
        private static long ExpectedAmountMinorUnits(
            MdLabScienceDbEntities db,
            StripeService service,
            int? courseId)
        {
            if (courseId.HasValue)
            {
                var course = db.CourseTbs.Where(x => x.CourseId == courseId.Value).FirstOrDefault();
                return course == null ? 0 : StripeService.ToMinorUnits(course.SaleRate);
            }

            return service.ProAmountCents;
        }

        // Grants/renews Pro access and, when the purchase included a course,
        // enrolls the applicant in it. Mirrors the store-purchase activation so
        // every payment path behaves identically. Also records an invoice for
        // the payment and emails the user a receipt.
        private void ActivateAccess(
            MdLabScienceDbEntities db,
            int appUserId,
            ApplicantsTb applicant,
            int? courseId,
            DateTime nowLocal,
            int months,
            string? paymentIntentId = null,
            bool includeAIAssistant = false)
        {
            if (!applicant.RegistrationDate.HasValue)
            {
                applicant.RegistrationDate = nowLocal;
            }

            applicant.ExpiryDate = nowLocal.AddMonths(months > 0 ? months : 1);
            applicant.IsActive = applicant.ExpiryDate > nowLocal;

            // A paid AI Assistant add-on enables AI for this mobile user.
            if (includeAIAssistant)
            {
                var appUser = db.AppUserTbs.Where(x => x.AppUserId == appUserId).FirstOrDefault();
                if (appUser != null)
                {
                    appUser.IsAIAllowed = true;
                }
            }

            var openRequests = db.ProUpgradeRequestTbs
                .Where(x => x.AppUserId == appUserId && x.Status == "Pending")
                .ToList();
            foreach (var request in openRequests)
            {
                request.Status = "Approved";
                request.ResolvedOn = nowLocal;
            }

            SetApplicantCourse(db, applicant.ApplicantId ?? 0, courseId ?? 0);

            db.SaveChanges();

            // Build the invoice + send the receipt. Idempotent: the webhook and
            // the client Confirm can both land for the same payment, and each
            // must not create a second invoice.
            CreateInvoiceForPayment(db, applicant, courseId, nowLocal, months, paymentIntentId, includeAIAssistant);
        }

        // Records an ApplicantInvoiceTB (+ line item and a transaction row) for a
        // paid Stripe payment and emails the user a receipt. Keyed off the
        // PaymentIntent id in Remarks so the webhook and Confirm paths never
        // double-invoice the same payment.
        private void CreateInvoiceForPayment(
            MdLabScienceDbEntities db,
            ApplicantsTb applicant,
            int? courseId,
            DateTime nowLocal,
            int months,
            string? paymentIntentId,
            bool includeAIAssistant = false)
        {
            try
            {
                int applicantId = applicant.ApplicantId ?? 0;
                if (applicantId <= 0) return;

                string reference = string.IsNullOrWhiteSpace(paymentIntentId)
                    ? ""
                    : "Stripe PaymentIntent " + paymentIntentId.Trim();

                // Idempotency: if this payment was already invoiced, do nothing.
                if (!string.IsNullOrWhiteSpace(paymentIntentId)
                    && db.ApplicantInvoiceTBs.Any(x => x.Remarks == reference))
                {
                    return;
                }

                // Price from the course object (or the Pro price) in major units.
                double amountMajor;
                string itemName;
                string currency = new StripeService(_config).Currency;

                if (courseId.HasValue && courseId.Value > 0)
                {
                    var course = db.CourseTbs.Where(x => x.CourseId == courseId.Value).FirstOrDefault();
                    amountMajor = course?.SaleRate ?? 0;
                    itemName = course?.CourseName ?? "Course access";
                }
                else
                {
                    amountMajor = new StripeService(_config).ProAmountCents / 100.0;
                    itemName = "Pro subscription (" + months + " month)";
                }

                // The AI Assistant add-on is billed on top of the base item.
                double aiMajor = includeAIAssistant
                    ? new StripeService(_config).AIAssistantAmountMinorUnits / 100.0
                    : 0;
                double totalMajor = amountMajor + aiMajor;

                int maxId = 1;
                var lastInvoice = db.ApplicantInvoiceTBs
                    .OrderByDescending(x => x.InvoiceId)
                    .FirstOrDefault();
                if (lastInvoice != null) maxId = lastInvoice.InvoiceId + 1;

                string invoiceNo = "INV-" + maxId;

                ApplicantInvoiceTB invoice = new ApplicantInvoiceTB
                {
                    DateTime = nowLocal,
                    Amount = totalMajor,
                    InvoiceNo = invoiceNo,
                    ApplicantId = applicantId,
                    Service = includeAIAssistant ? itemName + " + AI Assistant" : itemName,
                    Balance = 0,
                    PaidAmount = totalMajor,
                    Remarks = reference,
                    Currency = currency,
                    DiscountAmount = 0,
                    TaxAmount = 0
                };
                db.ApplicantInvoiceTBs.Add(invoice);
                db.SaveChanges();

                // Line item for the base purchase (course / Pro).
                db.CertificateInvoiceTbs.Add(new CertificateInvoiceTb
                {
                    Amount = amountMajor,
                    Service = itemName,
                    InvoiceId = invoice.InvoiceId,
                    PurchaseAmount = amountMajor,
                    IsCompleted = true
                });

                // Separate line item for the AI Assistant add-on, when bought.
                if (includeAIAssistant)
                {
                    db.CertificateInvoiceTbs.Add(new CertificateInvoiceTb
                    {
                        Amount = aiMajor,
                        Service = "AI Assistant add-on",
                        InvoiceId = invoice.InvoiceId,
                        PurchaseAmount = aiMajor,
                        IsCompleted = true
                    });
                }

                // Ledger row so the payment shows up in the applicant's statement.
                db.ApplicantTransactionTBs.Add(new ApplicantTransactionTB
                {
                    Debit = totalMajor,
                    Credit = totalMajor,
                    Reference = invoiceNo,
                    Remarks = currency,
                    ApplicantId = applicantId,
                    DateTime = nowLocal
                });
                db.SaveChanges();

                SendInvoiceEmail(applicant, invoiceNo, itemName, amountMajor, currency, nowLocal, months, courseId.HasValue, includeAIAssistant, aiMajor, totalMajor);
            }
            catch
            {
                // An invoicing/email problem must never fail an otherwise
                // successful payment confirmation.
            }
        }

        // Emails the user a receipt for a paid invoice.
        private void SendInvoiceEmail(
            ApplicantsTb applicant,
            string invoiceNo,
            string itemName,
            double amountMajor,
            string currency,
            DateTime nowLocal,
            int months,
            bool isCourse,
            bool includeAIAssistant = false,
            double aiMajor = 0,
            double totalMajor = 0)
        {
            if (string.IsNullOrWhiteSpace(applicant.Email)) return;

            string name = ((applicant.FirstName ?? "") + " " + (applicant.LastName ?? "")).Trim();
            if (string.IsNullOrEmpty(name)) name = "Student";

            string money(double value) =>
                currency + " " + value.ToString("N0", System.Globalization.CultureInfo.InvariantCulture);

            var rows = new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("Name", name),
                new KeyValuePair<string, string>("Invoice No", invoiceNo),
                new KeyValuePair<string, string>("Item", itemName),
                new KeyValuePair<string, string>("Item amount", money(amountMajor)),
            };

            if (includeAIAssistant)
            {
                rows.Add(new KeyValuePair<string, string>("AI Assistant add-on", money(aiMajor)));
            }

            rows.Add(new KeyValuePair<string, string>(
                "Amount paid",
                money(totalMajor > 0 ? totalMajor : amountMajor + aiMajor)));
            rows.Add(new KeyValuePair<string, string>("Date", nowLocal.ToString("yyyy-MM-dd HH:mm")));

            if (!isCourse)
            {
                rows.Add(new KeyValuePair<string, string>(
                    "Valid until",
                    applicant.ExpiryDate?.ToString("yyyy-MM-dd") ?? "-"));
            }
            else
            {
                rows.Add(new KeyValuePair<string, string>(
                    "Access",
                    "Full course access unlocked"));
            }

            if (includeAIAssistant)
            {
                rows.Add(new KeyValuePair<string, string>(
                    "AI Assistant",
                    "Enabled on your account"));
            }

            string body = EmailService.BuildInfoEmail(
                "Payment received - thank you!",
                "Your payment was successful and your invoice is below. "
                    + (isCourse
                        ? "The course is now unlocked on your account."
                        : "Pro access is now active on your account.")
                    + (includeAIAssistant ? " The AI Assistant is enabled too." : ""),
                rows,
                "This is an automatic receipt from the Crash Course app. "
                    + "Keep it for your records.");

            EmailService.SendFireAndForget(_config, applicant.Email, "Crash Course - payment receipt (" + invoiceNo + ")", body);
        }

        private void RecordPendingApproval(
            MdLabScienceDbEntities db,
            int appUserId,
            int applicantId,
            int? courseId,
            DateTime nowLocal)
        {
            var pending = db.ProUpgradeRequestTbs
                .Where(x => x.AppUserId == appUserId && x.Status == "Pending")
                .OrderByDescending(x => x.ProUpgradeRequestId)
                .FirstOrDefault();

            if (pending == null)
            {
                pending = new ProUpgradeRequestTb
                {
                    AppUserId = appUserId,
                    ApplicantId = applicantId,
                    RequestedOn = nowLocal,
                    Status = "Pending"
                };
                db.ProUpgradeRequestTbs.Add(pending);
            }
            else
            {
                pending.RequestedOn = nowLocal;
            }

            SetApplicantCourse(db, applicantId, courseId ?? 0);

            db.SaveChanges();
        }

        // Records the single course the applicant bought as their course
        // selection. A purchase covers exactly one course, so any selection
        // rows created earlier (e.g. the one registration auto-creates) are
        // replaced: the paid course becomes the applicant's course. CourseCode
        // is copied from CourseTb. Idempotent — re-buying the same course just
        // refreshes the existing row instead of creating a duplicate.
        private void SetApplicantCourse(MdLabScienceDbEntities db, int applicantId, int courseId)
        {
            if (applicantId <= 0 || courseId <= 0) return;

            var course = db.CourseTbs.Where(x => x.CourseId == courseId).FirstOrDefault();
            if (course == null) return;

            int courseCode = 0;
            if (!string.IsNullOrWhiteSpace(course.CourseCode))
            {
                int.TryParse(course.CourseCode, out courseCode);
            }

            DateTime nowLocal = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);

            var existing = db.ApplicantCourseSelectionTbs
                .Where(x => x.ApplicantId == applicantId)
                .ToList();

            // The row already pointing at the paid course, if any.
            var match = existing.FirstOrDefault(x => x.CourseId == courseId);

            // Drop every other selection: payment is for one course only.
            var stale = existing.Where(x => x.CourseId != courseId).ToList();
            if (stale.Count > 0)
            {
                db.ApplicantCourseSelectionTbs.RemoveRange(stale);
            }

            if (match != null)
            {
                match.CourseCode = courseCode;
                match.Date = nowLocal;
                return;
            }

            db.ApplicantCourseSelectionTbs.Add(new ApplicantCourseSelectionTb
            {
                ApplicantId = applicantId,
                CourseId = courseId,
                CourseCode = courseCode,
                Date = nowLocal
            });
        }
    }
}
