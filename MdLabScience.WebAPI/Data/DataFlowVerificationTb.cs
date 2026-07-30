namespace MdLabScience.DbContext
{
    using System;
    public partial class DataFlowVerificationTb
    {
        public int DataFlowVerificationId { get; set; }
        public int ApplicantId { get; set; }
        public Nullable<bool> CNIC { get; set; }
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
        public string DegreeMarkSheet { get; set; }
        public string GoodStandingDocuments { get; set; }
        public string IntermediateMarkSheet { get; set; }
    }
}
