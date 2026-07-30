using System;

namespace MdLabScience.Models
{
    public class AppUserModel : ApplicantModel
    {
        public int AppUserRecordId { get; set; }
        public int AppUserId { get; set; }
        public new int ApplicantId { get; set; }
        public bool Status { get; set; }
        public System.DateTime CreateOn { get; set; }
        public Nullable<System.DateTime> LoginOn { get; set; }
        public string DeviceId { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Token { get; set; }
        public DateTime DateTime { get; set; }
        public string ImageUrl { get; set; }
    }
}
