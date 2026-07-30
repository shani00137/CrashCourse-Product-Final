using StudentCertificateManagement.Models;
using System;
using System.Collections.Generic;

namespace MdLabScience.Models
{
    public class ApplicantModel
    {
        public int RecordId { get; set; }
        public int ApplicantId { get; set; }
        public string RegistrationNo { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Mobile { get; set; }
        public string OtherMobile { get; set; }
        public string Address { get; set; }
        public string Email { get; set; }
        public System.DateTime CreatedOn { get; set; }
        public System.DateTime RegistrationDate { get; set; }
        public System.DateTime ExpiryDate { get; set; }
        public int UserNo { get; set; }
        public string PhotoUrl { get; set; }
        public int ApplyForCountry { get; set; }
        public int CountryId { get; set; }
        public int CourseId { get; set; }
        public string CoutryName { get; internal set; }
        public IEnumerable<CourseModel> CourseName { get; set; }
        public bool IsActive { get; set; }
        public String Course { get; set; }
        public int AppUserId { get; set; }
        public int Messages { get; set; }
        public CourseModel CourseMD { get; set; }
    }
}
