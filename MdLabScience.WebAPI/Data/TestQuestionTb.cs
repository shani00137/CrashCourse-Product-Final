namespace MdLabScience.DbContext
{
    using System;
    public partial class TestQuestionTb
    {
        public int TestQuestionRecordId { get; set; }
        public int QuestionId { get; set; }
        public int CourseId { get; set; }
        public Nullable<System.DateTime> DateTime { get; set; }
        public string QuestionContent { get; set; }
        public int TestId { get; set; }
    }
}
