using MdLabScience.DbContext;
using MdLabScience.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace MdLabScience.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReadingTimeController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ReadingTimeController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("api/ReadingTime/SaveReadingTime")]
        public IActionResult SaveReadingTime([FromBody] ReadingTimeRequest request)
        {
            try
            {
                if (request == null || request.AppUserId <= 0)
                {
                    return Ok(new ReadingTimeResponse { Succeeded = false, Message = "AppUserId is required." });
                }
                if (request.Seconds <= 0)
                {
                    return Ok(new ReadingTimeResponse { Succeeded = false, Message = "Seconds must be greater than 0." });
                }

                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var row = db.UserReadingTimeTbs.FirstOrDefault(x =>
                        x.AppUserId == request.AppUserId &&
                        x.CourseId == request.CourseId &&
                        x.ExerciseStart == request.ExerciseStart &&
                        x.ExerciseEnd == request.ExerciseEnd);

                    if (row == null)
                    {
                        row = new UserReadingTimeTb
                        {
                            AppUserId = request.AppUserId,
                            CourseId = request.CourseId,
                            ExerciseStart = request.ExerciseStart,
                            ExerciseEnd = request.ExerciseEnd,
                            TotalSeconds = request.Seconds,
                            LastUpdated = DateTime.Now
                        };
                        db.UserReadingTimeTbs.Add(row);
                    }
                    else
                    {
                        row.TotalSeconds += request.Seconds;
                        row.LastUpdated = DateTime.Now;
                    }

                    db.SaveChanges();

                    return Ok(new ReadingTimeResponse { Succeeded = true, Message = "OK", TotalSeconds = row.TotalSeconds });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ReadingTimeResponse { Succeeded = false, Message = "Failed to save reading time: " + ex.Message });
            }
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("api/ReadingTime/GetAllReadingTime/{appUserId}")]
        public IActionResult GetAllReadingTime(int appUserId)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var rows = db.UserReadingTimeTbs
                    .Where(x => x.AppUserId == appUserId)
                    .Select(x => new ReadingTimeRow
                    {
                        AppUserId = x.AppUserId,
                        CourseId = x.CourseId,
                        ExerciseStart = x.ExerciseStart,
                        ExerciseEnd = x.ExerciseEnd,
                        TotalSeconds = x.TotalSeconds
                    })
                    .ToList();
                return Ok(rows);
            }
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("api/ReadingTime/GetReadingTime/{appUserId}/{courseId}/{start},{end}")]
        public IActionResult GetReadingTime(int appUserId, int courseId, int start, int end)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var row = db.UserReadingTimeTbs.FirstOrDefault(x =>
                    x.AppUserId == appUserId &&
                    x.CourseId == courseId &&
                    x.ExerciseStart == start &&
                    x.ExerciseEnd == end);

                return Ok(new ReadingTimeRow
                {
                    AppUserId = row?.AppUserId ?? appUserId,
                    CourseId = row?.CourseId ?? courseId,
                    ExerciseStart = row?.ExerciseStart ?? start,
                    ExerciseEnd = row?.ExerciseEnd ?? end,
                    TotalSeconds = row?.TotalSeconds ?? 0
                });
            }
        }
    }
}