namespace MdLabScience.DbContext
{
    using System;
    public partial class TestQuestionOptionTb
    {
        public int TestQuestionOptionId { get; set; }
        public Nullable<int> QuestionId { get; set; }
        public Nullable<int> JobsId { get; set; }
        public string Options { get; set; }
        public Nullable<bool> IsRightAns { get; set; }
        public int TestId { get; set; }
        public Nullable<int> isSelected { get; set; }
        public string Answer { get; set; }
    }
}
