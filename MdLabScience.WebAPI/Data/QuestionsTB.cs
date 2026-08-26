namespace MdLabScience.DbContext
{
    using System;
    public partial class QuestionsTB
    {
        public int QuestionRecordId { get; set; }
        public int QuestionId { get; set; }
        public int CourseId { get; set; }
        public Nullable<System.DateTime> DateTime { get; set; }
        public string QuestionContent { get; set; }
        public Nullable<System.DateTime> StartDateTime { get; set; }
        public string? Remarks { get; set; }
        public int? TopId { get; set; }
    }
}
