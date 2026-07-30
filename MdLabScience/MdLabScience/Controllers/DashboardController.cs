
using MdLabScience.DbContext;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Core.Objects;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using TaskApp.Models;

namespace POSWebResturent.Controllers
{
    public class DashboardController : ApiController
    {
        private static TimeZoneInfo Pakistan_Standard_Time = TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");
        [HttpGet]
        [Route("api/Dashboard/GetDashbordTopFigures")]
        public IHttpActionResult GetDashbordTopFigures()
        {
            List<DasboardModel> list = new List<DasboardModel>();
            MdLabScienceDbEntities db = new MdLabScienceDbEntities();
            try
            {
                int TotalTask = 0;
                int PendingTask = 0;
                int CompleteTask = 0;
                int InProgressTask = 0;

                
            }
            catch (Exception ex)
            {
            }
            return Json(list);

        }

    

    }
}
