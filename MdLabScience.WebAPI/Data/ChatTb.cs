namespace MdLabScience.DbContext
{
    using System;
    public partial class ChatTb
    {
        public int ChatId { get; set; }
        public int AppUserId { get; set; }
        public int ReceiverId { get; set; }
        public System.DateTime DateTime { get; set; }
        public string Message { get; set; }
        public bool IsSender { get; set; }
        public bool IsRead { get; set; }
    }
}
