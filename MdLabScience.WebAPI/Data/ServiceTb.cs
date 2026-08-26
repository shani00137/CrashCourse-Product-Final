namespace MdLabScience.DbContext
{
    public partial class ServiceTb
    {
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
        public decimal PurchasePrice { get; set; } = 0;
        public decimal SalePrice { get; set; } = 0;
    }
}