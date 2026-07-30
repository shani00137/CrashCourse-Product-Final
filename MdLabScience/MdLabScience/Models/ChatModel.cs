using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MdLabScience.Models
{
    public class ChatModel
    {
        public int ChatId { get; set; }
        public int AppUserId { get; set; }
        public int ReceiverId { get; set; }
        public System.DateTime DateTime { get; set; }
        public string Message { get; set; }
        public bool IsSender { get; set; }
    }
}