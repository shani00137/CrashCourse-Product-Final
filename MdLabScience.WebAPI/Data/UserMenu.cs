namespace MdLabScience.DbContext
{
    using System;
    public partial class UserMenu
    {
        public int RecordId { get; set; }
        public int MenuId { get; set; }
        public string MenuName { get; set; }
        public string url { get; set; }
        public string icon { get; set; }
    }
}
