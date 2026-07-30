using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MdLabScience.Utility
{
    public class PaginationFilter
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public String SearchTerm { get; set; }
        public int ApplicantId { get;  set; }
    }
}