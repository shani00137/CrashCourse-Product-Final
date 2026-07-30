using System;

namespace StudentCertificateManagement.Models
{
    public class CourseModel
    {
        public int CourseId { get; set; }
        public string CourseCode { get; set; }
        public string CourseName { get; set; }
        public bool IsActive { get; set; }
        public string CourseUrl { get; internal set; }
    }
}
