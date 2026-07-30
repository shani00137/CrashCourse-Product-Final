using System;

namespace IMS_WebApp.Models
{
    public class UserPagesMD
    {
        public int PageId { get; set; }
        public string PageName { get; set; }
        public string PageHeader { get; set; }
        public string PageIcone { get; set; }
        public string MenuName { get; set; }
        public Nullable<int> MenuId { get; set; }
    }
}
