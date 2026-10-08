namespace MdLabScience.Models
{
    // Sent by the admin panel when the owner approves a trial user's
    // "upgrade to Pro" request. Months defaults to 12 when omitted.
    public class ApproveProUpgradeModel
    {
        public int ProUpgradeRequestId { get; set; }
        public int? Months { get; set; }
    }
}
