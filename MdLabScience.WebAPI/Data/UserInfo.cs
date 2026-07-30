namespace MdLabScience.DbContext
{
    using System;
    public partial class UserInfo
    {
        public int UserId { get; set; }
        public int UserNo { get; set; }
        public string UserName { get; set; }
        public string UserPassword { get; set; }
        public Nullable<bool> Status { get; set; }
        public Nullable<int> RoleId { get; set; }
        public Nullable<System.DateTime> CreatedDate { get; set; }
        public Nullable<System.DateTime> ExpireDate { get; set; }
        public string UserType { get; set; }
        public string Email { get; set; }
        public string UserToken { get; set; }
    }
}
