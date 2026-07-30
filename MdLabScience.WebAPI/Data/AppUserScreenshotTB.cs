namespace MdLabScience.DbContext
{
    using System;
    public partial class AppUserScreenshotTB
    {
        public int ScreenShotId { get; set; }
        public int ApplicantId { get; set; }
        public Nullable<int> UserId { get; set; }
        public System.DateTime DateTime { get; set; }
        public string ImageUrl { get; set; }
    }
}
