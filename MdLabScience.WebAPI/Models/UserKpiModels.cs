namespace MdLabScience.Models
{
    public class ExerciseCompleteRequest
    {
        public int AppUserId { get; set; }
        public int CourseId { get; set; }
        public int ExerciseStart { get; set; }
        public int ExerciseEnd { get; set; }
        public int Questions { get; set; }
        public int RightQuestions { get; set; }
    }

    public class ExerciseCompleteResponse
    {
        public bool Succeeded { get; set; }
        public string Message { get; set; }
    }

    /// <summary>Aggregated performance figures for one mobile user.</summary>
    public class UserKpiResponse
    {
        public int AppUserId { get; set; }
        public int ReadingSeconds { get; set; }
        public int LessonsStarted { get; set; }
        public int ExercisesCompleted { get; set; }
        public int TestsTaken { get; set; }
        public int TestsCompleted { get; set; }
        public int TestsPassed { get; set; }
        public int TestsInProgress { get; set; }
        public int AvgScore { get; set; }
        public int BestScore { get; set; }
        public int TotalQuestions { get; set; }
        public int TotalRightAnswers { get; set; }
        public int OverallScore { get; set; }
        public System.DateTime? LastTestDate { get; set; }
        public string LastResult { get; set; }
    }
}
