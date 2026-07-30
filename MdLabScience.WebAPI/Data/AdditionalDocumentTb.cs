namespace MdLabScience.DbContext
{
    using System;
    public partial class AdditionalDocumentTb
    {
        public int AdditionalDocumentId { get; set; }
        public Nullable<bool> AdditionalDocumentsDataflow { get; set; }
        public string AdditionalDocumentsDataflowRemarks { get; set; }
        public Nullable<int> ApplicantId { get; set; }
    }
}
