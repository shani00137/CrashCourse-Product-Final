namespace MdLabScience.Utility
{
    public class PaginationFilter
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public String SearchTerm { get; set; }
        public int ApplicantId { get; set; }
        public String Status { get; set; }
        public int? CountryId { get; set; }
        public int? CourseId { get; set; }
    }
}
