namespace MdLabScience.DbContext
{
    using System;
    public partial class CourseTb
    {
        public int CourseId { get; set; }
        public string? CourseCode { get; set; }
        public string? CourseName { get; set; }
        public bool IsActive { get; set; }
        public string? CourseUrl { get; set; }
        // Sale price offered to the applicant (0 means no separate sale rate).
        public double SaleRate { get; set; }
        // When true the course is published to the mobile app course list.
        public bool IsForMobile { get; set; }
        // Relative path (Uploads/...) of the course picture shown to applicants.
        public string? CoursePhotourl { get; set; }
    }
}
