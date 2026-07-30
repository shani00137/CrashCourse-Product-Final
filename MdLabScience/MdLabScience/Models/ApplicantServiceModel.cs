using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MdLabScience.Models
{
    public class ApplicantServiceModel
    {
        public int DataFlowVerificationId { get; set; }
        public int ApplicantId { get; set; }
        public string CNIC { get; set; }
        public string Photo { get; set; }
        public string Passport { get; set; }
        public string MatricMarketSheet { get; set; }
        public string Degree { get; set; }
        public string ExperienceCertificate { get; set; }
        public string RegistrationCertificate { get; set; }
        public string AdditionalDocuments { get; set; }
        public string Others { get; set; }
        public string DataFlowRemarks { get; set; }
        public string LicenseTransfer { get; set; }
        public Nullable<bool> AdditionalDocumentsDataflow { get; set; }
        public string AdditionalDocumentsDataflowRemarks { get; set; }
        public bool? DataFlowTransferred { get;  set; }
        public string Remarks { get;  set; }
        public string DegreeMarkSheet { get; internal set; }
        public string IntermediateMarkSheet { get; internal set; }
        public string GoodStandingDocuments { get;  set; }
        public string Matricsheetdegree { get;  set; }
    }

}