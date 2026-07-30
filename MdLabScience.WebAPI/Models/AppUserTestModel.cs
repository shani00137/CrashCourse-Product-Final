using System;
using System.Collections.Generic;

namespace MdLabScience.Models
{
    public class AppUserTestModel
    {
        public int TestRecordId { get; set; }
        public int TestId { get; set; }
        public System.DateTime CreatedDate { get; set; }
        public List<int> ApplicantId { get; set; }
        public bool IsCompleted { get; set; }
        public int RightQuestion { get; set; }
        public int Questions { get; set; }
        public int CreatedBy { get; set; }
        public DateTime TestDate { get; set; }
        public int CourseId { get; set; }
        public Nullable<int> RightQuestions { get; set; }
        public int Duration { get; set; }
        public string CourseName { get; set; }
        public string Remarks { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int Percentage { get; set; }
    }

    public class AppUserTestDetailsModel
    {
        public int TestRecordId { get; set; }
        public int TestId { get; set; }
        public int AppUserId { get; set; }
        public int QuestionId { get; set; }
        public string Options { get; set; }
        public bool IsChooseRight { get; set; }
    }
}
