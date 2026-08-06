using MdLabScience.DbContext;
using MdLabScience.Models;
using MdLabScience.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentCertificateManagement.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace MdLabScience.Controllers
{
    //course controller for managing courses, course materials, and related operations
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CourseController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public CourseController(IWebHostEnvironment env)
        {
            _env = env;
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
                                 IsActive = c.IsActive
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

        [HttpPost]
        [Route("api/Course/SaveCourse")]
        public IActionResult SaveCourse()
        {
            String ResponseMessage = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                CourseModel value = new CourseModel();
                var CheckPresence = db.CourseTbs.Where(x => x.CourseCode == value.CourseCode).Any();
                if (CheckPresence == false)
                {
                    value.CourseName = Request.Form["CourseName"];
                    value.CourseCode = Request.Form["CourseCode"];
                    var file = Request.Form.Files.Count > 0 ?
                    Request.Form.Files[0] : null;

                    if (file != null && file.Length > 0)
                    {
                        var fileName = Path.GetFileName(file.FileName);
                        if (fileName.StartsWith("Course") == true)
                        {
                            var dirPath = Path.Combine(_env.ContentRootPath, "Uploads");
                            Directory.CreateDirectory(dirPath);
                            var path = Path.Combine(dirPath, fileName);
                            using (var stream = new FileStream(path, FileMode.Create))
                            {
                                file.CopyTo(stream);
                            }
                            value.CourseUrl = "Uploads/" + fileName.ToString();
                        }
                    }
                    CourseTb courseTb = new CourseTb();
                    courseTb.CourseCode = value.CourseCode;
                    courseTb.CourseName = value.CourseName;
                    courseTb.CourseUrl = value.CourseUrl;
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
        public IActionResult SaveCourseMaterial()
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
                    Guid id = Guid.NewGuid();
                    var fileName = id.ToString() + "-" + Path.GetFileName(file.FileName);
                    var dirPath = Path.Combine(_env.ContentRootPath, "Uploads");
                    Directory.CreateDirectory(dirPath);
                    var path = Path.Combine(dirPath, fileName);
                    using (var stream = new FileStream(path, FileMode.Create))
                    {
                        file.CopyTo(stream);
                    }
                    value.CourseUrl = "Uploads/" + fileName.ToString();
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
        [Route("api/Course/DeleteCourseMaterial/{CourseMaterialId}")]
        public IActionResult DeleteCourseMaterial(int CourseMaterialId)
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
                    var path = Path.Combine(_env.ContentRootPath, Query.CourseUrl);
                    if (System.IO.File.Exists(path))
                    {
                        System.IO.File.Delete(path);
                    }
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
        public IActionResult UpdateCourse()
        {
            String ResponseMessage = "";
            CourseModel value = new CourseModel();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                value.CourseName = Request.Form["CourseName"];
                value.CourseCode = Request.Form["CourseCode"];
                value.CourseId = int.Parse(Request.Form["CourseId"]);
                var Query = db.CourseTbs.Where(x => x.CourseId == value.CourseId).FirstOrDefault();
                if (Query != null)
                {
                    var file = Request.Form.Files.Count > 0 ?
                    Request.Form.Files[0] : null;

                    if (file != null && file.Length > 0)
                    {
                        var fileName = Path.GetFileName(file.FileName);
                        if (fileName.StartsWith("Course") == true)
                        {
                            var oldPath = Path.Combine(_env.ContentRootPath, Query.CourseUrl);
                            if (System.IO.File.Exists(oldPath))
                            {
                                System.IO.File.Delete(oldPath);
                            }
                            var path = Path.Combine(_env.ContentRootPath, "Uploads", fileName);
                            using (var stream = new FileStream(path, FileMode.Create))
                            {
                                file.CopyTo(stream);
                            }
                            value.CourseUrl = "Uploads/" + fileName.ToString();
                        }
                    }
                    Query.CourseCode = value.CourseCode;
                    Query.CourseName = value.CourseName;
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
        [Route("api/Course/GetAllExercise")]
        public IActionResult GetAllExercise()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.ExerciseTbs.ToList();
                return Ok(Query);
            }
        }

        [HttpGet]
        [Route("api/Course/GetCountryName")]
        public IActionResult GetCountryName()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.CountryTbs.ToList();
                return Ok(Query);
            }
        }
    }
}
