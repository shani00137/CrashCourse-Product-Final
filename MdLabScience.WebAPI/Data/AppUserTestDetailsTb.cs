namespace MdLabScience.DbContext
{
    using System;
    public partial class AppUserTestDetailsTb
    {
        public int TestRecordId { get; set; }
        public int TestId { get; set; }
        public int AppUserId { get; set; }
        public int QuestionId { get; set; }
        public string Options { get; set; }
        public bool IsChooseRight { get; set; }
    }
}
