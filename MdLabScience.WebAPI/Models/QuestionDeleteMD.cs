using System.Collections.Generic;

namespace EMCQWebApi.Models
{
    public class QuestionDeleteMD
    {
        public IEnumerable<QuestionMD> QuestionList { get; set; }

        // Set for DeleteQuestionsByCourse: deletes every question of this course.
        public int CourseId { get; set; }
    }
}
