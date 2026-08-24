namespace MdLabScience.DbContext
{
    using System;

    public partial class ApplicantStatusTransactionsTb
    {
        public int StatusTransactionId { get; set; }
        public int? ApplicantId { get; set; }
        public int? StatusId { get; set; }
        public int? OldStatusId { get; set; }
        public DateTime? DateTime { get; set; }
        public string Remarks { get; set; }
        public string ChangedBy { get; set; }
        public string Category { get; set; }
    }
}
