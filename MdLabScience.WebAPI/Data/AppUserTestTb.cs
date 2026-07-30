namespace MdLabScience.DbContext
{
    using System;
    public partial class AppUserTestTb
    {
        public int TestRecordId { get; set; }
        public int TestId { get; set; }
        public int CourseId { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public int ApplicantId { get; set; }
        public bool IsCompleted { get; set; }
        public int Questions { get; set; }
        public int CreatedBy { get; set; }
        public System.DateTime TestDate { get; set; }
        public int Duration { get; set; }
        public Nullable<System.DateTime> TestStartTime { get; set; }
        public Nullable<int> RightQuestions { get; set; }
        public string Remarks { get; set; }
    }
}
