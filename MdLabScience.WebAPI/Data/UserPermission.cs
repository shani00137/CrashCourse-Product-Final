namespace MdLabScience.DbContext
{
    using System;
    public partial class UserPermission
    {
        public int PermissionId { get; set; }
        public int RoleId { get; set; }
        public int PageId { get; set; }
        public Nullable<int> MenuId { get; set; }
        public Nullable<int> EmpCode { get; set; }
    }
}
