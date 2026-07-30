namespace MdLabScience.DbContext
{
    using System;
    public partial class ApplicantTransactionTB
    {
        public int TransactionId { get; set; }
        public double Debit { get; set; }
        public double Credit { get; set; }
        public Nullable<System.DateTime> DateTime { get; set; }
        public string Reference { get; set; }
        public string Remarks { get; set; }
        public Nullable<int> ApplicantId { get; set; }
    }
}
