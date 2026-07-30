
using MdLabScience.DbContext;
using MdLabScience.Models;
using MdLabScience.Utility;
using StudentCertificateManagement.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;


namespace StudentCertificateManagement.Controllers
{
    public class CourseController : ApiController
    {
        // GET: api/Student
        [HttpPost]
        [Route("api/Course/GetAllCourses")]
        public IHttpActionResult GetAllCourses([FromBody] PaginationFilter filter)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from c in db.CourseTbs
                             where ((filter.SearchTerm == "") || (c.CourseName.StartsWith(filter.SearchTerm))) && ((filter.SearchTerm == "") || (c.CourseName.Contains(filter.SearchTerm)))
                             select new CourseModel{ 
                             CourseCode=c.CourseCode,
                             CourseId=c.CourseId,
                             CourseName=c.CourseName,
                             CourseUrl=c.CourseUrl,
                             IsActive=c.IsActive
                             
                             }).OrderByDescending(x=>x.CourseId).ToList();

                var pagedData = Query
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize).ToList(); ;
                var totalRecords = Query.Count();
                return Json(new PagedResponse<List<CourseModel>>(pagedData, filter.PageNumber, filter.PageSize, totalRecords));
            }
        }

        [HttpGet]
        [Route("api/Course/GetActiveCourse")]
        public IHttpActionResult GetActiveCourse()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.CourseTbs.Where(x=>x.IsActive==true).ToList();
                return Json(Query);
            }
        }
        // POST: api/Student
        [HttpPost]
        [Route("api/Course/SaveCourse")]
        public IHttpActionResult SaveCourse()
        {
            String ResponseMessage = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                CourseModel value = new CourseModel();
                var CheckPresence = db.CourseTbs.Where(x=>x.CourseCode == value.CourseCode).Any();
                if (CheckPresence == false)
                {
                    var httpRequest = HttpContext.Current.Request;
                    value.CourseName =httpRequest.Form["CourseName"];
                    value.CourseCode = httpRequest.Form["CourseCode"];
                    var file = HttpContext.Current.Request.Files.Count > 0 ?
                    HttpContext.Current.Request.Files[0] : null;

                    if (file != null && file.ContentLength > 0)
                    {
                        var fileName = Path.GetFileName(file.FileName);
                        if (fileName.StartsWith("Course") == true)
                        {
                            var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                            file.SaveAs(path);
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
                else {
                    ResponseMessage = "Course Code or Course name already present..";
                }
            }
            return Json(ResponseMessage);
        }
        [HttpPost]
        [Route("api/Course/SaveCourseMaterial")]
        public IHttpActionResult SaveCourseMaterial()
        {
            String ResponseMessage = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                CourseMaterialModel value = new CourseMaterialModel();
               
                    var httpRequest = HttpContext.Current.Request;
                value.CourseId = int.Parse(httpRequest.Form["CourseId"]);
                value.MaterialType = httpRequest.Form["MaterialType"];
                var file = HttpContext.Current.Request.Files.Count > 0 ?
                    HttpContext.Current.Request.Files[0] : null;

                    if (file != null && file.ContentLength > 0)
                    {
                            Guid id = Guid.NewGuid();
                            var fileName = id.ToString()+"-"+Path.GetFileName(file.FileName);                       
                            var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                            file.SaveAs(path);
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
            return Json(ResponseMessage);
        }
        [HttpGet]
        [Route("api/Course/GetCourseMaterial/{CourseId}")]
        public IHttpActionResult GetCourseMaterial(int CourseId)
        {
            List<CourseMaterialModel> list = new List<CourseMaterialModel>();


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
                                 CourseName=a.CourseName,
                                 Questions=db.QuestionsTBs.Where(x=>x.CourseId==CourseId).Count()

                             }).OrderByDescending(x => x.CourseMaterialId).ToList();
                string CourseName = Query.Select(x => x.CourseName).FirstOrDefault();
                int? Question= Query.Select(x => x.Questions).FirstOrDefault();
                list = new List<CourseMaterialModel>(Query);
                list.Add(new CourseMaterialModel {Questions= Question, CourseId = CourseId, MaterialType = "MCQS", CourseUrl = "", CourseMaterialId = 1000,CourseName= CourseName,  FileName = "MCQS" });
                return Json(list.OrderByDescending(x=>x.CourseMaterialId));
            }
        }

        [HttpGet]
        [Route("api/Course/DeleteCourseMaterial/{CourseMaterialId}")]
        public IHttpActionResult DeleteCourseMaterial(int CourseMaterialId)
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
					if (System.IO.File.Exists(HttpContext.Current.Server.MapPath("~/" + Query.CourseUrl)))
					{
						System.IO.File.Delete(HttpContext.Current.Server.MapPath("~/" + Query.CourseUrl));
					}
					return Json("Deleted Successfully");
                }
                else {
                    return Json("Failed to Deleted");
                }


                
            }
        }

        [HttpPost]
        [Route("api/Course/UpdateCourse")]
        public IHttpActionResult UpdateCourse()
        {
            String ResponseMessage = "";
            CourseModel value = new CourseModel();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var httpRequest = HttpContext.Current.Request;
                value.CourseName = httpRequest.Form["CourseName"];
                value.CourseCode = httpRequest.Form["CourseCode"];
                value.CourseId = int.Parse(httpRequest.Form["CourseId"]);
                var Query = db.CourseTbs.Where(x => x.CourseId==value.CourseId).FirstOrDefault();
                if (Query != null)
                {
                  
                    var file = HttpContext.Current.Request.Files.Count > 0 ?
                    HttpContext.Current.Request.Files[0] : null;

                    if (file != null && file.ContentLength > 0)
                    {
                        var fileName = Path.GetFileName(file.FileName);
                        if (fileName.StartsWith("Course") == true)
                        {
                            FileInfo inf = new FileInfo(System.Web.Hosting.HostingEnvironment.MapPath("~/" + Query.CourseUrl));
                            if (inf.Exists)
                            {
                                inf.Delete();
                            }
                            var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                            file.SaveAs(path);
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
            return Json(ResponseMessage);
        }

        [HttpGet]
        [Route("api/Course/DeleteCourse/{id}")]
        public IHttpActionResult DeleteCourse(String id)
        {
            String Response = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                //var ChecPresence = db.StudentTbs.Where(x => x.CourseCode == id).Any();
                //if (ChecPresence == false)
                //{
                //    var Delete = db.CourseTbs.Where(x => x.CourseCode == id).FirstOrDefault();
                //    db.CourseTbs.Remove(Delete);
                //    db.SaveChanges();
                //    Response = "Delete Sucessfuly.";
                //}
                //else {
                //    Response = "Cannot delete this record Course Code already in Student Used.";
                //}
                return Json(Response);
            }
        }

        [HttpGet]
        [Route("api/Course/ChangeStatus/{Id}")]
        public IHttpActionResult ChangeStatus(int Id)
        {
            
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.CourseTbs.Where(x => x.CourseId == Id).FirstOrDefault();
                if (Query.IsActive == true)
                {
                    Query.IsActive = false;
                }
                else {
                    Query.IsActive = true;
                }
                db.SaveChanges();
                return Json("Status Update Succesfuly");
            }
        }
        [HttpGet]
        [Route("api/Course/GetAllExercise")]
        public IHttpActionResult GetAllExercise()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.ExerciseTbs.ToList();
                return Json(Query);
            }
        }
        [HttpGet]
        [Route("api/Course/GetCountryName")]
        public IHttpActionResult GetCountryName()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.CountryTbs.ToList();
                return Json(Query);
            }
        }
        
    }
}
