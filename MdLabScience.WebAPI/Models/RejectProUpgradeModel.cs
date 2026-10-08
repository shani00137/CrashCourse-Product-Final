namespace MdLabScience.Models
{
    // Sent by the admin panel when the owner rejects a trial user's
    // "upgrade to Pro" request. The plan stays unchanged.
    public class RejectProUpgradeModel
    {
        public int ProUpgradeRequestId { get; set; }
    }
}
