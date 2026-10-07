using MdLabScience.DbContext;
using MdLabScience.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace MdLabScience.Controllers
{
    /// <summary>
    /// Writes the per-exercise completion records written by the mobile app and
    /// returns the calculated KPI figures (reading time, exercises completed,
    /// tests taken and results) for a user.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class UserKpiController : ControllerBase
    {
        private const int PassMark = 60;

        /// <summary>Records that a user finished an exercise (upsert per exercise).</summary>
        [HttpPost]
        [AllowAnonymous]
        [Route("api/UserKpi/MarkExerciseComplete")]
        public IActionResult MarkExerciseComplete([FromBody] ExerciseCompleteRequest request)
        {
            if (request == null || request.AppUserId <= 0)
            {
                return Ok(new ExerciseCompleteResponse { Succeeded = false, Message = "AppUserId is required." });
            }

            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var row = db.UserExerciseProgressTbs.FirstOrDefault(x =>
                        x.AppUserId == request.AppUserId &&
                        x.CourseId == request.CourseId &&
                        x.ExerciseStart == request.ExerciseStart &&
                        x.ExerciseEnd == request.ExerciseEnd);

                    if (row == null)
                    {
                        db.UserExerciseProgressTbs.Add(new UserExerciseProgressTb
                        {
                            AppUserId = request.AppUserId,
                            CourseId = request.CourseId,
                            ExerciseStart = request.ExerciseStart,
                            ExerciseEnd = request.ExerciseEnd,
                            Questions = request.Questions,
                            RightQuestions = request.RightQuestions,
                            CompletedAt = DateTime.Now
                        });
                    }
                    else
                    {
                        row.Questions = request.Questions;
                        row.RightQuestions = request.RightQuestions;
                        row.CompletedAt = DateTime.Now;
                    }

                    db.SaveChanges();
                    return Ok(new ExerciseCompleteResponse { Succeeded = true, Message = "OK" });
                }
            }
            catch (Exception ex)
            {
                // The progress table may not be migrated yet; never break the app flow.
                return Ok(new ExerciseCompleteResponse { Succeeded = false, Message = "Failed to save exercise progress: " + ex.Message });
            }
        }

        /// <summary>Calculates the KPI figures shown for one mobile user.</summary>
        [HttpGet]
        [AllowAnonymous]
        [Route("api/UserKpi/GetUserKpi/{appUserId}")]
        public IActionResult GetUserKpi(int appUserId)
        {
            var kpi = new UserKpiResponse { AppUserId = appUserId };

            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    // ── Reading time ────────────────────────────────────────
                    var readingRows = db.UserReadingTimeTbs
                        .Where(x => x.AppUserId == appUserId)
                        .ToList();
                    kpi.ReadingSeconds = readingRows.Sum(x => x.TotalSeconds);
                    kpi.LessonsStarted = readingRows.Count(x => x.TotalSeconds > 0);

                    // ── Exercises completed (needs Migrations/AddUserExerciseProgressTb.sql) ──
                    try
                    {
                        kpi.ExercisesCompleted = db.UserExerciseProgressTbs.Count(x => x.AppUserId == appUserId);
                    }
                    catch
                    {
                        kpi.ExercisesCompleted = 0;
                    }

                    // ── Tests taken and results ─────────────────────────────
                    var tests = (from t in db.AppUserTestTbs
                                 join a in db.AppUserTbs on t.ApplicantId equals a.ApplicantId
                                 where a.AppUserId == appUserId
                                 select new
                                 {
                                     t.IsCompleted,
                                     t.Questions,
                                     t.RightQuestions,
                                     t.TestDate
                                 }).ToList();

                    kpi.TestsTaken = tests.Count;
                    var completed = tests.Where(x => x.IsCompleted == true && x.Questions > 0).ToList();
                    kpi.TestsCompleted = completed.Count;
                    kpi.TestsInProgress = tests.Count(x => x.IsCompleted != true);

                    if (completed.Count > 0)
                    {
                        var scores = completed
                            .Select(x => (int)Math.Round(((double)(x.RightQuestions ?? 0) / x.Questions) * 100))
                            .ToList();
                        kpi.AvgScore = (int)Math.Round(scores.Average());
                        kpi.BestScore = scores.Max();
                        kpi.TestsPassed = scores.Count(s => s >= PassMark);
                        kpi.TotalQuestions = completed.Sum(x => x.Questions);
                        kpi.TotalRightAnswers = completed.Sum(x => x.RightQuestions ?? 0);
                        kpi.OverallScore = kpi.TotalQuestions > 0
                            ? (int)Math.Round(((double)kpi.TotalRightAnswers / kpi.TotalQuestions) * 100)
                            : 0;
                    }

                    var last = tests.Where(x => x.TestDate != null).OrderByDescending(x => x.TestDate).FirstOrDefault();
                    if (last != null)
                    {
                        kpi.LastTestDate = last.TestDate;
                        int pct = last.Questions > 0
                            ? (int)Math.Round(((double)(last.RightQuestions ?? 0) / last.Questions) * 100)
                            : 0;
                        kpi.LastResult = last.IsCompleted == true
                            ? $"{pct}% ({(pct >= PassMark ? "Passed" : "Failed")})"
                            : "In progress";
                    }
                    else
                    {
                        kpi.LastResult = "No tests yet";
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to calculate KPI: " + ex.Message });
            }

            return Ok(kpi);
        }
    }
}
