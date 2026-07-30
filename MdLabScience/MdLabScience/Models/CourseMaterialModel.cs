using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MdLabScience.Models
{
    public class CourseMaterialModel
    {
        public int CourseMaterialId { get; set; }
        public int CourseId { get; set; }
        public string CourseUrl { get; set; }
        public string MaterialType { get; set; }
        public String FileName { get; set; }
        public String CourseName { get; set; }
        public Nullable<int> Questions { get; set; }
    }
}