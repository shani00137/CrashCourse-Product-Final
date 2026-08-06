using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MdLabScience.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        [Route("api/Home/Index")]
        public IActionResult Index()
        {
            return Ok(new { Title = "Home Page" });
        }
    }
}
