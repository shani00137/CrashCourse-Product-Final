namespace MdLabScience.DbContext
{
    using System;
    public partial class AppUserTb
    {
        public int AppUserRecordId { get; set; }
        public int AppUserId { get; set; }
        public int ApplicantId { get; set; }
        public bool Status { get; set; }
        public System.DateTime CreateOn { get; set; }
        public Nullable<System.DateTime> LoginOn { get; set; }
        public string? DeviceId { get; set; }
        public string? UserName { get; set; }
        public string? Password { get; set; }
        public string? Token { get; set; }
    }
}
