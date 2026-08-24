using MdLabScience.DbContext;
using MdLabScience.Models;
using MdLabScience.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using StudentCertificateManagement.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace MdLabScience.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ApplicantController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private static TimeZoneInfo Pakistan_Standard_Time = TimeZoneInfo.FindSystemTimeZoneById("Arabian Standard Time");

        public ApplicantController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost]
        [Route("api/Applicant/GetAllApplicants")]
        public async Task<IActionResult> GetAllApplicants([FromBody] PaginationFilter filter)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                string status = string.IsNullOrEmpty(filter.Status) ? "All" : filter.Status;
                string searchTerm = filter.SearchTerm ?? "";
                string[] tokens = searchTerm.Split(new[] { ' ', '\t' }, StringSplitOptions.RemoveEmptyEntries);

                var baseQuery = from c in db.ApplicantsTbs
                                join m in db.CountryTbs on c.CountryId equals m.CountryId
                                select new { c, m };

                foreach (string token in tokens)
                {
                    baseQuery = baseQuery.Where(x =>
                        (x.c.FirstName ?? "").Contains(token)
                        || (x.c.LastName ?? "").Contains(token)
                        || (x.c.RegistrationNo ?? "").Contains(token)
                        || (x.c.Mobile ?? "").Contains(token)
                        || (x.c.Email ?? "").Contains(token)
                        || x.m.CoutryName.Contains(token)
                        || db.ApplicantCourseSelectionTbs.Any(ac =>
                               ac.ApplicantId == x.c.ApplicantId
                               && db.CourseTbs.Any(ct => ct.CourseId == ac.CourseId && (ct.CourseName ?? "").Contains(token))));
                }

                if (status == "Active")
                {
                    baseQuery = baseQuery.Where(x => x.c.IsActive == true);
                }
                else if (status == "Expired")
                {
                    baseQuery = baseQuery.Where(x => x.c.IsActive == false);
                }

                if (filter.CountryId.HasValue)
                {
                    int countryId = filter.CountryId.Value;
                    baseQuery = baseQuery.Where(x => x.c.CountryId == countryId);
                }

                if (filter.CourseId.HasValue)
                {
                    int courseId = filter.CourseId.Value;
                    baseQuery = baseQuery.Where(x => db.ApplicantCourseSelectionTbs.Any(ac => ac.ApplicantId == x.c.ApplicantId && ac.CourseId == courseId));
                }

                var query = baseQuery.Select(x => new
                {
                    FirstName = x.c.FirstName,
                    LastName = x.c.LastName,
                    Mobile = x.c.Mobile,
                    OtherMobile = x.c.OtherMobile,
                    PhotoUrl = x.c.PhotoUrl,
                    RegistrationDate = x.c.RegistrationDate,
                    CreatedOn = x.c.CreatedOn,
                    Address = x.c.Address,
                    Email = x.c.Email,
                    RegistrationNo = x.c.RegistrationNo,
                    CoutryName = x.m.CoutryName,
                    ApplicantId = x.c.ApplicantId,
                    CountryId = x.c.CountryId,
                    ExpiryDate = x.c.ExpiryDate,
                    IsActive = x.c.IsActive
                });

                var totalRecords = await query.CountAsync();

                var pagedData = await query
                    .OrderByDescending(x => x.ApplicantId)
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync();

                List<int> applicantIds = pagedData.Select(q => (int)q.ApplicantId).ToList();

                var courseMap = applicantIds.Count == 0
                    ? new Dictionary<int, CourseModel>()
                    : (from ac in db.ApplicantCourseSelectionTbs
                       join c in db.CourseTbs on ac.CourseId equals c.CourseId
                       where applicantIds.Contains(ac.ApplicantId)
                       select new { ac.ApplicantId, ac.CourseId, c.CourseName }).ToList()
                       .GroupBy(x => x.ApplicantId)
                       .ToDictionary(g => g.Key, g => new CourseModel { CourseId = g.First().CourseId, CourseName = g.First().CourseName });

                var applicantModels = pagedData.Select(q => new ApplicantModel
                {
                    ApplicantId = (int)q.ApplicantId,
                    RegistrationDate = q.RegistrationDate ?? default,
                    RegistrationNo = q.RegistrationNo,
                    Email = q.Email,
                    Address = q.Address,
                    CreatedOn = q.CreatedOn ?? default,
                    PhotoUrl = q.PhotoUrl,
                    Mobile = q.Mobile,
                    OtherMobile = q.OtherMobile,
                    FirstName = q.FirstName,
                    LastName = q.LastName,
                    CoutryName = q.CoutryName,
                    CountryId = q.CountryId ?? 0,
                    ExpiryDate = q.ExpiryDate ?? default,
                    IsActive = q.IsActive ?? false,
                    CourseMD = courseMap.TryGetValue((int)q.ApplicantId, out var course) ? course : null
                }).ToList();

                return Ok(new PagedResponse<List<ApplicantModel>>(applicantModels, filter.PageNumber, filter.PageSize, totalRecords));
            }
        }

        [HttpGet]
        [Route("api/Applicant/GetActiveApplicants")]
        public IActionResult GetActiveApplicants()
        {
            List<ApplicantModel> list = new List<ApplicantModel>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from c in db.ApplicantsTbs
                             join m in db.CountryTbs on c.CountryId equals m.CountryId
                             where c.IsActive == true
                             select new
                             {
                                 c.FirstName,
                                 c.LastName,
                                 c.Mobile,
                                 c.OtherMobile,
                                 c.PhotoUrl,
                                 c.RegistrationDate,
                                 c.CreatedOn,
                                 c.Address,
                                 c.Email,
                                 c.RegistrationNo,
                                 m.CoutryName,
                                 c.ApplicantId,
                                 c.CountryId,
                                 c.ExpiryDate,
                                 c.IsActive
                             }).ToList();
                foreach (var q in Query)
                {
                    bool CheckCourseExpiry = AppUserValidation.CheckCourseExpire(q.RegistrationDate ?? default, q.ExpiryDate ?? DateTime.MaxValue, q.IsActive ?? false);
                    if (CheckCourseExpiry == true)
                    {
                        var UpdateUser = db.ApplicantsTbs.Where(x => x.ApplicantId == q.ApplicantId).FirstOrDefault();
                        UpdateUser.IsActive = false;

                        var UpdateAppUser = db.AppUserTbs.Where(x => x.ApplicantId == q.ApplicantId).FirstOrDefault();
                        if (UpdateAppUser != null)
                        {
                            UpdateAppUser.Status = false;
                            db.SaveChanges();
                            String _message = "Dear Mr/Mrs " + UpdateAppUser.UserName + "Dear Customer your account has been suspended, please contact to Administrator..";
                            PushNotification.PushNotificationTOuser(UpdateAppUser.Token, _message, "Account Block");
                        }
                    }
                    list.Add(new ApplicantModel
                    {
                        ApplicantId = (int)q.ApplicantId,
                        RegistrationDate = q.RegistrationDate ?? default,
                        RegistrationNo = q.RegistrationNo,
                        Email = q.Email,
                        Address = q.Address,
                        CreatedOn = q.CreatedOn ?? default,
                        PhotoUrl = q.PhotoUrl,
                        Mobile = q.Mobile,
                        OtherMobile = q.OtherMobile,
                        FirstName = q.FirstName,
                        LastName = q.LastName,
                        CoutryName = q.CoutryName,
                        CountryId = q.CountryId ?? 0,
                        ExpiryDate = q.ExpiryDate ?? default,
                        IsActive = q.IsActive ?? false
                    });
                }
                return Ok(list);
            }
        }

        [HttpGet]
        [Route("api/Applicant/GetActiveApplicantsByCourse/{courseId}")]
        public IActionResult GetActiveApplicants(int courseId)
        {
            List<ApplicantModel> list = new List<ApplicantModel>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from c in db.ApplicantsTbs
                             join m in db.CountryTbs on c.CountryId equals m.CountryId
                             join d in db.ApplicantCourseSelectionTbs on c.ApplicantId equals d.ApplicantId
                             where c.IsActive == true && d.CourseId == courseId
                             select new
                             {
                                 c.FirstName,
                                 c.LastName,
                                 c.Mobile,
                                 c.OtherMobile,
                                 c.PhotoUrl,
                                 c.RegistrationDate,
                                 c.CreatedOn,
                                 c.Address,
                                 c.Email,
                                 c.RegistrationNo,
                                 m.CoutryName,
                                 c.ApplicantId,
                                 c.CountryId,
                             }).ToList();
                foreach (var q in Query)
                {
                    List<CourseModel> courseList = new List<CourseModel>();
                    var CourseInfo = (from c in db.ApplicantCourseSelectionTbs
                                      join d in db.CourseTbs on c.CourseId equals d.CourseId
                                      where c.ApplicantId == q.ApplicantId
                                      select new { d.CourseId, d.CourseName }).ToList();
                    foreach (var d in CourseInfo)
                    {
                        courseList.Add(new CourseModel
                        {
                            CourseId = d.CourseId,
                            CourseName = d.CourseName
                        });
                    }
                    list.Add(new ApplicantModel
                    {
                        ApplicantId = (int)q.ApplicantId,
                        RegistrationDate = q.RegistrationDate ?? default,
                        RegistrationNo = q.RegistrationNo,
                        Email = q.Email,
                        Address = q.Address,
                        CreatedOn = q.CreatedOn ?? default,
                        PhotoUrl = q.PhotoUrl,
                        Mobile = q.Mobile,
                        OtherMobile = q.OtherMobile,
                        FirstName = q.FirstName,
                        LastName = q.LastName,
                        CoutryName = q.CoutryName,
                        CountryId = q.CountryId ?? 0,
                        CourseName = courseList
                    });
                }
                return Ok(list);
            }
        }

        [HttpPost]
        [Route("api/Applicant/SaveApplicants")]
        public IActionResult SaveApplicants([FromBody] ApplicantModel value)
        {
            String _response = "";
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    int MaxId = 1;
                    var GetMaxQuery = db.ApplicantsTbs.OrderByDescending(x => x.RecordId).Select(x => x.ApplicantId).FirstOrDefault();
                    if (GetMaxQuery != null)
                    {
                        MaxId = 1 + int.Parse(GetMaxQuery.ToString());
                    }
                    ApplicantsTb applicantsTb = new ApplicantsTb();
                    applicantsTb.ApplicantId = MaxId;
                    applicantsTb.RegistrationNo = "MDS-" + Convert.ToDateTime(value.RegistrationDate).Year.ToString() + "-" + MaxId.ToString();
                    applicantsTb.FirstName = value.FirstName;
                    applicantsTb.LastName = value.LastName;
                    applicantsTb.Email = value.Email;
                    applicantsTb.Mobile = value.Mobile;
                    applicantsTb.OtherMobile = value.OtherMobile;
                    applicantsTb.Address = value.Address;
                    applicantsTb.ExpiryDate = value.ExpiryDate;
                    applicantsTb.IsActive = true;
                    applicantsTb.RegistrationDate = value.RegistrationDate;
                    var pendingStatusId = db.ApplicationStatusTbs
                        .Where(s => s.StatusName == "Pending")
                        .Select(s => (int?)s.ApplicationStatusId)
                        .FirstOrDefault();
                    if (pendingStatusId.HasValue)
                    {
                        applicantsTb.ApplicationStatusId = pendingStatusId.Value;
                    }
                    applicantsTb.UserNo = value.UserNo;
                    applicantsTb.CreatedOn = DateTime.Now;
                    applicantsTb.CountryId = value.CountryId;
                    if (!String.IsNullOrEmpty(value.PhotoUrl))
                    {
                        byte[] ImageBytes = Convert.FromBase64String(value.PhotoUrl);
                        string folder = Path.Combine(_env.ContentRootPath, "Images", "Applicant");
                        Directory.CreateDirectory(folder);
                        var path = Path.Combine(folder, MaxId + ".png");
                        System.IO.File.WriteAllBytes(path, ImageBytes);
                        applicantsTb.PhotoUrl = "Images/Applicant/" + MaxId.ToString() + ".png";
                    }
                    db.ApplicantsTbs.Add(applicantsTb);

                    ApplicantCourseSelectionTb course = new ApplicantCourseSelectionTb();
                    course.ApplicantId = MaxId;
                    course.CourseId = value.CourseId;
                    course.Date = value.RegistrationDate;
                    db.ApplicantCourseSelectionTbs.Add(course);

                    DataFlowTransferTB dataFlowTransferTB = new DataFlowTransferTB();
                    dataFlowTransferTB.ApplicantId = MaxId;
                    db.DataFlowTransferTBs.Add(dataFlowTransferTB);

                    DataFlowVerificationTb dataFlow = new DataFlowVerificationTb();
                    dataFlow.ApplicantId = MaxId;
                    db.DataFlowVerificationTbs.Add(dataFlow);

                    AdditionalDocumentTb additionalDocumentTb = new AdditionalDocumentTb();
                    additionalDocumentTb.ApplicantId = MaxId;
                    db.AdditionalDocumentTbs.Add(additionalDocumentTb);

                    db.SaveChanges();
                    _response = "Save Succesfuly..!";
                }
            }
            catch (Exception ex)
            {
                _response = ex.ToString();
            }
            return Ok(_response);
        }

        [HttpPost]
        [Route("api/Applicant/UpdateApplicants")]
        public IActionResult UpdateApplicants([FromBody] ApplicantModel value)
        {
            String _response = "";
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var Query = db.ApplicantsTbs.Where(x => x.ApplicantId == value.ApplicantId).FirstOrDefault();
                    if (Query != null)
                    {
                        Query.FirstName = value.FirstName;
                        Query.LastName = value.LastName;
                        Query.Email = value.Email;
                        Query.Mobile = value.Mobile;
                        Query.OtherMobile = value.OtherMobile;
                        Query.Address = value.Address;
                        Query.UserNo = value.UserNo;
                        Query.ExpiryDate = value.ExpiryDate;
                        Query.CountryId = value.CountryId;
                        if (!String.IsNullOrEmpty(value.PhotoUrl))
                        {
                            if (!String.IsNullOrEmpty(Query.PhotoUrl))
                            {
                                var oldPath = Path.Combine(_env.ContentRootPath, Query.PhotoUrl);
                                if (System.IO.File.Exists(oldPath))
                                {
                                    System.IO.File.Delete(oldPath);
                                }
                            }
                            byte[] ImageBytes = Convert.FromBase64String(value.PhotoUrl);
                            string folder = Path.Combine(_env.ContentRootPath, "Images", "Applicant");
                            Directory.CreateDirectory(folder);
                            var path = Path.Combine(folder, value.ApplicantId + ".png");
                            System.IO.File.WriteAllBytes(path, ImageBytes);
                            Query.PhotoUrl = "Images/Applicant/" + value.ApplicantId.ToString() + ".png";
                        }

                        var UpdateExtingCourses = db.ApplicantCourseSelectionTbs.Where(x => x.ApplicantId == value.ApplicantId).FirstOrDefault();
                        if (UpdateExtingCourses != null)
                        {
                            UpdateExtingCourses.CourseId = value.CourseId;
                            db.SaveChanges();
                        }

                        db.SaveChanges();
                        _response = "Update Succesfuly..!";
                    }
                }
            }
            catch (Exception ex)
            {
                _response = ex.ToString();
            }
            return Ok(_response);
        }

        [HttpPost]
        [Route("api/Applicant/UpdateApplicantsServices")]
        public IActionResult UpdateApplicantsServices()
        {
            String _response = "";
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    ApplicantServiceModel value = new ApplicantServiceModel();

                    String UserNo = Request.Form["UserNo"];
                    value.DataFlowRemarks = Request.Form["DataFlowRemarks"];
                    value.ApplicantId = int.Parse(Request.Form["ApplicantId"]);

                    var Query = db.DataFlowVerificationTbs.Where(x => x.ApplicantId == value.ApplicantId).FirstOrDefault();
                    if (Query != null)
                    {
                        var uploadFiles = Request.Form.Files;
                        if (Request.Form.Files.Count > 0)
                        {
                            for (int i = 0; i < uploadFiles.Count; i++)
                            {
                                var postedFile = uploadFiles[i];
                                var fileName = Path.GetFileName(postedFile.FileName);
                                var path = Path.Combine(_env.ContentRootPath, "Uploads", fileName);
                                using (var stream = new FileStream(path, FileMode.Create))
                                {
                                    postedFile.CopyTo(stream);
                                }

                                if (fileName.StartsWith("Degree") == true)
                                {
                                    value.Degree = "Uploads/" + fileName.ToString();
                                    Query.Degree = value.Degree;
                                }
                                if (fileName.StartsWith("Photo") == true)
                                {
                                    value.Photo = "Uploads/" + fileName.ToString();
                                    Query.Photo = value.Photo;
                                }
                                if (fileName.StartsWith("Passport") == true)
                                {
                                    value.Passport = "Uploads/" + fileName.ToString();
                                    Query.Passport = value.Passport;
                                }
                                if (fileName.StartsWith("RegistrationCertificate") == true)
                                {
                                    value.RegistrationCertificate = "Uploads/" + fileName.ToString();
                                    Query.RegistrationCertificate = value.RegistrationCertificate;
                                }
                                if (fileName.StartsWith("ExperienceCertificate") == true)
                                {
                                    value.ExperienceCertificate = "Uploads/" + fileName.ToString();
                                    Query.ExperienceCertificate = value.ExperienceCertificate;
                                }
                                if (fileName.StartsWith("DegreeMarkSheet") == true)
                                {
                                    value.DegreeMarkSheet = "Uploads/" + fileName.ToString();
                                    Query.DegreeMarkSheet = value.DegreeMarkSheet;
                                }
                                if (fileName.StartsWith("IntermediateMarkSheet") == true)
                                {
                                    value.IntermediateMarkSheet = "Uploads/" + fileName.ToString();
                                    Query.IntermediateMarkSheet = value.IntermediateMarkSheet;
                                }
                                if (fileName.StartsWith("Matricsheetdegree") == true)
                                {
                                    value.MatricMarketSheet = "Uploads/" + fileName.ToString();
                                    Query.MatricMarketSheet = value.MatricMarketSheet;
                                }
                                if (fileName.StartsWith("AdditionalDocument") == true)
                                {
                                    value.AdditionalDocuments = "Uploads/" + fileName.ToString();
                                    Query.AdditionalDocuments = value.AdditionalDocuments;
                                }
                                if (fileName.StartsWith("GoodStandingDocuments") == true)
                                {
                                    value.GoodStandingDocuments = "Uploads/" + fileName.ToString();
                                    Query.GoodStandingDocuments = value.GoodStandingDocuments;
                                }
                            }
                        }

                        Query.DataFlowRemarks = value.DataFlowRemarks;
                        db.SaveChanges();
                        _response = "Update Succesfuly..!";
                    }
                }
            }
            catch (Exception ex)
            {
                _response = ex.ToString();
            }
            return Ok(_response);
        }

        [HttpGet]
        [Route("api/Applicant/GetApplicantServiceById/{id}")]
        public IActionResult GetApplicantServiceById(int id)
        {
            String _response = "";
            List<ApplicantServiceModel> list = new List<ApplicantServiceModel>();

            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var Query = db.DataFlowVerificationTbs.Where(x => x.ApplicantId == id).FirstOrDefault();
                    if (Query != null)
                    {
                        list.Add(new ApplicantServiceModel
                        {
                            DataFlowRemarks = Query.DataFlowRemarks,
                            Degree = Query.Degree,
                            Photo = Query.Photo,
                            Others = Query.Others,
                            LicenseTransfer = Query.LicenseTransfer,
                            AdditionalDocuments = Query.AdditionalDocuments,
                            RegistrationCertificate = Query.RegistrationCertificate,
                            ExperienceCertificate = Query.ExperienceCertificate,
                            MatricMarketSheet = Query.MatricMarketSheet,
                            IntermediateMarkSheet = Query.IntermediateMarkSheet,
                            Passport = Query.Passport,
                            Matricsheetdegree = Query.MatricMarketSheet,
                            DegreeMarkSheet = Query.DegreeMarkSheet,
                            GoodStandingDocuments = Query.GoodStandingDocuments
                        });
                    }
                    var QueryDataFlowTransfer = db.DataFlowTransferTBs.Where(x => x.ApplicantId == id).FirstOrDefault();
                    if (Query != null)
                    {
                        list[0].DataFlowTransferred = QueryDataFlowTransfer.DataFlowTransferred;
                    }

                    var AdditionalDocumentQuery = db.AdditionalDocumentTbs.Where(x => x.ApplicantId == id).FirstOrDefault();
                    if (Query != null)
                    {
                        list[0].AdditionalDocumentsDataflow = AdditionalDocumentQuery.AdditionalDocumentsDataflow;
                        list[0].AdditionalDocumentsDataflowRemarks = AdditionalDocumentQuery.AdditionalDocumentsDataflowRemarks;
                    }
                }
            }
            catch (Exception ex)
            {
                _response = ex.ToString();
            }
            return Ok(list);
        }

        [HttpGet]
        [Route("api/Applicant/ApplicantCompleteProfile/{id}")]
        public IActionResult ApplicantCompleteProfile(int id)
        {
            bool _response = true;
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var Query = db.DataFlowVerificationTbs.Where(x => x.ApplicantId == id).ToList();
                    var CheckDocumnets = Query.Where(x => x.Degree == null || x.Photo == null || x.MatricMarketSheet == null || x.IntermediateMarkSheet == null || x.RegistrationCertificate == null || x.ExperienceCertificate == null || x.GoodStandingDocuments == null).Any();
                    if (CheckDocumnets == true)
                    {
                        _response = false;
                    }
                    else
                    {
                        _response = true;
                    }
                }
            }
