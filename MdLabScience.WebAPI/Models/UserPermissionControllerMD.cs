using System;
using System.Collections.Generic;

namespace PayrollManagementSystem.Models
{
    public class UserPermissionControllerMD
    {
        public int ControllerId { get; set; }
        public string ControllerName { get; set; }
        public string ControllerUrl { get; set; }
        public Nullable<int> MenuId { get; set; }
        public int CPermissionId { get; set; }
        public String MenuName { get; set; }
        public Nullable<int> UserNo { get; set; }
        public Nullable<bool> Permission { get; set; }
        public List<Controller> Controller { get; set; }
    }

    public class Controller
    {
        public string ControllerName { get; set; }
        public Nullable<int> ControllerId { get; set; }
        public Nullable<bool> Permission { get; set; }
        public Nullable<int> MenuId { get; set; }
        public int UserNo { get; set; }
    }
}
