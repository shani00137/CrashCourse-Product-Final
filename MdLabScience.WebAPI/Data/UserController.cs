namespace MdLabScience.DbContext
{
    using System;
    public partial class UserController
    {
        public int ControllerId { get; set; }
        public string ControllerName { get; set; }
        public string ControllerUrl { get; set; }
        public Nullable<int> MenuId { get; set; }
    }
}
