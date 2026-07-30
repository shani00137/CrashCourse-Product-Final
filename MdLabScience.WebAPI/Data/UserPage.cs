namespace MdLabScience.DbContext
{
    using System;
    public partial class UserPage
    {
        public int PageId { get; set; }
        public string name { get; set; }
        public string url { get; set; }
        public string icon { get; set; }
        public Nullable<int> MenuId { get; set; }
    }
}
