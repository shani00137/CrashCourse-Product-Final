namespace MdLabScience.DbContext
{
    using System;
    public partial class ExerciseTb
    {
        public int ExerciseRecordId { get; set; }
        public string Exercise { get; set; }
        public Nullable<int> StartFrom { get; set; }
        public Nullable<int> EndFrom { get; set; }
    }
}
