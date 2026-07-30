namespace MdLabScience.DbContext
{
    using System;
    public partial class QuestionOptionsTb
    {
        public int QuestionJobOptionId { get; set; }
        public Nullable<int> QuestionId { get; set; }
        public Nullable<int> JobsId { get; set; }
        public string Options { get; set; }
        public Nullable<bool> IsRightAns { get; set; }
    }
}
