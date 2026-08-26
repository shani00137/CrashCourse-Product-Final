namespace MdLabScience.DbContext
{
    using System;
    public partial class UserdiscussionTB
    {
        public int DiscuId { get; set; }
        public int? QuestionId { get; set; }
        public string? Remarks { get; set; }
        public string CreatedBy { get; set; }
        public Nullable<System.DateTime> CreatedDate { get; set; }
       
    }
}
