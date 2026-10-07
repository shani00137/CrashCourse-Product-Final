namespace MdLabScience.DbContext
{
    using System;
    public partial class UserExerciseProgressTb
    {
        public int Id { get; set; }
        public int AppUserId { get; set; }
        public int CourseId { get; set; }
        public int ExerciseStart { get; set; }
        public int ExerciseEnd { get; set; }
        public int Questions { get; set; }
        public int RightQuestions { get; set; }
        public System.DateTime CompletedAt { get; set; }
    }
}
