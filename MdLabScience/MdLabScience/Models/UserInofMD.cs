using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IMS_WebApp.Models
{
    public class UserInofMD
    {
        public int UserId { get; set; }
        public int UserNo { get; set; }
        public int StoreId { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string UserPassword { get; set; }
        public string Saleman { get; set; }



        public Nullable<int> AreaId { get; set; }


        public Nullable<DateTime> CreatedDate { get; set; }
        public Nullable<bool> Status { get; set; }
        public Nullable<int> RoleId { get; set; }
        public String AreaType { get; set; }
        public Nullable<int> EmpCode { get; set; }
        public Nullable<int> SalemanId { get; set; }
        public Nullable<int> CatagoryId { get; set; }
        public String CatagoryName { get; set; }
        public String UserToken { get; set; }
        public string RoleName { get; set; }
        public string Logo { get; set; }
        public bool Licence { get;  set; }
    }
}