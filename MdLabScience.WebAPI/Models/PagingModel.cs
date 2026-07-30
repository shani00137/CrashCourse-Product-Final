using MdLabScience.Utility;
using System;

namespace MdLabScience.Models
{
    public class PagedResponse<T> : Response<T>
    {
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public Uri FirstPage { get; set; }
        public Uri LastPage { get; set; }
        public int TotalPages { get; set; }
        public int TotalRecords { get; set; }
        public Uri NextPage { get; set; }
        public Uri PreviousPage { get; set; }

        public PagedResponse(T data, int pageNumber, int pageSize, int totalRecords)
        {
            this.PageNumber = pageNumber;
            this.PageSize = pageSize;
            this.Data = data;
            this.TotalPages = totalRecords / pageSize;
            if (totalRecords % pageSize > 0) this.TotalPages++;
            this.TotalRecords = totalRecords;
            this.Message = null;
            this.Succeeded = true;
            this.Errors = null;
        }
    }
}
