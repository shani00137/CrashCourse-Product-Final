using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MdLabScience.Models
{
    public class CertificationApplicantMD
    {
        public int RecordId { get; set; }
        public int CertifiedApplicantId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Mobile { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public System.DateTime CreatedOn { get; set; }
        public System.DateTime RegistrationDate { get; set; }
        public Nullable<int> CountryId { get; set; }
        public string Specialty { get; set; }
        public string CourseName { get; set; }
        public string IsDeleted { get; set; }

    }
}