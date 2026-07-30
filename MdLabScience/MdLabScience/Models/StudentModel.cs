using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace StudentCertificateManagement.Models
{
    public class StudentModel
    {
        public int RecordId { get; set; }
        public string StudentId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string CourseCode { get; set; }
        public string CourseName { get; set; }
        public System.DateTime StartDate { get; set; }
        public System.DateTime EndDate { get; set; }
        public System.DateTime IssueDate { get; set; }
        public string BarCode { get; set; }
        public string CertificateType { get; set; }
        public string DocumentNo { get; set; }
        
    }
}