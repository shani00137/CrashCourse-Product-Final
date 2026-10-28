using MdLabScience.DbContext;
using MdLabScience.Models;
using MdLabScience.Services;
using MdLabScience.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentCertificateManagement.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace MdLabScience.Controllers
{
    //course controller for managing courses, course materials, and related operations
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CourseController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;
        private readonly R2StorageService _r2Storage;

        // Used to stream remote (R2) files through the API so the browser never
        // hits the storage host directly and therefore never trips CORS.
        private static readonly HttpClient _httpClient = new HttpClient();

        public CourseController(IWebHostEnvironment env, R2StorageService r2Storage)
        {
            _env = env;
            _r2Storage = r2Storage;
        }

        [HttpPost]
        [Route("api/Course/GetAllCourses")]
        public IActionResult GetAllCourses([FromBody] PaginationFilter filter)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from c in db.CourseTbs
                             where ((filter.SearchTerm == "") || (c.CourseName.StartsWith(filter.SearchTerm))) && ((filter.SearchTerm == "") || (c.CourseName.Contains(filter.SearchTerm)))
                             select new CourseModel
                             {
                                 CourseCode = c.CourseCode,
                                 CourseId = c.CourseId,
                                 CourseName = c.CourseName,
                                 CourseUrl = c.CourseUrl,
                                 IsActive = c.IsActive,
                                 SaleRate = c.SaleRate,
                                 IsForMobile = c.IsForMobile,
                                 CoursePhotourl = c.CoursePhotourl
                             }).OrderByDescending(x => x.CourseId).ToList();

                var pagedData = Query
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize).ToList();
                var totalRecords = Query.Count();
                return Ok(new PagedResponse<List<CourseModel>>(pagedData, filter.PageNumber, filter.PageSize, totalRecords));
            }
        }

        [HttpGet]
        [Route("api/Course/GetActiveCourse")]
        public IActionResult GetActiveCourse()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.CourseTbs.Where(x => x.IsActive == true).ToList();
                return Ok(Query);
            }
        }

        //Anonymous endpoint so the mobile app can list active courses before
        //a user has signed in (registration flow requires courses without auth).
        [HttpGet]
        [AllowAnonymous]
        [Route("api/Course/GetActiveCoursePublic")]
        public IActionResult GetActiveCoursePublic()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.CourseTbs
                    .Where(x => x.IsActive == true && x.IsForMobile == true)
                    .OrderBy(x => x.CourseName)
                    .Select(x => new CourseModel
                    {
                        CourseCode = x.CourseCode,
                        CourseId = x.CourseId,
                        CourseName = x.CourseName,
                        CourseUrl = x.CourseUrl,
                        IsActive = x.IsActive,
                        SaleRate = x.SaleRate,
                        IsForMobile = x.IsForMobile,
                        CoursePhotourl = x.CoursePhotourl
                    })
                    .ToList();
                return Ok(Query);
            }
        }

        [HttpPost]
        [Route("api/Course/SaveCourse")]
        public async Task<IActionResult> SaveCourse()
        {
            String ResponseMessage = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                CourseModel value = new CourseModel();
                value.CourseName = Request.Form["CourseName"];
                value.CourseCode = Request.Form["CourseCode"];
                value.SaleRate = ParseDouble(Request.Form["SaleRate"]);
                value.IsForMobile = ParseBool(Request.Form["IsForMobile"], true);

                var CheckPresence = db.CourseTbs.Where(x => x.CourseCode == value.CourseCode).Any();
                if (CheckPresence == false)
                {
                    var file = GetNamedFile("CourseFile");
                    if (file != null && file.Length > 0)
                    {
                        var fileName = Path.GetFileName(file.FileName);
                        if (fileName.StartsWith("Course") == true)
                        {
                            string? courseUrl = await _r2Storage.UploadAsync(file, "courses");
                            if (string.IsNullOrEmpty(courseUrl))
                            {
                                var dirPath = Path.Combine(_env.ContentRootPath, "Uploads");
                                Directory.CreateDirectory(dirPath);
                                var path = Path.Combine(dirPath, fileName);
                                using (var stream = new FileStream(path, FileMode.Create))
                                {
                                    file.CopyTo(stream);
                                }
                                courseUrl = "Uploads/" + fileName.ToString();
                            }
                            value.CourseUrl = courseUrl;
                        }
                    }

                    var photoFile = Request.Form.Files["CoursePhoto"];
                    if (photoFile != null && photoFile.Length > 0)
                    {
                        var uploaded = await _r2Storage.UploadAsync(photoFile, "courses/photos");
                        value.CoursePhotourl = !string.IsNullOrEmpty(uploaded) ? uploaded : SaveCoursePhoto(photoFile);
                    }
                    else
                    {
                        value.CoursePhotourl = SaveCoursePhoto(photoFile);
                    }

                    CourseTb courseTb = new CourseTb();
                    courseTb.CourseCode = value.CourseCode;
                    courseTb.CourseName = value.CourseName;
                    courseTb.CourseUrl = value.CourseUrl;
                    courseTb.SaleRate = value.SaleRate;
                    courseTb.IsForMobile = value.IsForMobile;
                    courseTb.CoursePhotourl = value.CoursePhotourl;
                    courseTb.IsActive = true;
                    db.CourseTbs.Add(courseTb);
                    db.SaveChanges();
                    ResponseMessage = "Save Succesfuly";
                }
                else
                {
                    ResponseMessage = "Course Code or Course name already present..";
                }
            }
            return Ok(ResponseMessage);
        }

        [HttpPost]
        [Route("api/Course/SaveCourseMaterial")]
        public async Task<IActionResult> SaveCourseMaterial()
        {
            String ResponseMessage = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                CourseMaterialModel value = new CourseMaterialModel();

                value.CourseId = int.Parse(Request.Form["CourseId"]);
                value.MaterialType = Request.Form["MaterialType"];
                var file = Request.Form.Files.Count > 0 ?
                    Request.Form.Files[0] : null;

                if (file != null && file.Length > 0)
                {
                    string? courseUrl = null;
                    try
                    {
                        courseUrl = await _r2Storage.UploadAsync(file, "courses/materials");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"R2 upload error: {ex.Message}");
                    }

                    if (string.IsNullOrEmpty(courseUrl))
                    {
                        Guid id = Guid.NewGuid();
                        var fileName = id.ToString() + "-" + Path.GetFileName(file.FileName);
                        var dirPath = Path.Combine(_env.ContentRootPath, "Uploads");
                        Directory.CreateDirectory(dirPath);
                        var path = Path.Combine(dirPath, fileName);
                        using (var stream = new FileStream(path, FileMode.Create))
                        {
                            file.CopyTo(stream);
                        }
                        courseUrl = "Uploads/" + fileName.ToString();
                    }

                    value.CourseUrl = courseUrl;
                    CourseMaterialTb courseTb = new CourseMaterialTb();
                    courseTb.CourseId = value.CourseId;
                    courseTb.MaterialType = value.MaterialType;
                    courseTb.FileName = Path.GetFileName(file.FileName);
                    courseTb.CourseUrl = value.CourseUrl;

                    db.CourseMaterialTbs.Add(courseTb);
                    db.SaveChanges();
                    ResponseMessage = "Save Succesfuly";
                }
            }
            return Ok(ResponseMessage);
        }

        [HttpGet]
        [Route("api/Course/GetCourseMaterial/{CourseId}")]
        public IActionResult GetCourseMaterial(int CourseId)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from c in db.CourseMaterialTbs
                             join a in db.CourseTbs on c.CourseId equals a.CourseId
                             where c.CourseId == CourseId
                             select new CourseMaterialModel
                             {
                                 CourseId = c.CourseId,
                                 MaterialType = c.MaterialType,
                                 CourseUrl = c.CourseUrl,
                                 CourseMaterialId = c.CourseMaterialId,
                                 FileName = c.FileName,
                                 CourseName = a.CourseName,
                                 Questions = db.QuestionsTBs.Where(x => x.CourseId == CourseId).Count()
                             }).OrderByDescending(x => x.CourseMaterialId).ToList();
                string CourseName = Query.Select(x => x.CourseName).FirstOrDefault();
                int? Question = Query.Select(x => x.Questions).FirstOrDefault();
                var list = new List<CourseMaterialModel>(Query);
                list.Add(new CourseMaterialModel { Questions = Question, CourseId = CourseId, MaterialType = "MCQS", CourseUrl = "", CourseMaterialId = 1000, CourseName = CourseName, FileName = "MCQS" });
                return Ok(list.OrderByDescending(x => x.CourseMaterialId));
            }
        }

        [HttpGet]
        [Route("api/Course/GetCourseMaterialPdf/{CourseMaterialId}")]
        public async Task<IActionResult> GetCourseMaterialPdf(int CourseMaterialId)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var material = db.CourseMaterialTbs
                    .Where(x => x.CourseMaterialId == CourseMaterialId)
                    .FirstOrDefault();
                if (material == null || string.IsNullOrWhiteSpace(material.CourseUrl))
                {
                    return NotFound(new { succeeded = false, message = "Course material not found." });
                }

                var fileName = string.IsNullOrWhiteSpace(material.FileName)
                    ? Path.GetFileName(material.CourseUrl)
                    : material.FileName;

                if (material.CourseUrl.StartsWith("http://") || material.CourseUrl.StartsWith("https://"))
                {
                    try
                    {
                        var response = await _httpClient.GetAsync(
                            material.CourseUrl,
                            HttpCompletionOption.ResponseHeadersRead,
                            HttpContext.RequestAborted);

                        if (!response.IsSuccessStatusCode)
                        {
                            response.Dispose();
                            return NotFound(new { succeeded = false, message = "The file could not be retrieved from storage." });
                        }

                        // Keep the HttpResponseMessage alive until MVC has finished
                        // copying the content stream to the client.
                        Response.RegisterForDispose(response);

                        var stream = await response.Content.ReadAsStreamAsync(HttpContext.RequestAborted);
                        var contentType = response.Content.Headers.ContentType?.MediaType ?? "application/octet-stream";
                        return File(stream, contentType, fileName, enableRangeProcessing: true);
                    }
                    catch
                    {
                        return NotFound(new { succeeded = false, message = "The file could not be retrieved from storage." });
                    }
                }

                var path = Path.Combine(_env.ContentRootPath, material.CourseUrl);
                if (!System.IO.File.Exists(path))
                {
                    return NotFound(new { succeeded = false, message = "The PDF file is missing on the server." });
                }
                var localStream = new FileStream(path, FileMode.Open, FileAccess.Read);
                return File(localStream, "application/pdf", fileName, enableRangeProcessing: true);
            }
        }

        [HttpGet]
        [Route("api/Course/DeleteCourseMaterial/{CourseMaterialId}")]
        public async Task<IActionResult> DeleteCourseMaterial(int CourseMaterialId)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from c in db.CourseMaterialTbs
                             where c.CourseMaterialId == CourseMaterialId
                             select c).FirstOrDefault();
                if (Query != null)
                {
                    db.CourseMaterialTbs.Remove(Query);
                    db.SaveChanges();
                    await DeleteStoredFileAsync(Query.CourseUrl);
                    return Ok("Deleted Successfully");
                }
                else
                {
                    return Ok("Failed to Deleted");
                }
            }
        }

        [HttpPost]
        [Route("api/Course/UpdateCourse")]
        public async Task<IActionResult> UpdateCourse()
        {
            String ResponseMessage = "";
            CourseModel value = new CourseModel();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                value.CourseName = Request.Form["CourseName"];
                value.CourseCode = Request.Form["CourseCode"];
                value.CourseId = int.Parse(Request.Form["CourseId"]);
                value.SaleRate = ParseDouble(Request.Form["SaleRate"]);
                value.IsForMobile = ParseBool(Request.Form["IsForMobile"], true);

                var Query = db.CourseTbs.Where(x => x.CourseId == value.CourseId).FirstOrDefault();
                if (Query != null)
                {
                    var file = GetNamedFile("CourseFile");
                    if (file != null && file.Length > 0)
                    {
                        var fileName = Path.GetFileName(file.FileName);
                        if (fileName.StartsWith("Course") == true)
                        {
                            await DeleteStoredFileAsync(Query.CourseUrl);
                            string? courseUrl = await _r2Storage.UploadAsync(file, "courses");
                            if (string.IsNullOrEmpty(courseUrl))
                            {
                                var path = Path.Combine(_env.ContentRootPath, "Uploads", fileName);
                                using (var stream = new FileStream(path, FileMode.Create))
                                {
                                    file.CopyTo(stream);
                                }
                                courseUrl = "Uploads/" + fileName.ToString();
                            }
                            value.CourseUrl = courseUrl;
                        }
                    }

                    var photo = Request.Form.Files["CoursePhoto"];
                    if (photo != null && photo.Length > 0)
                    {
                        await DeleteStoredFileAsync(Query.CoursePhotourl);
                        string? savedPhoto = await _r2Storage.UploadAsync(photo, "courses/photos");
                        if (string.IsNullOrEmpty(savedPhoto))
                        {
                            savedPhoto = SaveCoursePhoto(photo);
                        }
                        if (savedPhoto != null)
                        {
                            Query.CoursePhotourl = savedPhoto;
                        }
                    }

                    Query.CourseCode = value.CourseCode;
                    Query.CourseName = value.CourseName;
                    Query.SaleRate = value.SaleRate;
                    Query.IsForMobile = value.IsForMobile;
                    if (value.CourseUrl != null)
                    {
                        Query.CourseUrl = value.CourseUrl;
                    }
                    db.SaveChanges();
                    ResponseMessage = "Update Succesfuly";
                }
                else
                {
                    ResponseMessage = "Course Code or Course name already present..";
                }
            }
            return Ok(ResponseMessage);
        }

        [HttpGet]
        [Route("api/Course/DeleteCourse/{id}")]
        public IActionResult DeleteCourse(String id)
        {
            String Response = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                return Ok(Response);
            }
        }

        [HttpGet]
        [Route("api/Course/ChangeStatus/{Id}")]
        public IActionResult ChangeStatus(int Id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.CourseTbs.Where(x => x.CourseId == Id).FirstOrDefault();
                if (Query.IsActive == true)
                {
                    Query.IsActive = false;
                }
                else
                {
                    Query.IsActive = true;
                }
                db.SaveChanges();
                return Ok("Status Update Succesfuly");
            }
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("api/Course/GetAllExercise")]
        public IActionResult GetAllExercise()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.ExerciseTbs.ToList();
                return Ok(Query);
            }
        }

        // Exercises are question ranges, but the fixed rows in ExerciseTb are
        // global index ranges (1-50, 51-100, ...) that never match a single
        // course's real question count. For a given course we instead compute
        // the ranges from the questions that actually exist: 50-question
        // blocks, with the last block clamped to the course's total so every
        // question is reachable and no exercise points past the pool.
        [HttpGet]
        [AllowAnonymous]
        [Route("api/Course/GetAllExercise/{courseId}")]
        public IActionResult GetAllExerciseForCourse(int courseId)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                int total = db.QuestionsTBs.Where(x => x.CourseId == courseId).Count();
                var list = new List<object>();
                if (total > 0)
                {
                    const int chunk = 50;
                    int index = 0;
                    for (int start = 1; start <= total; start += chunk)
                    {
                        index++;
                        int end = Math.Min(start + chunk - 1, total);
                        list.Add(new
                        {
                            ExerciseRecordId = index,
                            Exercise = "Exercise-" + index,
                            StartFrom = start,
                            EndFrom = end
                        });
                    }
                }
                return Ok(list);
            }
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("api/Course/GetCountryName")]
        public IActionResult GetCountryName()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.CountryTbs.ToList();
                return Ok(Query);
            }
        }

        // The latest released app version, used by the in-app "update
        // available" prompt. The version is not derivable from the public
        // Google Play page anymore, so it is maintained in AppVersionTb by the
        // developer when a new build is uploaded to the store. StoreUrl lets
        // the store link be overridden (defaults to market://details?id=...).
        [HttpGet]
        [AllowAnonymous]
        [Route("api/Course/GetLatestAppVersion")]
        public IActionResult GetLatestAppVersion()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var row = db.AppVersionTbs.FirstOrDefault();
                if (row == null)
                {
                    return Ok(new
                    {
                        latestVersion = "1.0.0",
                        forceUpdate = false,
                        storeUrl = "market://details?id=com.onlinecrashcourse.app",
                        storeWebUrl = "https://play.google.com/store/apps/details?id=com.onlinecrashcourse.app",
                        message = "An updated version of Crash Course is available."
                    });
                }
                return Ok(new
                {
                    latestVersion = row.LatestVersion,
                    forceUpdate = row.ForceUpdate,
                    storeUrl = row.StoreUrl,
                    storeWebUrl = "https://play.google.com/store/apps/details?id=com.onlinecrashcourse.app",
                    message = row.Message
                });
            }
        }

        // Reads a course file posted under its own form key. Some older clients
        // still post a single unnamed file, so fall back to the first file only
        // when it is not the (separately keyed) course picture.
        private IFormFile? GetNamedFile(string key)
        {
            var file = Request.Form.Files[key];
            if (file == null && Request.Form.Files.Count > 0 && Request.Form.Files["CoursePhoto"] == null)
            {
                file = Request.Form.Files[0];
            }
            return file;
        }

        // Saves an uploaded course picture under Uploads/ and returns its
        // relative path, or null when nothing (valid) was posted.
        private string? SaveCoursePhoto(IFormFile? photo)
        {
            if (photo == null || photo.Length == 0)
            {
                return null;
            }
            var extension = Path.GetExtension(Path.GetFileName(photo.FileName));
            var fileName = "CoursePhoto-" + Guid.NewGuid().ToString("N") + extension;
            var dirPath = Path.Combine(_env.ContentRootPath, "Uploads");
            Directory.CreateDirectory(dirPath);
            var path = Path.Combine(dirPath, fileName);
            using (var stream = new FileStream(path, FileMode.Create))
            {
                photo.CopyTo(stream);
            }
            return "Uploads/" + fileName;
        }

        // Best-effort removal of a previously uploaded file; never lets a
        // missing/locked file block the save.
        private async Task DeleteStoredFileAsync(string? storedPath)
        {
            if (string.IsNullOrWhiteSpace(storedPath))
            {
                return;
            }

            if (storedPath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
                storedPath.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                try
                {
                    var uri = new Uri(storedPath);
                    var key = uri.AbsolutePath.TrimStart('/');
                    if (!string.IsNullOrEmpty(key))
                    {
                        await _r2Storage.DeleteAsync(key);
                    }
                }
                catch
                {
                    // ignored
                }
                return;
            }

            DeleteUploadedFile(storedPath);
        }

        private void DeleteUploadedFile(string? relativePath)
        {
            if (string.IsNullOrWhiteSpace(relativePath))
            {
                return;
            }
            try
            {
                var path = Path.Combine(_env.ContentRootPath, relativePath);
                if (System.IO.File.Exists(path))
                {
                    System.IO.File.Delete(path);
                }
            }
            catch
            {
                // ignored
            }
        }

        private static double ParseDouble(string? raw)
        {
            if (double.TryParse(raw, NumberStyles.Any, CultureInfo.InvariantCulture, out double value))
            {
                return value;
            }
            return 0;
        }

        private static bool ParseBool(string? raw, bool fallback)
        {
            if (string.IsNullOrWhiteSpace(raw))
            {
                return fallback;
            }
            var trimmed = raw.Trim();
            if (trimmed == "1")
            {
                return true;
            }
            if (trimmed == "0")
            {
                return false;
            }
            if (bool.TryParse(trimmed, out bool value))
            {
                return value;
            }
            return fallback;
        }
    }
}
