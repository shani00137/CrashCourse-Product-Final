using System;

namespace IMS_WebApp.Models
{
    public class UserInofMD
    {
        public int UserId { get; set; }
        public int UserNo { get; set; }
        public int StoreId { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? UserPassword { get; set; }
        public string? Saleman { get; set; }
        public int? AreaId { get; set; }
        public DateTime? CreatedDate { get; set; }
        public bool? Status { get; set; }
        public int? RoleId { get; set; }
        public string? AreaType { get; set; }
        public int? EmpCode { get; set; }
        public int? SalemanId { get; set; }
        public int? CatagoryId { get; set; }
        public string? CatagoryName { get; set; }
        public string? UserToken { get; set; }
        public string? RoleName { get; set; }
        public string? Logo { get; set; }
        public bool Licence { get; set; }
    }
}
