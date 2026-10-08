namespace MdLabScience.DbContext
{
    // One row per "upgrade to Pro" request raised by a trial user in the app.
    // The plan NEVER changes until an administrator approves the row from the
    // admin panel (Users & Access -> Pro Requests).
    public partial class ProUpgradeRequestTb
    {
        public int ProUpgradeRequestId { get; set; }
        public int AppUserId { get; set; }
        public int ApplicantId { get; set; }
        public System.DateTime RequestedOn { get; set; }
        // Pending | Approved | Rejected
        public string Status { get; set; } = "Pending";
        public System.DateTime? ResolvedOn { get; set; }
        // Number of Pro months granted when the request was approved.
        public int? ApprovedMonths { get; set; }
    }
}
