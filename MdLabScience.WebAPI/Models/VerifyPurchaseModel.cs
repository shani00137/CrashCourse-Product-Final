namespace MdLabScience.Models
{
    // Sent by the mobile app after a Google Play subscription purchase so the
    // server can validate the purchase token before granting Pro access.
    public class VerifyPurchaseModel
    {
        public int AppUserId { get; set; }
        public string ProductId { get; set; }
        public string PurchaseToken { get; set; }
        // "google" (Play) — reserved for other stores in the future.
        public string Platform { get; set; }
        // Optional: the extra course the user is buying. When set, the server
        // enrolls the applicant in that course as part of the same purchase.
        public int? CourseId { get; set; }
    }
}
