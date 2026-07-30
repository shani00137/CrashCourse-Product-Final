using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MdLabScience.Models
{
    public class CertificateInvoiceMD
    {
        public int CertificateInoviceId { get; set; }
        public Nullable<double> Amount { get; set; }
        public string Service { get; set; }
    }
}