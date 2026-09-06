namespace MdLabScience.Models
{
    public class ReadingTimeRequest
    {
        public int AppUserId { get; set; }
        public int CourseId { get; set; }
        public int ExerciseStart { get; set; }
        public int ExerciseEnd { get; set; }
        public int Seconds { get; set; }
    }

    public class ReadingTimeRow
    {
        public int AppUserId { get; set; }
        public int CourseId { get; set; }
        public int ExerciseStart { get; set; }
        public int ExerciseEnd { get; set; }
        public int TotalSeconds { get; set; }
    }

    public class ReadingTimeResponse
    {
        public bool Succeeded { get; set; }
        public string Message { get; set; }
        public int TotalSeconds { get; set; }
    }
}