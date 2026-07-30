namespace MdLabScience.DbContext
{
    using System;
    public partial class CourseTb
    {
        public int CourseId { get; set; }
        public string CourseCode { get; set; }
        public string CourseName { get; set; }
        public bool IsActive { get; set; }
        public string CourseUrl { get; set; }
    }
}
