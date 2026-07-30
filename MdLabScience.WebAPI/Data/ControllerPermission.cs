namespace MdLabScience.DbContext
{
    using System;
    public partial class ControllerPermission
    {
        public int CPermissionId { get; set; }
        public Nullable<int> ControllerId { get; set; }
        public Nullable<int> UserNo { get; set; }
        public Nullable<bool> Permission { get; set; }
    }
}
