using System;

namespace MdLabScience.Models
{
    public class CertificateInvoiceMD
    {
        public int CertificateInoviceId { get; set; }
        public Nullable<double> Amount { get; set; }
        public string Service { get; set; }
        public Nullable<double> PurchaseAmount { get; set; }
        public bool IsCompleted { get; set; }
    }
}
