namespace MdLabScience.Models
{
    // Sent by the mobile app when a trial user asks for the Pro version.
    // The plan is NOT changed by this request — the owner approves it manually.
    public class RequestProUpgradeModel
    {
        public int AppUserId { get; set; }
    }
}
