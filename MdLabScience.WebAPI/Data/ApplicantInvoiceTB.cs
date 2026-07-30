namespace MdLabScience.DbContext
{
    using System;
    public partial class ApplicantInvoiceTB
    {
        public int InvoiceId { get; set; }
        public string InvoiceNo { get; set; }
        public int ApplicantId { get; set; }
        public double Amount { get; set; }
        public string Service { get; set; }
        public string Remarks { get; set; }
        public System.DateTime DateTime { get; set; }
        public Nullable<double> PaidAmount { get; set; }
        public Nullable<double> Balance { get; set; }
        public string Currency { get; set; }
    }
}
