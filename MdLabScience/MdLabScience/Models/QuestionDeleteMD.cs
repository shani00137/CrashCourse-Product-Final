using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace EMCQWebApi.Models
{
    public class QuestionDeleteMD
    {
        public IEnumerable<QuestionMD> QuestionList { get; set; }
    }
}