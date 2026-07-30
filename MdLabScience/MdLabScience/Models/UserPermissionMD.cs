using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IMS_WebApp.Models
{
    public class UserPermissionMD
    {
        public int PermissionId { get; set; }
        public int RoleId { get; set; }
        public int PageId { get; set; }
        public string PageIcone { get; set; }

        public string RoleName { get; set; }
        public string PageName { get; set; }
        public string PageHeader { get; set; }
        public int MenuId { get; set; }
        public Nullable<int> UserNo { get; set; }
        public IEnumerable<UserControllerPermission> PermissinList { get; set; }

    }
    public class UserControllerPermission
    {
        public Nullable<int> UserNo { get; set; }
        public Nullable<int> ControllerId { get; set; }
        public Nullable<Boolean> Permission { get; set; }
    }
}