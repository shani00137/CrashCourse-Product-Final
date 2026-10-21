namespace MdLabScience.Models
{
    // Sent by the mobile app when the user taps "Subscribe" / "Buy Now" on the
    // paywall. The server creates a Stripe PaymentIntent — reading the amount
    // from the course object — and returns the client secret the native Stripe
    // SDK needs to open the PaymentSheet.
    public class StripeIntentionModel
    {
        public int AppUserId { get; set; }

        // Optional: the course the user is buying from the course store. When
        // set, the server prices the PaymentIntent from CourseTb.SaleRate and
        // enrolls the applicant in that course once the payment is confirmed.
        public int? CourseId { get; set; }

        // Optional: add the AI Assistant add-on ($10 static) to this payment.
        // When true the amount includes the add-on and the paid user is granted
        // AI access.
        public bool IncludeAIAssistant { get; set; }
    }

    // Sent by the mobile app after the Stripe SDK reports a successful payment.
    // The server re-checks the PaymentIntent with Stripe before granting
    // access, so a tampered client response can never activate an account.
    public class StripeConfirmModel
    {
        public int AppUserId { get; set; }

        // Stripe PaymentIntent id reported by the native SDK (best effort).
        public string? PaymentIntentId { get; set; }

        public int? CourseId { get; set; }

        // When true the user bought the AI Assistant add-on; the server enables
        // AI access once the payment is verified.
        public bool IncludeAIAssistant { get; set; }
    }
}
