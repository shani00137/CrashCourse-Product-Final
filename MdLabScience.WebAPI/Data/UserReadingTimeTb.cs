namespace MdLabScience.DbContext
{
    using System;
    public partial class UserReadingTimeTb
    {
        public int Id { get; set; }
        public int AppUserId { get; set; }
        public int CourseId { get; set; }
        public int ExerciseStart { get; set; }
        public int ExerciseEnd { get; set; }
        public int TotalSeconds { get; set; }
        public System.DateTime LastUpdated { get; set; }
    }
}