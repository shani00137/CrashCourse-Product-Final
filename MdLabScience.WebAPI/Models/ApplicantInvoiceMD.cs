using System;
using System.Collections.Generic;

namespace MdLabScience.Models
{
    public class ApplicantInvoiceMD
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
        public String Currency { get; set; }
        public List<CertificateInvoiceMD> ServiceList { get; set; }
    }
}
