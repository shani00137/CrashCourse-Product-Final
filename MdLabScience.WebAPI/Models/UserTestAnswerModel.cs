namespace MdLabScience.Models
{
    public class UserTestAnswerModel
    {
        public int QuestionId { get; set; }
        public int TestId { get; set; }
        public int IsSelected { get; set; }
        public String Answer { get; set; }
    }
}
