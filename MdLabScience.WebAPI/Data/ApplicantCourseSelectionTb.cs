namespace MdLabScience.DbContext
{
    using System;
    public partial class ApplicantCourseSelectionTb
    {
        public int CourseSelectionId { get; set; }
        public int ApplicantId { get; set; }
        public int CourseCode { get; set; }
        public int CourseId { get; set; }
        public Nullable<System.DateTime> Date { get; set; }
    }
}
