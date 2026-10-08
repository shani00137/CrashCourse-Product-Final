using MdLabScience.DbContext;
using MdLabScience.Models;
using MdLabScience.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MdLabScience.Controllers
{
    //app user controller for managing app users, their status, chat messages, and screenshots
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AppUserController : ControllerBase
    {
        private static TimeZoneInfo Pakistan_Standard_Time = TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");

        private readonly IConfiguration _config;

        public AppUserController(IConfiguration config)
        {
            _config = config;
        }

        // Only tokens issued to panel administrators (UserType=Admin claim set
        // by LoginController) may change plans. Mobile app users carry
        // UserType=AppUser and are locked out of ChangePlan entirely — a trial
        // user can only ASK for Pro via RequestProUpgrade.
        private bool IsAdmin =>
            string.Equals(User.FindFirst("UserType")?.Value, "Admin", StringComparison.OrdinalIgnoreCase);

        [HttpPost]
        [Route("api/AppUser/GetAllUsers")]
        public async Task<IActionResult> GetAllUsers([FromBody] PaginationFilter filter)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = from c in db.AppUserTbs
                            join d in db.ApplicantsTbs on c.ApplicantId equals d.ApplicantId
                            orderby c.Status descending, c.AppUserRecordId descending
                            select new AppUserModel
                            {
                                ApplicantId = c.ApplicantId,
                                AppUserId = c.AppUserId,
                                UserName = c.UserName,
                                CreateOn = c.CreateOn,
                                LoginOn = c.LoginOn,
                                DeviceId = c.DeviceId,
                                Status = c.Status,
                                FirstName = d.FirstName,
                                LastName = d.LastName,
                                PhotoUrl = d.PhotoUrl,
                                Mobile = d.Mobile,
                                Email = d.Email,
                                Address = d.Address,
                                RegistrationNo = d.RegistrationNo,
                                IsAIAllowed = c.IsAIAllowed
                            };

                string searchTerm = filter.SearchTerm ?? "";
                string[] tokens = searchTerm.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (string token in tokens)
                {
                    string t = token;
                    query = query.Where(x =>
                        x.UserName.Contains(t)
                        || (x.FirstName ?? "").Contains(t)
                        || (x.LastName ?? "").Contains(t)
                        || ((x.FirstName ?? "") + " " + (x.LastName ?? "")).Contains(t)
                        || ((x.LastName ?? "") + " " + (x.FirstName ?? "")).Contains(t)
                        || ((x.FirstName ?? "") + (x.LastName ?? "")).Contains(t)
                        || ((x.LastName ?? "") + (x.FirstName ?? "")).Contains(t)
                        || (x.RegistrationNo ?? "").Contains(t));
                }

                var totalRecords = await query.CountAsync();
                var pagedData = await query.Skip((filter.PageNumber - 1) * filter.PageSize)
                                           .Take(filter.PageSize)
                                           .ToListAsync();

                List<int> pagedApplicantIds = pagedData.Select(x => x.ApplicantId).Distinct().ToList();
                var courseRows = (from ac in db.ApplicantCourseSelectionTbs
                                  join c in db.CourseTbs on ac.CourseId equals c.CourseId
                                  where pagedApplicantIds.Contains(ac.ApplicantId)
                                  select new { ac.ApplicantId, c.CourseName }).ToList();
                var courseMap = courseRows
                    .GroupBy(x => x.ApplicantId)
                    .ToDictionary(g => g.Key, g => string.Join(", ", g.Select(x => x.CourseName)));

                foreach (var row in pagedData)
                {
                    if (courseMap.TryGetValue(row.ApplicantId, out string courses))
                    {
                        row.Course = courses;
                    }
                    row.RegistrationNo = row.RegistrationNo ?? "";
                    row.Mobile = row.Mobile ?? "";
                    row.Email = row.Email ?? "";
                }

                return Ok(new PagedResponse<List<AppUserModel>>(pagedData, filter.PageNumber, filter.PageSize, totalRecords));
            }
        }

        [HttpGet]
        [Route("api/AppUser/GetActiveAppUser")]
        public IActionResult GetActiveAppUser()
        {
            List<ApplicantModel> list = new List<ApplicantModel>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from c in db.AppUserTbs
                             join d in db.ApplicantsTbs on c.ApplicantId equals d.ApplicantId
                             where c.Status == true
                             select new
                             {
                                 c.ApplicantId,
                                 c.AppUserId,
                                 c.UserName,
                                 c.CreateOn,
                                 c.LoginOn,
                                 c.DeviceId,
                                 c.Status,
                                 d.FirstName,
                                 d.LastName,
                                 d.PhotoUrl,
                                 d.Mobile,
                                 d.Address
                             }).OrderByDescending(x => x.ApplicantId).Skip(1).ToList();
                foreach (var q in Query)
                {
                    var CourseInfo = (from c in db.ApplicantCourseSelectionTbs
                                      join d in db.CourseTbs on c.CourseId equals d.CourseId
                                      where c.ApplicantId == q.ApplicantId
                                      select new { d.CourseId, d.CourseName }).ToList();
                    var UnreadMessage = db.ChatTbs.Where(x => x.AppUserId == q.AppUserId && x.IsRead == false).Count();
                    list.Add(new ApplicantModel
                    {
                        FirstName = q.FirstName,
                        LastName = q.LastName,
                        AppUserId = q.AppUserId,
                        Course = String.Join(",", CourseInfo.Select(x => x.CourseName).ToArray()),
                        Messages = UnreadMessage
                    });
                }
                return Ok(list);
            }
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("api/AppUser/SaveAppUser")]
        public IActionResult SaveAppUser([FromBody] AppUserModel value)
        {
            String _response = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                int MaxId = 1;
                var GetMaxQuery = db.AppUserTbs.OrderByDescending(x => x.AppUserRecordId).Select(x => x.AppUserId).FirstOrDefault();
                if (GetMaxQuery != 0)
                {
                    MaxId = 1 + int.Parse(GetMaxQuery.ToString());
                }
                AppUserTb appUserTb = new AppUserTb();
                appUserTb.ApplicantId = value.ApplicantId;
                appUserTb.AppUserId = MaxId;
                appUserTb.DeviceId = "";
                appUserTb.UserName = value.UserName;
                appUserTb.Password = Encrption.Encrypt(value.Password);
                appUserTb.Status = true;
                appUserTb.IsAIAllowed = value.IsAIAllowed ?? true;
                appUserTb.CreateOn = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                db.AppUserTbs.Add(appUserTb);
                db.SaveChanges();

                // Every app registration is a 5-day trial: auto-email the owner
                // about the new trial user. Data is read synchronously here, the
                // SMTP send itself runs in the background so a slow or down mail
                // server never blocks or fails the signup.
                NotifyOwnerOfTrialRegistration(value, MaxId, db);

                return Ok(new { succeeded = true, appUserId = MaxId, applicantId = value.ApplicantId, userName = value.UserName, message = "Save Successfully" });
            }
        }

        // Builds + queues the "new trial registration" email to the owner inbox.
        [NonAction]
        private void NotifyOwnerOfTrialRegistration(AppUserModel value, int appUserId, MdLabScienceDbEntities db)
        {
            try
            {
                string courseName = value.Course ?? "";
                try
                {
                    var courseSelection = db.ApplicantCourseSelectionTbs
                        .Where(x => x.ApplicantId == value.ApplicantId)
                        .OrderByDescending(x => x.CourseSelectionId)
                        .FirstOrDefault();
                    if (courseSelection != null && courseSelection.CourseId > 0)
                    {
                        string selected = db.CourseTbs
                            .Where(x => x.CourseId == courseSelection.CourseId)
                            .Select(x => x.CourseName)
                            .FirstOrDefault();
                        if (!string.IsNullOrEmpty(selected))
                        {
                            courseName = selected;
                        }
                    }
                }
                catch
                {
                    // fall back to the course name sent by the app
                }

                var applicant = db.ApplicantsTbs.Where(x => x.ApplicantId == value.ApplicantId).FirstOrDefault();
                DateTime registeredOn = applicant?.RegistrationDate ?? DateTime.Now;
                DateTime trialExpires = applicant?.ExpiryDate ?? DateTime.Now.AddDays(5);

                string fullName = ((value.FirstName ?? "") + " " + (value.LastName ?? "")).Trim();
                if (string.IsNullOrEmpty(fullName))
                {
                    fullName = value.UserName ?? "-";
                }

                string subject = "New Trial Registration - " + (value.UserName ?? fullName);
                string body = EmailService.BuildInfoEmail(
                    "New Trial Registration",
                    "A new user just registered in the Crash Course app and starts a 5-day free trial.",
                    new List<KeyValuePair<string, string>>
                    {
                        new KeyValuePair<string, string>("Name", fullName),
                        new KeyValuePair<string, string>("Username", value.UserName ?? "-"),
                        new KeyValuePair<string, string>("Email", value.Email ?? "-"),
                        new KeyValuePair<string, string>("Mobile", value.Mobile ?? "-"),
                        new KeyValuePair<string, string>("Address", value.Address ?? "-"),
                        new KeyValuePair<string, string>("Course", string.IsNullOrEmpty(courseName) ? "-" : courseName),
                        new KeyValuePair<string, string>("App User Id", appUserId > 0 ? appUserId.ToString() : "-"),
                        new KeyValuePair<string, string>("Applicant Id", value.ApplicantId > 0 ? value.ApplicantId.ToString() : "-"),
                        new KeyValuePair<string, string>("Trial Started", registeredOn.ToString("yyyy-MM-dd HH:mm")),
                        new KeyValuePair<string, string>("Trial Expires", trialExpires.ToString("yyyy-MM-dd HH:mm")),
                    },
                    "This is an automatic notification from the Crash Course app.");

                EmailService.SendToAdminFireAndForget(_config, subject, body);
            }
            catch
            {
                // Never let an email problem break registration.
            }
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("api/AppUser/GetDetailOfUserById/{id}")]
        public IActionResult GetDetailOfUserById(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var appUser = db.AppUserTbs.Where(x => x.AppUserId == id).FirstOrDefault();
                if (appUser == null)
                {
                    return Ok(new
                    {
                        appUserId = id,
                        applicantId = 0,
                        courseId = 0,
                        courseName = "",
                        userName = "",
                        message = "User not found"
                    });
                }

                int? applicantId = appUser.ApplicantId;
                var courseSelection = db.ApplicantCourseSelectionTbs
                    .Where(x => x.ApplicantId == applicantId)
                    .OrderByDescending(x => x.CourseSelectionId)
                    .FirstOrDefault();
                int? courseId = courseSelection?.CourseId;
                string? courseName = "";
                if (courseId.HasValue && courseId > 0)
                {
                    courseName = db.CourseTbs.Where(x => x.CourseId == courseId)
                        .Select(x => x.CourseName).FirstOrDefault();
                }

                var applicant = applicantId.HasValue
                    ? db.ApplicantsTbs.Where(x => x.ApplicantId == applicantId.Value).FirstOrDefault()
                    : null;

                return Ok(new
                {
                    appUserId = appUser.AppUserId,
                    applicantId = applicantId,
                    userName = appUser.UserName ?? "",
                    courseId = courseId ?? 0,
                    courseName = courseName ?? "",
                    status = appUser.Status,
                    deviceId = appUser.DeviceId ?? "",
                    registrationDate = applicant != null ? applicant.RegistrationDate : (DateTime?)null,
                    expiryDate = applicant != null ? applicant.ExpiryDate : (DateTime?)null,
                    isActive = applicant != null ? applicant.IsActive : (bool?)null
                });
            }
        }

        [HttpPost]
        [Route("api/AppUser/ChangePlan")]
        public IActionResult ChangePlan([FromBody] ChangePlanModel value)
        {
            if (!IsAdmin)
            {
                // Hard server-side guard: the plan can only be changed by the
                // administrator from the backend panel.
                return StatusCode(403, new
                {
                    succeeded = false,
                    message = "Plans can only be changed by an administrator. No changes were applied."
                });
            }
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var appUser = db.AppUserTbs.Where(x => x.AppUserId == value.AppUserId).FirstOrDefault();
                    if (appUser == null || appUser.ApplicantId <= 0)
                    {
                        return Ok(new { succeeded = false, message = "User not found", expiryDate = (DateTime?)null });
                    }

                    var applicant = db.ApplicantsTbs.Where(x => x.ApplicantId == appUser.ApplicantId).FirstOrDefault();
                    if (applicant == null)
                    {
                        return Ok(new { succeeded = false, message = "Applicant not found", expiryDate = (DateTime?)null });
                    }

                    DateTime toDate = value.ToDate == default
                        ? (applicant.ExpiryDate ?? DateTime.Now.AddMonths(12))
                        : value.ToDate;

                    if (value.FromDate.HasValue && value.FromDate.Value != default)
                    {
                        applicant.RegistrationDate = value.FromDate.Value;
                    }

                    applicant.ExpiryDate = toDate;
                    applicant.IsActive = toDate > DateTime.Now;
                    db.SaveChanges();

                    return Ok(new
                    {
                        succeeded = true,
                        message = "Plan updated",
                        registrationDate = applicant.RegistrationDate,
                        expiryDate = applicant.ExpiryDate,
                        isActive = applicant.IsActive
                    });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { succeeded = false, message = ex.ToString(), expiryDate = (DateTime?)null });
            }
        }

        [HttpPost]
        [Route("api/AppUser/RequestProUpgrade")]
        public IActionResult RequestProUpgrade([FromBody] RequestProUpgradeModel value)
        {
            try
            {
                // A logged-in user may only raise a request for their own account.
                string? tokenUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (!IsAdmin && (string.IsNullOrEmpty(tokenUserId) || tokenUserId != value.AppUserId.ToString()))
                {
                    return StatusCode(403, new
                    {
                        succeeded = false,
                        emailSent = false,
                        message = "You can only request an upgrade for your own account."
                    });
                }

                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var appUser = db.AppUserTbs.Where(x => x.AppUserId == value.AppUserId).FirstOrDefault();
                    if (appUser == null)
                    {
                        return Ok(new { succeeded = false, emailSent = false, message = "User not found." });
                    }

                    var applicant = db.ApplicantsTbs.Where(x => x.ApplicantId == appUser.ApplicantId).FirstOrDefault();
                    if (applicant == null)
                    {
                        return Ok(new { succeeded = false, emailSent = false, message = "Applicant not found." });
                    }

                    // Already on a full (non-trial) plan? Nothing to approve.
                    if (applicant.RegistrationDate.HasValue && applicant.ExpiryDate.HasValue)
                    {
                        double spanDays = (applicant.ExpiryDate.Value - applicant.RegistrationDate.Value).TotalDays;
                        if (spanDays > 6)
                        {
                            return Ok(new
                            {
                                succeeded = false,
                                emailSent = false,
                                status = "Approved",
                                message = "You already have a Pro plan."
                            });
                        }
                    }

                    // Persist the request so the owner can approve it from the
                    // admin panel (Users & Access -> Pro Requests). Re-tapping
                    // the button refreshes the existing pending row instead of
                    // creating duplicates or spamming the owner inbox.
                    DateTime requestedOn = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                    var pending = db.ProUpgradeRequestTbs
                        .Where(x => x.AppUserId == value.AppUserId && x.Status == "Pending")
                        .OrderByDescending(x => x.ProUpgradeRequestId)
                        .FirstOrDefault();
                    bool isNewRequest = pending == null;
                    if (pending == null)
                    {
                        pending = new ProUpgradeRequestTb
                        {
                            AppUserId = value.AppUserId,
                            ApplicantId = applicant.ApplicantId ?? 0,
                            RequestedOn = requestedOn,
                            Status = "Pending"
                        };
                        db.ProUpgradeRequestTbs.Add(pending);
                    }
                    else
                    {
                        pending.RequestedOn = requestedOn;
                    }
                    db.SaveChanges();

                    if (!isNewRequest)
                    {
                        // Already waiting on the owner — don't email again.
                        return Ok(new
                        {
                            succeeded = true,
                            emailSent = false,
                            status = "Pending",
                            message = "Your upgrade request is already pending approval. The owner will review it in the admin panel."
                        });
                    }

                    string courseName = "-";
                    var courseSelection = db.ApplicantCourseSelectionTbs
                        .Where(x => x.ApplicantId == applicant.ApplicantId)
                        .OrderByDescending(x => x.CourseSelectionId)
                        .FirstOrDefault();
                    if (courseSelection != null && courseSelection.CourseId > 0)
                    {
                        courseName = db.CourseTbs
                            .Where(x => x.CourseId == courseSelection.CourseId)
                            .Select(x => x.CourseName)
                            .FirstOrDefault() ?? "-";
                    }

                    string fullName = ((applicant.FirstName ?? "") + " " + (applicant.LastName ?? "")).Trim();
                    if (string.IsNullOrEmpty(fullName))
                    {
                        fullName = appUser.UserName ?? "-";
                    }

                    string subject = "Pro Upgrade Request - " + (appUser.UserName ?? fullName);
                    string body = EmailService.BuildInfoEmail(
                        "Pro Upgrade Request",
                        "A trial user requested an upgrade to the Pro version. The plan stays unchanged until you approve it.",
                        new List<KeyValuePair<string, string>>
                        {
                            new KeyValuePair<string, string>("Name", fullName),
                            new KeyValuePair<string, string>("Username", appUser.UserName ?? "-"),
                            new KeyValuePair<string, string>("Email", applicant.Email ?? "-"),
                            new KeyValuePair<string, string>("Mobile", applicant.Mobile ?? "-"),
                            new KeyValuePair<string, string>("Address", applicant.Address ?? "-"),
                            new KeyValuePair<string, string>("Course", courseName),
                            new KeyValuePair<string, string>("App User Id", appUser.AppUserId.ToString()),
                            new KeyValuePair<string, string>("Applicant Id", applicant.ApplicantId.ToString()),
                            new KeyValuePair<string, string>("Request Id", pending.ProUpgradeRequestId.ToString()),
                            new KeyValuePair<string, string>("Plan Start", applicant.RegistrationDate?.ToString("yyyy-MM-dd") ?? "-"),
                            new KeyValuePair<string, string>("Plan Expires", applicant.ExpiryDate?.ToString("yyyy-MM-dd") ?? "-"),
                            new KeyValuePair<string, string>("Requested On", requestedOn.ToString("yyyy-MM-dd HH:mm")),
                        },
                        "Approve in the admin panel: Users & Access > Pro Requests (Request Id " + pending.ProUpgradeRequestId + "). The plan changes to Pro only after you approve it.");

                    bool sent = EmailService.SendToAdmin(_config, subject, body, out string emailError);

                    // NOTE: the plan is intentionally NOT changed here — only a
                    // request email goes to the owner, who approves it manually
                    // in the admin panel.
                    return Ok(new
                    {
                        succeeded = true,
                        emailSent = sent,
                        status = "Pending",
                        message = sent
                            ? "Your upgrade request has been sent to the owner for approval."
                            : "Your request was recorded (email notification failed: " + emailError + ")"
                    });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { succeeded = false, emailSent = false, message = ex.Message });
            }
        }

        [AcceptVerbs("GET", "POST")]
        [Route("api/AppUser/ChangeAIAllowed")]
        public IActionResult ChangeAIAllowed([FromQuery] int appUserId, [FromQuery] bool isAIAllowed)
        {
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var appUser = db.AppUserTbs.Where(x => x.AppUserId == appUserId).FirstOrDefault();
                    if (appUser == null)
                    {
                        return Ok(new { succeeded = false, message = "User not found" });
                    }

                    appUser.IsAIAllowed = isAIAllowed;
                    db.SaveChanges();

                    return Ok(new
                    {
                        succeeded = true,
                        message = isAIAllowed ? "AI access enabled." : "AI access disabled.",
                        isAIAllowed = appUser.IsAIAllowed
                    });
                }
            }
            catch (Exception ex)
            {
                return Ok(new { succeeded = false, message = ex.ToString() });
            }
        }

        [HttpPost]
        [Route("api/AppUser/UpdateAppUser")]
        public IActionResult UpdateAppUser([FromBody] AppUserModel value)
        {
            String _response = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.AppUserTbs.Where(x => x.ApplicantId == value.ApplicantId).FirstOrDefault();
                if (Query != null)
                {
                    Query.UserName = value.UserName;
                    Query.ApplicantId = value.ApplicantId;
                    db.SaveChanges();
                    _response = "Update Succesuly";
                }
            }
            return Ok(_response);
        }

        [HttpPost]
        [Route("api/AppUser/ChangePassword")]
        public IActionResult ChangePassword([FromBody] AppUserModel value)
        {
            String _response = "User not found.";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.AppUserTbs.Where(x => x.AppUserId == value.AppUserId).FirstOrDefault();
                if (Query != null && !string.IsNullOrEmpty(value.Password))
                {
                    Query.Password = Encrption.Encrypt(value.Password);
                    db.SaveChanges();
                    _response = "Password updated successfully.";
                }
            }
            return Ok(_response);
        }

        [HttpGet]
        [Route("api/AppUser/DeleteUser/{id}")]
        public IActionResult DeleteUser(int id)
        {
            String _response = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Delete = db.AppUserTbs.Where(x => x.AppUserId == id).FirstOrDefault();
                db.AppUserTbs.Remove(Delete);
                db.SaveChanges();
                _response = "Delete Successfuly.";
            }
            return Ok(_response);
        }

        [HttpGet]
        [Route("api/AppUser/ResetDeviceId/{id}")]
        public IActionResult ResetDeviceId(int id)
        {
            String _response = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Update = db.AppUserTbs.Where(x => x.AppUserId == id).FirstOrDefault();
                if (Update != null)
                {
                    Update.DeviceId = "";
                    db.SaveChanges();
                    _response = "Device Id Reset Successfuly.";
                }
            }
            return Ok(_response);
        }

        [HttpGet]
        [Route("api/AppUser/ChangeStatus/{id}")]
        public IActionResult ChangeStatus(int id)
        {
            String _response = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.AppUserTbs.Where(x => x.AppUserId == id).FirstOrDefault();
                var AppInformaiton = db.AppUserTbs.Where(x => x.ApplicantId == id).FirstOrDefault();
                if (Query != null)
                {
                    if (Query.Status == false)
                    {
                        Query.Status = true;
                    }
                    else
                    {
                        Query.Status = false;
                        String _message = "Dear Mr/Mrs " + AppInformaiton.UserName + "Dear Customer your account has been suspended, please contact to Administrator..";
                        PushNotification.PushNotificationTOuser(AppInformaiton.Token, _message, "Account Block");
                    }
                }
                db.SaveChanges();
                _response = "Update Successfuly.";
            }
            return Ok(_response);
        }

        [HttpGet]
        [Route("api/AppUser/BlockUser/{id}")]
        public IActionResult BlockUser(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var appUser = db.AppUserTbs.Where(x => x.AppUserId == id).FirstOrDefault();
                if (appUser == null)
                {
                    return Ok(new { succeeded = false, message = "User not found." });
                }
                if (appUser.Status == false)
                {
                    return Ok(new { succeeded = true, message = "User is already blocked." });
                }
                appUser.Status = false;
                db.SaveChanges();
                if (!string.IsNullOrEmpty(appUser.Token))
                {
                    String _message = "Dear Mr/Mrs " + appUser.UserName + ", your account has been suspended. Please contact the administrator.";
                    PushNotification.PushNotificationTOuser(appUser.Token, _message, "Account Block");
                }
                return Ok(new { succeeded = true, message = "User blocked successfully." });
            }
        }

        [HttpGet]
        [Route("api/AppUser/UnblockUser/{id}")]
        public IActionResult UnblockUser(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var appUser = db.AppUserTbs.Where(x => x.AppUserId == id).FirstOrDefault();
                if (appUser == null)
                {
                    return Ok(new { succeeded = false, message = "User not found." });
                }
                if (appUser.Status == true)
                {
                    return Ok(new { succeeded = true, message = "User is already active." });
                }
                appUser.Status = true;
                db.SaveChanges();
                return Ok(new { succeeded = true, message = "User unlocked successfully." });
            }
        }

        [HttpGet]
        [Route("api/AppUser/CheckAppUserStatus/{id}")]
        public bool CheckAppUserStatus(int id)
        {
            bool _response = true;
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.AppUserTbs.Where(x => x.AppUserId == id).FirstOrDefault();
                if (Query != null)
                {
                    int ApplicantId = Query.ApplicantId;
                    var ApplicantInformation = db.ApplicantsTbs.Where(x => x.ApplicantId == ApplicantId).FirstOrDefault();
                    bool CheckCourseExpiry = AppUserValidation.CheckCourseExpire(ApplicantInformation.RegistrationDate ?? default, ApplicantInformation.ExpiryDate ?? DateTime.MaxValue, ApplicantInformation.IsActive ?? false);
                    if (CheckCourseExpiry == true)
                    {
                        var UpdateUser = db.ApplicantsTbs.Where(x => x.ApplicantId == ApplicantId).FirstOrDefault();
                        UpdateUser.IsActive = false;

                        var UpdateAppUser = db.AppUserTbs.Where(x => x.ApplicantId == ApplicantId).FirstOrDefault();
                        UpdateAppUser.Status = false;
                        db.SaveChanges();

                        _response = false;
                    }
                    if (ApplicantInformation.IsActive == false)
                    {
                        _response = false;
                    }
                    if (Query.Status == false)
                    {
                        _response = false;
                    }
                }
            }
            return _response;
        }

        [HttpPost]
        [Route("api/AppUser/UpdateToken")]
        public IActionResult UpdateToken([FromBody] AppUserModel value)
        {
            String _response = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.AppUserTbs.Where(x => x.AppUserId == value.AppUserId).FirstOrDefault();
                if (Query != null)
                {
                    Query.Token = value.Token;
                    db.SaveChanges();
                    _response = "Update Succesuly";
                }
            }
            return Ok(_response);
        }

        [HttpGet]
        [Route("api/AppUser/UserPendingExamCount/{id}")]
        public IActionResult UserPendingExamCount(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                int GetAppUserId = (int)db.AppUserTbs.Where(x => x.AppUserId == id).Select(x => x.ApplicantId).FirstOrDefault();
                var PendingTestCounte = db.AppUserTestTbs.Where(x => x.ApplicantId == GetAppUserId && x.IsCompleted == false).Count();
                return Ok(PendingTestCounte);
            }
        }

        [HttpPost]
        [Route("api/AppUser/ChatMessageSend")]
        public void ChatMessageSend([FromBody] ChatModel value)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                ChatTb chatTb = new ChatTb();
                chatTb.AppUserId = value.AppUserId;
                chatTb.ReceiverId = value.ReceiverId;
                chatTb.DateTime = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                chatTb.IsSender = false;
                chatTb.IsRead = true;
                chatTb.Message = value.Message;
                db.ChatTbs.Add(chatTb);
                db.SaveChanges();

                ChatTb chatTb1 = new ChatTb();
                chatTb1.AppUserId = value.ReceiverId;
                chatTb1.ReceiverId = value.AppUserId;
                chatTb1.DateTime = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                chatTb1.IsSender = true;
                chatTb.IsRead = false;
                chatTb1.Message = value.Message;
                db.ChatTbs.Add(chatTb1);
                db.SaveChanges();

                var ApplicantInformation = (from c in db.AppUserTbs
                                            join d in db.ApplicantsTbs on c.ApplicantId equals d.ApplicantId
                                            where c.AppUserId == value.ReceiverId
                                            select new { c.Token, d.FirstName, d.LastName }).FirstOrDefault();
                String _message = ApplicantInformation.FirstName + ApplicantInformation.LastName + " : " + value.Message;
                PushNotification.PushNotificationTOuser(ApplicantInformation.Token, _message, "Message");
            }
        }

        [HttpGet]
        [Route("api/AppUser/GetChatMessage/{id}")]
        public IActionResult GetChatMessage(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var chat = db.ChatTbs.Where(x => x.AppUserId == id).ToList();
                return Ok(chat);
            }
        }

        [HttpGet]
        [Route("api/AppUser/SeenMessage/{id}")]
        public void SeenMessage(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var chat = db.ChatTbs.Where(x => x.AppUserId == id && x.IsRead == false).ToList();
                foreach (var q in chat)
                {
                    var Update = db.ChatTbs.Where(x => x.ChatId == q.ChatId).FirstOrDefault();
                    Update.IsRead = true;
                    db.SaveChanges();
                }
            }
        }

        [HttpPost]
        [Route("api/AppUser/GetUserScreenShots")]
        public IActionResult GetUserScreenShots([FromBody] PaginationFilter filter)
        {
            List<AppUserModel> list = new List<AppUserModel>();

            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from c in db.AppUserScreenshotTBs
                             where c.ApplicantId == filter.ApplicantId
                             select c).OrderByDescending(x => x.ScreenShotId).ToList();

                foreach (var q in Query)
                {
                    list.Add(new AppUserModel
                    {
                        ImageUrl = q.ImageUrl,
                        DateTime = q.DateTime
                    });
                }
                var pagedData = list
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize).ToList();
                var totalRecords = Query.Count();
                return Ok(new PagedResponse<List<AppUserModel>>(pagedData, filter.PageNumber, filter.PageSize, totalRecords));
            }
        }

        [HttpPost]
        [Route("api/AppUser/GetAllUserScreenShots")]
        public IActionResult GetAllUserScreenShots([FromBody] PaginationFilter filter)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from s in db.AppUserScreenshotTBs
                             join a in db.ApplicantsTbs on s.ApplicantId equals a.ApplicantId
                             select new
                             {
                                 ScreenShotId = s.ScreenShotId,
                                 ImageUrl = s.ImageUrl,
                                 DateTime = s.DateTime,
                                 ApplicantId = s.ApplicantId,
                                 ApplicantName = a.FirstName + " " + a.LastName
                             })
                             .OrderByDescending(x => x.DateTime)
                             .ToList();

                var pagedData = Query
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize).ToList();
                var totalRecords = Query.Count();
                return Ok(new PagedResponse<object>(pagedData, filter.PageNumber, filter.PageSize, totalRecords));
            }
        }
    }
}
