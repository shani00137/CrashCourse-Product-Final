using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MdLabScience.Models
{
    public class ApplicantTransactionMD
    {
        public int TransactionId { get; set; }
        public double Debit { get; set; }
        public double Credit { get; set; }
        public Nullable<System.DateTime> DateTime { get; set; }
        public string Reference { get; set; }
        public string Remarks { get; set; }
        public Nullable<int> ApplicantId { get; set; }
        public double TotalDebit { get; set; }
        public double TotalCredit { get; set; }
        public double Balance { get; set; }
    }
}