catch (Exception ex)
            {
                var msg = ex.Message;
                if (ex.InnerException != null) msg += " | Inner: " + ex.InnerException.Message;
                return StatusCode(500, new { succeeded = false, message = msg });
            }
            return Ok(_response);
        }

        [HttpGet]
        [Route("api/Applicant/ChangeApplicantStatus/{id}")]
        public IActionResult ChangeApplicantStatus(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.ApplicantsTbs.Where(x => x.ApplicantId == id).FirstOrDefault();
                var AppInformaiton = db.AppUserTbs.Where(x => x.ApplicantId == id).FirstOrDefault();
                if (Query != null)
                {
                    if (Query.IsActive == true)
                    {
                        Query.IsActive = false;
                        if (AppInformaiton != null)
                        {
                            String _message = "Dear Mr/Mrs " + (AppInformaiton.UserName ?? "") + "Dear Customer your account has been suspended, please contact to Administrator..";
                            PushNotification.PushNotificationTOuser(AppInformaiton.Token, _message, "Account Block");
                            AppInformaiton.Status = false;
                        }
                    }
                    else
                    {
                        Query.IsActive = true;
                        if (AppInformaiton != null)
                        {
                            AppInformaiton.Status = true;
                        }
                    }
                    db.SaveChanges();
                }
                return Ok("Update Sucessfuly.");
            }
        }

        [HttpGet]
        [Route("api/Applicant/GetApplicant/{id}")]
        public IActionResult GetApplicant(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var app = db.ApplicantsTbs.Where(x => x.ApplicantId == id).FirstOrDefault();
                if (app == null)
                    return NotFound("Applicant not found");
                var statusName = db.ApplicationStatusTbs
                    .Where(s => s.ApplicationStatusId == app.ApplicationStatusId)
                    .Select(s => s.StatusName).FirstOrDefault();
                var country = db.CountryTbs
                    .Where(c => c.CountryId == app.CountryId)
                    .Select(c => c.CoutryName).FirstOrDefault();
                var course = (from cs in db.ApplicantCourseSelectionTbs
                              join co in db.CourseTbs on cs.CourseId equals co.CourseId
                              where cs.ApplicantId == id
                              select co.CourseName).FirstOrDefault();
                return Ok(new
                {
                    applicantId = app.ApplicantId,
                    registrationNo = app.RegistrationNo,
                    firstName = app.FirstName,
                    lastName = app.LastName,
                    mobile = app.Mobile,
                    email = app.Email,
                    address = app.Address,
                    country = country,
                    course = course,
                    applicationStatusId = app.ApplicationStatusId,
                    statusName = statusName,
                    isActive = app.IsActive
                });
            }
        }

        [HttpPost]
        [Route("api/Applicant/SetApplicantStatus/{applicantId}/{statusId}")]
        public IActionResult SetApplicantStatus(int applicantId, int statusId, [FromBody] SetApplicantStatusMD body)
        {
            var reason = (body?.Reason ?? "").Trim();
            if (reason.Length < 10)
                return BadRequest(new { succeeded = false, message = "A reason of at least 10 characters is required." });

            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                EnsureStatusTransactionsTable(db);
                var app = db.ApplicantsTbs.Where(x => x.ApplicantId == applicantId).FirstOrDefault();
                if (app == null)
                    return NotFound("Applicant not found");
                var status = db.ApplicationStatusTbs.Where(s => s.ApplicationStatusId == statusId).FirstOrDefault();
                if (status == null)
                    return BadRequest("Invalid status");
                if (app.ApplicationStatusId == statusId)
                    return Ok(new { succeeded = true, applicantId, applicationStatusId = statusId, statusName = status.StatusName, message = "Status unchanged." });

                var oldStatusId = app.ApplicationStatusId;
                app.ApplicationStatusId = statusId;
                db.ApplicantStatusTransactionsTbs.Add(new ApplicantStatusTransactionsTb
                {
                    ApplicantId = applicantId,
                    OldStatusId = oldStatusId,
                    StatusId = statusId,
                    DateTime = DateTime.Now,
                    Remarks = reason,
                    Category = string.IsNullOrWhiteSpace(body?.Category) ? null : body.Category.Trim(),
                    ChangedBy = User?.Identity?.Name
                });
                db.SaveChanges();
                return Ok(new { succeeded = true, applicantId, applicationStatusId = statusId, statusName = status.StatusName, message = "Status updated." });
            }
        }

        [HttpGet]
        [Route("api/Applicant/GetApplicantStatusHistory/{id}")]
        public IActionResult GetApplicantStatusHistory(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                EnsureStatusTransactionsTable(db);
                var rows = (
                    from h in db.ApplicantStatusTransactionsTbs
                    where h.ApplicantId == id
                    join ns in db.ApplicationStatusTbs on h.StatusId equals ns.ApplicationStatusId into nsg
                    from ns in nsg.DefaultIfEmpty()
                    join os in db.ApplicationStatusTbs on h.OldStatusId equals os.ApplicationStatusId into osg
                    from os in osg.DefaultIfEmpty()
                    orderby h.DateTime descending, h.StatusTransactionId descending
                    select new
                    {
                        historyId = h.StatusTransactionId,
                        applicantId = h.ApplicantId,
                        oldStatusId = h.OldStatusId,
                        oldStatusName = os != null ? os.StatusName : null,
                        newStatusId = h.StatusId,
                        newStatusName = ns != null ? ns.StatusName : null,
                        reason = h.Remarks,
                        category = h.Category,
                        changedBy = h.ChangedBy,
                        changedAt = h.DateTime
                    }
                ).ToList();
                return Ok(rows);
            }
        }

        private static void EnsureStatusTransactionsTable(MdLabScienceDbEntities db)
        {
            db.Database.ExecuteSqlRaw(@"
IF OBJECT_ID(N'dbo.ApplicantStatusTransactionsTb', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.ApplicantStatusTransactionsTb (
        StatusTransactionId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        StatusId INT NULL,
        [DateTime] DATETIME NULL,
        Remarks NVARCHAR(MAX) NULL
    );
END");
            db.Database.ExecuteSqlRaw(@"
IF COL_LENGTH(N'dbo.ApplicantStatusTransactionsTb', N'ApplicantId') IS NULL
    ALTER TABLE dbo.ApplicantStatusTransactionsTb ADD ApplicantId INT NULL;");
            db.Database.ExecuteSqlRaw(@"
IF COL_LENGTH(N'dbo.ApplicantStatusTransactionsTb', N'OldStatusId') IS NULL
    ALTER TABLE dbo.ApplicantStatusTransactionsTb ADD OldStatusId INT NULL;");
            db.Database.ExecuteSqlRaw(@"
IF COL_LENGTH(N'dbo.ApplicantStatusTransactionsTb', N'ChangedBy') IS NULL
    ALTER TABLE dbo.ApplicantStatusTransactionsTb ADD ChangedBy NVARCHAR(200) NULL;");
            db.Database.ExecuteSqlRaw(@"
IF COL_LENGTH(N'dbo.ApplicantStatusTransactionsTb', N'Category') IS NULL
    ALTER TABLE dbo.ApplicantStatusTransactionsTb ADD Category NVARCHAR(100) NULL;");
            db.Database.ExecuteSqlRaw(@"
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_ApplicantStatusTransactionsTb_ApplicantId'
      AND object_id = OBJECT_ID(N'dbo.ApplicantStatusTransactionsTb')
)
    CREATE INDEX IX_ApplicantStatusTransactionsTb_ApplicantId
        ON dbo.ApplicantStatusTransactionsTb (ApplicantId);");
        }

        [HttpGet]
        [Route("api/Applicant/GetApplicantCourses/{id}")]
        public IActionResult GetApplicantCourses(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                int GetApplicantId = db.AppUserTbs.Where(x => x.AppUserId == id).Select(x => x.ApplicantId).FirstOrDefault();

                var Courses = (from c in db.ApplicantCourseSelectionTbs
                               join d in db.CourseTbs on c.CourseId equals d.CourseId
                               where c.ApplicantId == GetApplicantId
                               select new
                               {
                                   c.CourseId,
                                   c.CourseCode,
                                   d.CourseName,
                                   d.CourseUrl,
                                   Questions = db.QuestionsTBs.Where(x => x.CourseId == c.CourseId).Count(),
                                   CourseMaterial = db.CourseMaterialTbs.Where(x => x.CourseId == c.CourseId).ToList()
                               }).ToList();
                return Ok(Courses);
            }
        }

        [HttpPost]
        [Route("api/Applicant/SaveUserScreenShot")]
        public IActionResult SaveUserScreenShot()
        {
            String _response = "";
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    int ApplicantId = int.Parse(Request.Form["ApplicantId"]);
                    var uploadFiles = Request.Form.Files;
                    if (Request.Form.Files.Count > 0)
                    {
                        var postedFile = uploadFiles[0];
                        var fileName = Path.GetFileName(postedFile.FileName);
                        var path = Path.Combine(_env.ContentRootPath, "Screenshots", fileName);
                        using (var stream = new FileStream(path, FileMode.Create))
                        {
                            postedFile.CopyTo(stream);
                        }
                        String ImageUrl = "Screenshots/" + fileName.ToString();
                        AppUserScreenshotTB appUserScreenshotTB = new AppUserScreenshotTB();
                        appUserScreenshotTB.ImageUrl = "Screenshots/" + fileName.ToString();
                        appUserScreenshotTB.ApplicantId = ApplicantId;
                        appUserScreenshotTB.DateTime = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                        db.AppUserScreenshotTBs.Add(appUserScreenshotTB);
                        db.SaveChanges();

                        var ApplicantInformation = (from c in db.AppUserTbs
                                                    join d in db.ApplicantsTbs on c.ApplicantId equals d.ApplicantId
                                                    where c.ApplicantId == ApplicantId
                                                    select new { c.Token, d.FirstName, d.LastName }).FirstOrDefault();
                        var OwnerInformationOne = db.AppUserTbs.Where(x => x.AppUserId == 1).FirstOrDefault();
                        String _message = "Screen Shot of " + ApplicantInformation.FirstName + " " + ApplicantInformation.LastName;
                        PushNotification.PushNotificationScreenShot(OwnerInformationOne.Token, _message, "Message", ImageUrl);
                        var OwnerInformationTwo = db.AppUserTbs.Where(x => x.AppUserId == 131).FirstOrDefault();
                        PushNotification.PushNotificationScreenShot(OwnerInformationTwo.Token, _message, "Message", ImageUrl);
                        var OwnerInformationThree = db.AppUserTbs.Where(x => x.AppUserId == 132).FirstOrDefault();
                        PushNotification.PushNotificationScreenShot(OwnerInformationThree.Token, _message, "Message", ImageUrl);
                    }

                    _response = "Update Successfully..!";
                    RemoveExtraScreenShots(ApplicantId);
                }
            }
            catch (Exception ex)
            {
                _response = ex.ToString();
            }

            return Ok(_response);
        }

        [HttpGet]
        [Route("api/Applicant/GetApplicantTransaction/{id}")]
        public IActionResult GetApplicantTransaction(int id)
        {
            List<ApplicantTransactionMD> List = new List<ApplicantTransactionMD>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.ApplicantTransactionTBs
                             where c.ApplicantId == id
                             select new { c.ApplicantId, c.Credit, c.DateTime, c.Debit, c.Reference, c.Remarks }).ToList();
                foreach (var q in query)
                {
                    List.Add(new ApplicantTransactionMD
                    {
                        ApplicantId = q.ApplicantId,
                        Credit = q.Credit,
                        Debit = q.Debit,
                        DateTime = q.DateTime,
                        Reference = q.Reference,
                        Remarks = q.Remarks,
                        TotalCredit = query.Select(x => x.Credit).Sum(),
                        TotalDebit = query.Select(x => x.Debit).Sum(),
                    });
                }
                return Ok(List);
            }
        }

        [HttpPost]
        [Route("api/Applicant/RecordApplicantPayment/{id}")]
        public IActionResult RecordApplicantPayment(int id, [FromBody] ApplicantPaymentMD value)
        {
            if (value == null || !double.IsFinite(value.Amount) || value.Amount <= 0)
                return BadRequest(new { succeeded = false, message = "Payment amount must be greater than zero." });

            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                using (var transaction = db.Database.BeginTransaction())
                {
                    if (!db.ApplicantsTbs.Any(x => x.ApplicantId == id))
                        return NotFound(new { succeeded = false, message = "Applicant not found." });

                    var invoices = db.ApplicantInvoiceTBs
                        .Where(x => x.ApplicantId == id && x.Balance > 0)
                        .OrderBy(x => x.DateTime)
                        .ThenBy(x => x.InvoiceId)
                        .ToList();
                    var outstanding = invoices.Sum(x => x.Balance ?? 0);

                    if (value.Amount > outstanding + 0.000001)
                        return BadRequest(new { succeeded = false, message = "Payment cannot exceed the outstanding balance." });

                    var remaining = value.Amount;
                    foreach (var invoice in invoices)
                    {
                        if (remaining <= 0) break;
                        var applied = Math.Min(remaining, invoice.Balance ?? 0);
                        invoice.PaidAmount = (invoice.PaidAmount ?? 0) + applied;
                        invoice.Balance = Math.Max(0, invoice.Amount - (invoice.PaidAmount ?? 0));
                        remaining -= applied;
                    }

                    var now = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                    var payment = new ApplicantTransactionTB
                    {
                        ApplicantId = id,
                        Debit = 0,
                        Credit = value.Amount,
                        DateTime = now,
                        Reference = "PAY-" + now.ToString("yyyyMMddHHmmssfff"),
                        Remarks = string.IsNullOrWhiteSpace(value.Remarks) ? "Applicant payment" : value.Remarks.Trim()
                    };
                    db.ApplicantTransactionTBs.Add(payment);
                    db.SaveChanges();
                    transaction.Commit();

                    return Ok(new
                    {
                        succeeded = true,
                        message = "Payment recorded successfully.",
                        amount = value.Amount,
                        outstandingBalance = Math.Max(0, outstanding - value.Amount),
                        reference = payment.Reference
                    });
                }
            }
            catch (Exception ex)
            {
                var message = ex.Message;
                if (ex.InnerException != null) message += " | Inner: " + ex.InnerException.Message;
                return StatusCode(500, new { succeeded = false, message });
            }
        }
        [HttpGet]
        [Route("api/Applicant/GetApplicantInvoice/{id}")]
        public IActionResult GetApplicantInvoice(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Courses = (from c in db.ApplicantInvoiceTBs
                               join d in db.ApplicantsTbs on c.ApplicantId equals d.ApplicantId
                               where c.ApplicantId == id
                               select new
                               {
                                   c.PaidAmount,
                                   c.Currency,
                                   c.Balance,
                                   c.InvoiceNo,
                                   c.InvoiceId,
                                   c.ApplicantId,
                                   c.Amount,
                                   c.Service,
                                   d.FirstName,
                                   d.LastName,
                                   c.Remarks,
                                   c.DateTime,
                                   ServiceList = db.CertificateInvoiceTbs.Where(x => x.InvoiceId == c.InvoiceId).ToList()
                               }).OrderByDescending(x => x.InvoiceId).ToList();
                return Ok(Courses);
            }
        }

        [HttpGet]
        [Route("api/Applicant/GetAllApplicantInvoices")]
        public IActionResult GetAllApplicantInvoices()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Courses = (from c in db.ApplicantInvoiceTBs
                               join d in db.ApplicantsTbs on c.ApplicantId equals d.ApplicantId
                               select new
                               {
                                   c.PaidAmount,
                                   c.Currency,
                                   c.Balance,
                                   c.InvoiceNo,
                                   c.InvoiceId,
                                   c.ApplicantId,
                                   c.Amount,
                                   c.Service,
                                   d.FirstName,
                                   d.LastName,
                                   c.Remarks,
                                   c.DateTime,
                                   ServiceList = db.CertificateInvoiceTbs.Where(x => x.InvoiceId == c.InvoiceId).ToList()
                               }).OrderByDescending(x => x.InvoiceId).ToList();
                return Ok(Courses);
            }
        }

        [HttpGet]
        [Route("api/Applicant/GetApplicantsWithInvoices")]
        public IActionResult GetApplicantsWithInvoices()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var result = (from i in db.ApplicantInvoiceTBs
                              join a in db.ApplicantsTbs on i.ApplicantId equals a.ApplicantId
                              group new { i, a } by new { a.ApplicantId, a.FirstName, a.LastName, a.RegistrationNo } into g
                              orderby g.Key.ApplicantId descending
                              select new
                              {
                                  ApplicantId = g.Key.ApplicantId,
                                  FirstName = g.Key.FirstName,
                                  LastName = g.Key.LastName,
                                  RegistrationNo = g.Key.RegistrationNo,
                                  InvoiceCount = g.Count(),
                                  TotalAmount = g.Sum(x => x.i.Amount)
                              }).ToList();
                return Ok(result);
            }
        }

        private void RemoveExtraScreenShots(int ApplicantId)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                DateTime Today = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                var Query = db.AppUserScreenshotTBs.Where(x => x.ApplicantId == ApplicantId).ToList();
                Query = Query.Where(x => x.DateTime.Date != Today.Date).OrderBy(x => x.DateTime).ToList();
                foreach (var q in Query)
                {
                    var DeleteRecord = db.AppUserScreenshotTBs.Where(x => x.ScreenShotId == q.ScreenShotId).FirstOrDefault();
                    db.AppUserScreenshotTBs.Remove(DeleteRecord);
                    db.SaveChanges();
                    var path = Path.Combine(_env.ContentRootPath, DeleteRecord.ImageUrl);
                    if (System.IO.File.Exists(path))
                    {
                        System.IO.File.Delete(path);
                    }
                }
            }
        }

        [HttpPost]
        [Route("api/Applicant/SaveApplicantInvoice")]
        public IActionResult SaveApplicantInvoice([FromBody] ApplicantInvoiceMD value)
        {
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var UpdateQuery = db.ApplicantInvoiceTBs.Where(x => x.InvoiceId == value.InvoiceId).FirstOrDefault();
                    if (UpdateQuery != null)
                    {
                        var originalLedgerEntry = db.ApplicantTransactionTBs
                            .Where(x => x.Reference == UpdateQuery.InvoiceNo)
                            .FirstOrDefault();
                        var externallyApplied = originalLedgerEntry == null
                            ? 0
                            : Math.Max(0, (UpdateQuery.PaidAmount ?? 0) - originalLedgerEntry.Credit);

                        UpdateQuery.Amount = value.Amount;
                        UpdateQuery.Service = value.Service;
                        UpdateQuery.PaidAmount = value.PaidAmount;
                        UpdateQuery.Balance = value.Balance;
                        UpdateQuery.Remarks = value.Remarks;
                        UpdateQuery.Currency = value.Currency;
                        db.SaveChanges();

                        var Query = originalLedgerEntry;
                        if (Query != null)
                        {
                            Query.Debit = value.Amount;
                            Query.Credit = Math.Max(0, (value.PaidAmount ?? 0) - externallyApplied);
                            Query.Remarks = value.Currency;
                            db.SaveChanges();
                        }

                        var GetAllInvoiceDetails = db.CertificateInvoiceTbs.Where(x => x.InvoiceId == value.InvoiceId).ToList();
                        foreach (var d in GetAllInvoiceDetails)
                        {
                            var Delete = db.CertificateInvoiceTbs.Where(x => x.CertificateInoviceId == d.CertificateInoviceId).FirstOrDefault();
                            db.CertificateInvoiceTbs.Remove(Delete);
                            db.SaveChanges();
                        }

                        foreach (var q in value.ServiceList)
                        {
                            CertificateInvoiceTb certificateInvoiceTb = new CertificateInvoiceTb();
                            certificateInvoiceTb.Amount = q.Amount;
                            certificateInvoiceTb.Service = q.Service;
                            certificateInvoiceTb.InvoiceId = UpdateQuery.InvoiceId;
                            db.CertificateInvoiceTbs.Add(certificateInvoiceTb);
                            db.SaveChanges();
                        }
                        return Ok(new { succeeded = true, message = "Update Successfully", invoiceId = value.InvoiceId, invoiceNo = UpdateQuery.InvoiceNo });
                    }
                    else
                    {
                        int MaxID = 1;
                        var QueryGetMaxId = db.ApplicantInvoiceTBs.OrderByDescending(x => x.InvoiceId).FirstOrDefault();
                        if (QueryGetMaxId != null)
                        {
                            MaxID = QueryGetMaxId.InvoiceId + 1;
                        }
                        ApplicantInvoiceTB appliantTransactionsTb = new ApplicantInvoiceTB();
                        appliantTransactionsTb.DateTime = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                        appliantTransactionsTb.Amount = value.Amount;
                        appliantTransactionsTb.InvoiceNo = "INV-" + MaxID;
                        appliantTransactionsTb.ApplicantId = value.ApplicantId;
                        appliantTransactionsTb.Service = value.Service;
                        appliantTransactionsTb.Balance = value.Balance;
                        appliantTransactionsTb.PaidAmount = value.PaidAmount;
                        appliantTransactionsTb.Remarks = value.Remarks;
                        appliantTransactionsTb.Currency = value.Currency;
                        db.ApplicantInvoiceTBs.Add(appliantTransactionsTb);
                        db.SaveChanges();

                        ApplicantTransactionTB applicantTransactionTB = new ApplicantTransactionTB();
                        applicantTransactionTB.Debit = value.Amount;
                        applicantTransactionTB.Credit = (double)value.PaidAmount;
                        applicantTransactionTB.Reference = "INV-" + MaxID;
                        applicantTransactionTB.Remarks = value.Currency;
                        applicantTransactionTB.ApplicantId = value.ApplicantId;
                        applicantTransactionTB.DateTime = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                        db.ApplicantTransactionTBs.Add(applicantTransactionTB);
                        db.SaveChanges();

                        foreach (var q in value.ServiceList)
                        {
                            CertificateInvoiceTb certificateInvoiceTb = new CertificateInvoiceTb();
                            certificateInvoiceTb.Amount = q.Amount;
                            certificateInvoiceTb.Service = q.Service;
                            certificateInvoiceTb.InvoiceId = appliantTransactionsTb.InvoiceId;
                            db.CertificateInvoiceTbs.Add(certificateInvoiceTb);
                            db.SaveChanges();
                        }
                        return Ok(new { succeeded = true, message = "Saved Successfully", invoiceId = appliantTransactionsTb.InvoiceId, invoiceNo = appliantTransactionsTb.InvoiceNo });
                    }
                }
            }
            catch (Exception ex)
            {
                var msg = ex.Message;
                if (ex.InnerException != null) msg += " | Inner: " + ex.InnerException.Message;
                return StatusCode(500, new { succeeded = false, message = msg });
            }
        }

        [HttpDelete]
        [Route("api/Applicant/DeleteInvoiceNo/{id}")]
        public IActionResult DeleteInvoiceNo(int id)
        {
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var DeleteQuery = db.ApplicantInvoiceTBs.Where(x => x.InvoiceId == id).FirstOrDefault();
                    if (DeleteQuery == null)
                    {
                        return NotFound(new { succeeded = false, message = "Invoice not found." });
                    }

                    db.ApplicantInvoiceTBs.Remove(DeleteQuery);

                    var DeleteTransaction = db.ApplicantTransactionTBs.Where(x => x.Reference == DeleteQuery.InvoiceNo).FirstOrDefault();
                    if (DeleteTransaction != null)
                    {
                        db.ApplicantTransactionTBs.Remove(DeleteTransaction);
                    }

                    var DeleteLineItems = db.CertificateInvoiceTbs.Where(x => x.InvoiceId == id).ToList();
                    if (DeleteLineItems.Count > 0)
                    {
                        db.CertificateInvoiceTbs.RemoveRange(DeleteLineItems);
                    }

                    db.SaveChanges();

                    return Ok(new { succeeded = true, message = "Deleted Successfully", invoiceId = id });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { succeeded = false, message = ex.Message });
            }
        }

        [HttpGet]
        [Route("api/Applicant/DeleteInvoiceNo/{id}")]
        public IActionResult DeleteInvoiceNoLegacy(int id)
        {
            var result = DeleteInvoiceNo(id) as ObjectResult;
            var message = ((dynamic)result?.Value)?.message;
            if (result?.StatusCode == 200)
            {
                return Ok((string)message);
            }
            if (result?.StatusCode == 404)
            {
                return NotFound((string)message);
            }
            return StatusCode(500, (string)message);
        }

        [HttpPost]
        [Route("api/Applicant/SaveCertificationApplicant")]
        public IActionResult SaveCertificationApplicant([FromBody] CertificationApplicantMD value)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var CheckUpdate = db.CertificationApplicantTBs.Where(x => x.CertifiedApplicantId == value.CertifiedApplicantId).FirstOrDefault();
                if (CheckUpdate != null)
                {
                    CheckUpdate.Address = value.Address;
                    CheckUpdate.CountryId = value.CountryId;
                    CheckUpdate.FirstName = value.FirstName;
                    CheckUpdate.LastName = value.LastName;
                    CheckUpdate.Email = value.Email;
                    CheckUpdate.CourseName = value.CourseName;
                    CheckUpdate.Mobile = value.Mobile;
                    CheckUpdate.Specialty = value.Specialty;
                    CheckUpdate.RegistrationDate = value.RegistrationDate;
                    db.SaveChanges();
                    return Ok("Updated Successfully");
                }
                else
                {
                    int MaxId = 1;
                    var GetMaxQuery = db.CertificationApplicantTBs.OrderByDescending(x => x.RecordId).Select(x => x.CertifiedApplicantId).FirstOrDefault();
                    if (GetMaxQuery != null)
                    {
                        MaxId = 1 + int.Parse(GetMaxQuery.ToString());
                    }
                    CertificationApplicantTB certificationApplicantTB = new CertificationApplicantTB();
                    certificationApplicantTB.Address = value.Address;
                    certificationApplicantTB.CertifiedApplicantId = MaxId;
                    certificationApplicantTB.CountryId = value.CountryId;
                    certificationApplicantTB.CreatedOn = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                    certificationApplicantTB.FirstName = value.FirstName;
                    certificationApplicantTB.LastName = value.LastName;
                    certificationApplicantTB.Email = value.Email;
                    certificationApplicantTB.CourseName = value.CourseName;
                    certificationApplicantTB.Mobile = value.Mobile;
                    certificationApplicantTB.Specialty = value.Specialty;
                    certificationApplicantTB.RegistrationDate = value.RegistrationDate;
                    certificationApplicantTB.IsDeleted = false;
                    db.CertificationApplicantTBs.Add(certificationApplicantTB);
                    db.SaveChanges();
                    return Ok("Saved Successfully");
                }
            }
        }

        [HttpPost]
        [Route("api/Applicant/GetAllCertifiiedApplicant")]
        public async Task<IActionResult> GetAllCertifiiedApplicant([FromBody] PaginationFilter filter)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = from c in db.CertificationApplicantTBs
                            where c.IsDeleted == false
                            select new CertificationApplicantMD
                            {
                                Address = c.Address,
                                CertifiedApplicantId = c.CertifiedApplicantId,
                                CountryId = c.CountryId,
                                CourseName = c.CourseName,
                                CreatedOn = c.CreatedOn,
                                Email = c.Email,
                                FirstName = c.FirstName,
                                LastName = c.LastName,
                                Mobile = c.Mobile,
                                RegistrationDate = c.RegistrationDate,
                                RecordId = c.RecordId,
                                Specialty = c.Specialty
                            };
                int TotalRecords = Query.Count();
                var pagedData = await Query
                   .OrderByDescending(x => x.CertifiedApplicantId)
                   .Skip((filter.PageNumber - 1) * filter.PageSize)
                   .Take(filter.PageSize)
                   .ToListAsync();
                return Ok(new PagedResponse<List<CertificationApplicantMD>>(pagedData, filter.PageNumber, filter.PageSize, TotalRecords));
            }
        }

        [HttpGet]
        [Route("api/Applicant/DeleteCertifiedApplicant/{id}")]
        public async Task<IActionResult> DeleteCertifiedApplicant(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var DeleteQuery = db.CertificationApplicantTBs.Where(x => x.CertifiedApplicantId == id).FirstOrDefault();
                if (DeleteQuery != null)
                {
                    db.CertificationApplicantTBs.Remove(DeleteQuery);
                    db.SaveChanges();
                    return Ok("Deleted Successfully");
                }
                else
                {
                    return Ok("Failed to Delete");
                }
            }
        }
    }
}
