namespace MdLabScience.DbContext
{
    public partial class AppVersionTb
    {
        public int Id { get; set; }
        public string LatestVersion { get; set; }
        public bool ForceUpdate { get; set; }
        public string StoreUrl { get; set; }
        public string Message { get; set; }
        public System.DateTime UpdatedAt { get; set; }
    }
}