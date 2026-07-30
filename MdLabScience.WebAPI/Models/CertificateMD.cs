using System;

namespace MdLabScience.Models
{
    public class CertificateMD
    {
        public String Name { get; set; }
        public String SerialNo { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public String Export { get; set; }
        public String CourseName { get; set; }
    }
}
