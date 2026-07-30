namespace MdLabScience.DbContext
{
    using System;
    public partial class DataFlowTransferTB
    {
        public int DataFlowTransferredId { get; set; }
        public int ApplicantId { get; set; }
        public Nullable<bool> DataFlowTransferred { get; set; }
        public string Remarks { get; set; }
        public Nullable<System.DateTime> Date { get; set; }
    }
}
