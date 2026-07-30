namespace MdLabScience.DbContext
{
    using System;
    public partial class CourseMaterialTb
    {
        public int CourseMaterialId { get; set; }
        public int CourseId { get; set; }
        public string CourseUrl { get; set; }
        public string MaterialType { get; set; }
        public string FileName { get; set; }
    }
}
