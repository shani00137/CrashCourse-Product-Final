using MdLabScience.DbContext;
using MdLabScience.Models;
using MdLabScience.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MdLabScience.Controllers
{
    // Admin approval workflow for "upgrade to Pro" requests raised by trial
    // users inside the mobile app. Requests are stored in ProUpgradeRequestTb
    // and the plan NEVER changes until an administrator approves a row here.
    // Every endpoint except MyRequest requires an admin token (UserType=Admin).
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProUpgradeRequestController : ControllerBase
    {
        private static TimeZoneInfo Pakistan_Standard_Time = TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");

        private readonly IConfiguration _config;

        public ProUpgradeRequestController(IConfiguration config)
        {
            _config = config;
        }

        // Set by LoginController only for panel logins; mobile app tokens
        // carry UserType=AppUser and are rejected by AdminOnly().
        private bool IsAdmin =>
            string.Equals(User.FindFirst("UserType")?.Value, "Admin", StringComparison.OrdinalIgnoreCase);

        [NonAction]
        private IActionResult AdminOnly()
        {
            return StatusCode(403, new
            {
                succeeded = false,
                message = "Admin access required. Only the administrator can manage Pro upgrade requests."
            });
        }

        // Admin panel: list requests (optionally filtered by status).
        [HttpGet]
        [Route("api/ProUpgradeRequest/GetAll")]
        public IActionResult GetAll([FromQuery] string? status = null)
        {
            if (!IsAdmin) return AdminOnly();

            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query =
                    from r in db.ProUpgradeRequestTbs
                    join u in db.AppUserTbs on r.AppUserId equals u.AppUserId
                    join a in db.ApplicantsTbs on r.ApplicantId equals a.ApplicantId
                    select new { Request = r, u.UserName, Applicant = a };

                if (!string.IsNullOrWhiteSpace(status) &&
                    !string.Equals(status, "All", StringComparison.OrdinalIgnoreCase))
                {
                    string wanted = status;
                    query = query.Where(x => x.Request.Status == wanted);
                }

                var rows = query
                    .OrderByDescending(x => x.Request.RequestedOn)
                    .Select(x => new
                    {
                        proUpgradeRequestId = x.Request.ProUpgradeRequestId,
                        appUserId = x.Request.AppUserId,
                        applicantId = x.Request.ApplicantId,
                        userName = x.UserName,
                        firstName = x.Applicant.FirstName,
                        lastName = x.Applicant.LastName,
                        email = x.Applicant.Email,
                        mobile = x.Applicant.Mobile,
                        registrationDate = x.Applicant.RegistrationDate,
                        expiryDate = x.Applicant.ExpiryDate,
                        requestedOn = x.Request.RequestedOn,
                        status = x.Request.Status,
                        resolvedOn = x.Request.ResolvedOn,
                        approvedMonths = x.Request.ApprovedMonths
                    })
                    .ToList();

                List<int> applicantIds = rows.Select(x => x.applicantId).Distinct().ToList();
                var courseRows = (from ac in db.ApplicantCourseSelectionTbs
                                  join c in db.CourseTbs on ac.CourseId equals c.CourseId
                                  where applicantIds.Contains(ac.ApplicantId)
                                  select new { ac.ApplicantId, c.CourseName }).ToList();
                var courseMap = courseRows
                    .GroupBy(x => x.ApplicantId)
                    .ToDictionary(g => g.Key, g => string.Join(", ", g.Select(x => x.CourseName)));

                var data = rows.Select(x => new
                {
                    x.proUpgradeRequestId,
                    x.appUserId,
                    x.applicantId,
                    x.userName,
                    x.firstName,
                    x.lastName,
                    x.email,
                    x.mobile,
                    x.registrationDate,
                    x.expiryDate,
                    x.requestedOn,
                    x.status,
                    x.resolvedOn,
                    x.approvedMonths,
                    course = courseMap.TryGetValue(x.applicantId, out string? courses) ? courses : ""
                }).ToList();

                return Ok(new { succeeded = true, data });
            }
        }

        // The app user's own latest request (used by the settings screen to
        // show "Pending approval"). Users may only read their own row.
        [HttpGet]
        [Route("api/ProUpgradeRequest/MyRequest/{appUserId}")]
        public IActionResult MyRequest(int appUserId)
        {
            string? tokenUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!IsAdmin && (string.IsNullOrEmpty(tokenUserId) || tokenUserId != appUserId.ToString()))
            {
                return AdminOnly();
            }

            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var latest = db.ProUpgradeRequestTbs
                    .Where(x => x.AppUserId == appUserId)
                    .OrderByDescending(x => x.ProUpgradeRequestId)
                    .FirstOrDefault();

                if (latest == null)
                {
                    return Ok(new
                    {
                        succeeded = true,
                        status = (string?)null,
                        requestedOn = (DateTime?)null,
                        resolvedOn = (DateTime?)null
                    });
                }

                return Ok(new
                {
                    succeeded = true,
                    status = latest.Status,
                    requestedOn = (DateTime?)latest.RequestedOn,
                    resolvedOn = latest.ResolvedOn
                });
            }
        }

        // Admin panel: approve the request. This is the ONLY place a trial
        // user's plan becomes Pro — the expiry is extended by the chosen
        // number of months and the request row is marked Approved.
        [HttpPost]
        [Route("api/ProUpgradeRequest/Approve")]
        public IActionResult Approve([FromBody] ApproveProUpgradeModel value)
        {
            if (!IsAdmin) return AdminOnly();

            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var request = db.ProUpgradeRequestTbs
                        .Where(x => x.ProUpgradeRequestId == value.ProUpgradeRequestId)
                        .FirstOrDefault();
                    if (request == null)
                    {
                        return Ok(new { succeeded = false, message = "Request not found." });
                    }
                    if (!string.Equals(request.Status, "Pending", StringComparison.OrdinalIgnoreCase))
                    {
                        return Ok(new { succeeded = false, message = "This request was already " + request.Status.ToLowerInvariant() + "." });
                    }

                    var applicant = db.ApplicantsTbs.Where(x => x.ApplicantId == request.ApplicantId).FirstOrDefault();
                    if (applicant == null)
                    {
                        var appUser = db.AppUserTbs.Where(x => x.AppUserId == request.AppUserId).FirstOrDefault();
                        if (appUser != null)
                        {
                            applicant = db.ApplicantsTbs.Where(x => x.ApplicantId == appUser.ApplicantId).FirstOrDefault();
                        }
                    }
                    if (applicant == null)
                    {
                        return Ok(new { succeeded = false, message = "Applicant not found for this request." });
                    }

                    int months = value.Months.HasValue && value.Months.Value > 0 && value.Months.Value <= 60
                        ? value.Months.Value
                        : 12;

                    // Approval flips the account to Pro: registration→expiry
                    // becomes a full-length subscription, which the app reads
                    // as non-trial (Pro) on the next refresh/login.
                    DateTime expiry = DateTime.Now.AddMonths(months);
                    applicant.ExpiryDate = expiry;
                    applicant.IsActive = true;

                    request.Status = "Approved";
                    request.ResolvedOn = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                    request.ApprovedMonths = months;
                    db.SaveChanges();

                    // Tell the user their Pro access is active.
                    var appUserRow = db.AppUserTbs.Where(x => x.AppUserId == request.AppUserId).FirstOrDefault();
                    if (!string.IsNullOrWhiteSpace(applicant.Email))
                    {
                        string name = ((applicant.FirstName ?? "") + " " + (applicant.LastName ?? "")).Trim();
                        if (string.IsNullOrEmpty(name)) name = appUserRow?.UserName ?? "Student";
                        string body = EmailService.BuildInfoEmail(
                            "You are now Pro!",
                            "Your upgrade request was approved. Pro access is active on your Crash Course account.",
                            new List<KeyValuePair<string, string>>
                            {
                                new KeyValuePair<string, string>("Name", name),
                                new KeyValuePair<string, string>("Plan", "Pro"),
                                new KeyValuePair<string, string>("Valid until", expiry.ToString("yyyy-MM-dd")),
                            },
                            "Open the Crash Course app — your Pro access applies automatically. No need to log in again.");
                        EmailService.SendFireAndForget(_config, applicant.Email, "Crash Course - Pro access activated", body);
                    }

                    return Ok(new
                    {
                        succeeded = true,
                        message = "Pro plan approved.",
                        expiryDate = applicant.ExpiryDate,
                        approvedMonths = months
                    });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { succeeded = false, message = ex.Message });
            }
        }

        // Admin panel: reject the request. The plan stays exactly as it was.
        [HttpPost]
        [Route("api/ProUpgradeRequest/Reject")]
        public IActionResult Reject([FromBody] RejectProUpgradeModel value)
        {
            if (!IsAdmin) return AdminOnly();

            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var request = db.ProUpgradeRequestTbs
                        .Where(x => x.ProUpgradeRequestId == value.ProUpgradeRequestId)
                        .FirstOrDefault();
                    if (request == null)
                    {
                        return Ok(new { succeeded = false, message = "Request not found." });
                    }
                    if (!string.Equals(request.Status, "Pending", StringComparison.OrdinalIgnoreCase))
                    {
                        return Ok(new { succeeded = false, message = "This request was already " + request.Status.ToLowerInvariant() + "." });
                    }

                    request.Status = "Rejected";
                    request.ResolvedOn = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                    db.SaveChanges();

                    // Inform the user; no plan change happens here.
                    var applicant = db.ApplicantsTbs.Where(x => x.ApplicantId == request.ApplicantId).FirstOrDefault();
                    if (applicant != null && !string.IsNullOrWhiteSpace(applicant.Email))
                    {
                        string name = ((applicant.FirstName ?? "") + " " + (applicant.LastName ?? "")).Trim();
                        string body = EmailService.BuildInfoEmail(
                            "Upgrade Request Update",
                            "Your request for the Pro version was not approved at this time. Your current plan stays unchanged.",
                            new List<KeyValuePair<string, string>>
                            {
                                new KeyValuePair<string, string>("Name", string.IsNullOrEmpty(name) ? "-" : name),
                                new KeyValuePair<string, string>("Status", "Rejected"),
                            },
                            "Please contact the course administration if you have questions about your plan.");
                        EmailService.SendFireAndForget(_config, applicant.Email, "Crash Course - upgrade request update", body);
                    }

                    return Ok(new { succeeded = true, message = "Request rejected. Plan unchanged." });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { succeeded = false, message = ex.Message });
            }
        }
    }
}
