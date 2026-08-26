namespace MdLabScience.DbContext
{
    using System;
    public partial class CertificateInvoiceTb
    {
        public int CertificateInoviceId { get; set; }
        public Nullable<double> Amount { get; set; }
        public string Service { get; set; }
        public Nullable<int> InvoiceId { get; set; }
        public Nullable<double> PurchaseAmount { get; set; }
        public bool IsCompleted { get; set; }
    }
}
