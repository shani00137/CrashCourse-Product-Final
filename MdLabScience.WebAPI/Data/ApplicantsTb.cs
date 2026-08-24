namespace MdLabScience.DbContext
{
    using System;
    public partial class ApplicantsTb
    {
        public int RecordId { get; set; }
        public Nullable<int> ApplicantId { get; set; }
        public string? RegistrationNo { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Mobile { get; set; }
        public string? OtherMobile { get; set; }
        public string? Address { get; set; }
        public string? Email { get; set; }
        public System.DateTime? CreatedOn { get; set; }
        public System.DateTime? RegistrationDate { get; set; }
        public System.DateTime? ExpiryDate { get; set; }
        public int? UserNo { get; set; }
        public string? PhotoUrl { get; set; }
        public int? CountryId { get; set; }
        public bool? IsActive { get; set; }
        public int? ApplicationStatusId { get; set; }
    }
}
