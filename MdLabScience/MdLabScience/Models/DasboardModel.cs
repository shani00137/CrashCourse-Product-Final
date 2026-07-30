using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TaskApp.Models
{
    public class DasboardModel
    {
        public int TotalTask { get; set; }
        public int PendingTask { get; set; }
        public int CompleteTask { get; set; }
        public int InProgressTask { get; set; }
    }
}