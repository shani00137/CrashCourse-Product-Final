using MdLabScience.DbContext;
using MdLabScience.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TaskApp.Models;

namespace MdLabScience.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private static TimeZoneInfo Pakistan_Standard_Time = TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");

        [HttpGet]
        [Route("api/Dashboard/GetDashbordTopFigures")]
        public IActionResult GetDashbordTopFigures()
        {
            List<DasboardModel> list = new List<DasboardModel>();
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
            return Ok(list);
        }
    }
}
