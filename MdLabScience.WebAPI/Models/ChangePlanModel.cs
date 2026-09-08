using System;

namespace MdLabScience.Models
{
    public class ChangePlanModel
    {
        public int AppUserId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime ToDate { get; set; }
    }
}