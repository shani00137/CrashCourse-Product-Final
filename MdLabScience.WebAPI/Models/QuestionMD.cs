using System;
using System.Collections.Generic;

namespace EMCQWebApi.Models
{
    public class QuestionMD
    {
        public int QuestionRecordId { get; set; }
        public int QuestionId { get; set; }
        public int CourseId { get; set; }
        public Nullable<System.DateTime> DateTime { get; set; }
        public string QuestionContent { get; set; }
        public int[] CourseIdList { get; set; }
        public int? TopId { get; set; }
        public string? TopTitle { get; set; }
        public IEnumerable<QuestionOptions> QuestionOptionsList { get; set; }
    }

    public class QuestionOptions
    {
        public int QuestionJobOptionId { get; set; }
        public Nullable<int> QuestionId { get; set; }
        public Nullable<int> JobsId { get; set; }
        public string Options { get; set; }
        public Nullable<bool> IsRightAns { get; set; }
    }

    public class TopicMD
    {
        public int TopId { get; set; }
        public string TopTitle { get; set; }
    }
}
