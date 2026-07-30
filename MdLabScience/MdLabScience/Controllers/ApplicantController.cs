using MdLabScience.DbContext;
using MdLabScience.Models;
using MdLabScience.Utility;
using Newtonsoft.Json;
using StudentCertificateManagement.Models;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace MdLabScience.Controllers
{
    public class ApplicantController : ApiController
    {

        private static TimeZoneInfo Pakistan_Standard_Time = TimeZoneInfo.FindSystemTimeZoneById("Arabian Standard Time");

        // GET: api/Applicant/5
        [HttpPost]
        [Route("api/Applicant/GetAllApplicants")]
        public async Task<IHttpActionResult> GetAllApplicants([FromBody] PaginationFilter filter)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.ApplicantsTbs
                             join m in db.CountryTbs on c.CountryId equals m.CountryId
                             where (string.IsNullOrEmpty(filter.SearchTerm) || c.FirstName.Contains(filter.SearchTerm)|| c.LastName.Contains(filter.SearchTerm))
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
                             }).OrderByDescending(x => x.ApplicantId);

                var totalRecords = await query.CountAsync();

                var pagedData = await query
                    .OrderByDescending(x => x.ApplicantId)
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync();

                var applicantModels = pagedData.Select(q => new ApplicantModel
                {
                    ApplicantId = (int)q.ApplicantId,
                    RegistrationDate = q.RegistrationDate,
                    RegistrationNo = q.RegistrationNo,
                    Email = q.Email,
                    Address = q.Address,
                    CreatedOn = q.CreatedOn,
                    PhotoUrl = q.PhotoUrl,
                    Mobile = q.Mobile,
                    OtherMobile = q.OtherMobile,
                    FirstName = q.FirstName,
                    LastName = q.LastName,
                    CoutryName = q.CoutryName,
                    CountryId = q.CountryId,
                    ExpiryDate = q.ExpiryDate,
                    IsActive = q.IsActive,
                    CourseMD=GetCourseOfApplicant(q.ApplicantId)
                }).ToList();

                return Json(new PagedResponse<List<ApplicantModel>>(applicantModels, filter.PageNumber, filter.PageSize, totalRecords));
            }
        }

        private CourseModel GetCourseOfApplicant(int? Id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                return (from a in db.ApplicantCourseSelectionTbs
                         join c in db.CourseTbs on a.CourseId equals c.CourseId

                         where a.ApplicantId == Id
                         select new CourseModel { CourseId = a.CourseId, CourseName = c.CourseName }).FirstOrDefault();
            }
                
        }

        [HttpGet]
        [Route("api/Applicant/GetActiveApplicants")]
        public IHttpActionResult GetActiveApplicants()
        {
            List<ApplicantModel> list = new List<ApplicantModel>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from c in db.ApplicantsTbs
                             join m in db.CountryTbs on c.CountryId equals m.CountryId
                             where c.IsActive==true
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
                

                    bool CheckCourseExpiry = AppUserValidation.CheckCourseExpire(q.RegistrationDate, q.ExpiryDate, q.IsActive);
                    if (CheckCourseExpiry == true)
                    {
                        var UpdateUser = db.ApplicantsTbs.Where(x => x.ApplicantId == q.ApplicantId).FirstOrDefault();
                        UpdateUser.IsActive = false;

                        //Upate user Status

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
                        RegistrationDate = q.RegistrationDate,
                        RegistrationNo = q.RegistrationNo,
                        Email = q.Email,
                        Address = q.Address,
                        CreatedOn = q.CreatedOn,
                        PhotoUrl = q.PhotoUrl,
                        Mobile = q.Mobile,
                        OtherMobile = q.OtherMobile,
                        FirstName = q.FirstName,
                        LastName = q.LastName,
                        CoutryName = q.CoutryName,
                        CountryId = q.CountryId,
                       
                        ExpiryDate = q.ExpiryDate,
                        IsActive = q.IsActive

                    });
                }
                return Json(list);
            }
        }

        [HttpGet]
        [Route("api/Applicant/GetActiveApplicantsByCourse/{courseId}")]
        public IHttpActionResult GetActiveApplicants(int courseId)
        {
            List<ApplicantModel> list = new List<ApplicantModel>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from c in db.ApplicantsTbs
                             join m in db.CountryTbs on c.CountryId equals m.CountryId
                             join d in db.ApplicantCourseSelectionTbs on c.ApplicantId equals d.ApplicantId
                             where c.IsActive==true && d.CourseId==courseId
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
                        RegistrationDate = q.RegistrationDate,
                        RegistrationNo = q.RegistrationNo,
                        Email = q.Email,
                        Address = q.Address,
                        CreatedOn = q.CreatedOn,
                        PhotoUrl = q.PhotoUrl,
                        Mobile = q.Mobile,
                        OtherMobile = q.OtherMobile,
                        FirstName = q.FirstName,
                        LastName = q.LastName,
                        CoutryName = q.CoutryName,
                        CountryId = q.CountryId,
                        CourseName = courseList

                    });
                }
                return Json(list);
            }
        }
        // POST: api/Applicant
        [HttpPost]
        [Route("api/Applicant/SaveApplicants")]
        public IHttpActionResult SaveApplicants([FromBody]ApplicantModel value)
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
                        MaxId= 1 + int.Parse(GetMaxQuery.ToString());
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
                    applicantsTb.UserNo = value.UserNo;
                    applicantsTb.CreatedOn = DateTime.Now;
                    applicantsTb.CountryId = value.CountryId;
                    if (!String.IsNullOrEmpty(value.PhotoUrl))
                    {
                        byte[] ImageBytes = Convert.FromBase64String(value.PhotoUrl);

                        Image myimage = byteArrayToImage(ImageBytes);
                        myimage.Save(System.Web.Hosting.HostingEnvironment.MapPath("~/Images/Applicant/" + MaxId + ".png"));
                        //File.WriteAllBytes(@"c:\Users\u316383\Documents\pdf8.pdf", sPDFDecoded);
                        applicantsTb.PhotoUrl = "Images/Applicant/" + MaxId.ToString() + ".png";
                    }
                    db.ApplicantsTbs.Add(applicantsTb);

                    //save Course seleciton
                   
                        ApplicantCourseSelectionTb course = new ApplicantCourseSelectionTb();
                        course.ApplicantId = MaxId;
                        course.CourseId = value.CountryId;
                        course.Date = value.RegistrationDate;
                        db.ApplicantCourseSelectionTbs.Add(course);
                    

                    //save Other information Data flow etc
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
            return Json(_response);
          
        }

        [HttpPost]
        [Route("api/Applicant/UpdateApplicants")]
        public IHttpActionResult UpdateApplicants([FromBody]ApplicantModel value)
        {
            String _response = "";
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    
                    var Query = db.ApplicantsTbs.Where(x => x.ApplicantId==value.ApplicantId).FirstOrDefault();
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
                        if (!String.IsNullOrEmpty( value.PhotoUrl))
                        {
                            FileInfo inf = new FileInfo(System.Web.Hosting.HostingEnvironment.MapPath("~/" + Query.PhotoUrl));
                            if (inf.Exists)
                            {
                                inf.Delete();
                            }
                            byte[] ImageBytes = Convert.FromBase64String(value.PhotoUrl);
                            //string savePath = System.Web.Hosting.HostingEnvironment.MapPath("~/Images/Applicant/" + MaxId + ".png");
                            Image myimage = byteArrayToImage(ImageBytes);
                            myimage.Save(System.Web.Hosting.HostingEnvironment.MapPath("~/Images/Applicant/" + value.ApplicantId + ".png"));
                            Query.PhotoUrl = "Images/Applicant/" + value.ApplicantId.ToString() + ".png";
                        }
                        //save Course seleciton
                       
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
            return Json(_response);

        }

        [HttpPost]
        [Route("api/Applicant/UpdateApplicantsServices")]
        public IHttpActionResult UpdateApplicantsServices()
        {
            String _response = "";
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    ApplicantServiceModel value = new ApplicantServiceModel();
                    var httpRequest = HttpContext.Current.Request;
                    
                    String UserNo = httpRequest.Form["UserNo"];
                    value.DataFlowRemarks = httpRequest.Form["DataFlowRemarks"];
                 
                        value.ApplicantId = int.Parse(httpRequest.Form["ApplicantId"]);
                    
                    
                    var Query = db.DataFlowVerificationTbs.Where(x => x.ApplicantId == value.ApplicantId).FirstOrDefault();
                    if (Query != null)
                    {
                        HttpFileCollection uploadFiles = httpRequest.Files;
                        if (httpRequest.Files.Count > 0)
                        {
                            
                            for (int i = 0; i < uploadFiles.Count; i++)
                            {
                                HttpPostedFile postedFile = uploadFiles[i];
                                var fileName = Path.GetFileName(postedFile.FileName);
                                if (fileName.StartsWith("Degree") == true)
                                {
                                    var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                                    postedFile.SaveAs(path);
                                    value.Degree = "Uploads/" + fileName.ToString();
                                    Query.Degree = value.Degree;
                                }
                                if (fileName.StartsWith("Photo") == true)
                                {
                                    var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                                    postedFile.SaveAs(path);
                                    value.Photo = "Uploads/" + fileName.ToString();
                                    Query.Photo = value.Photo;
                                }
                                if (fileName.StartsWith("Passport") == true)
                                {
                                    var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                                    postedFile.SaveAs(path);
                                    value.Passport = "Uploads/" + fileName.ToString();
                                    Query.Passport = value.Passport;
                                }
                                if (fileName.StartsWith("RegistrationCertificate") == true)
                                {
                                    var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                                    postedFile.SaveAs(path);
                                    value.RegistrationCertificate = "Uploads/" + fileName.ToString();
                                    Query.RegistrationCertificate = value.RegistrationCertificate;
                                }
                                if (fileName.StartsWith("ExperienceCertificate") == true)
                                {
                                    var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                                    postedFile.SaveAs(path);
                                    value.ExperienceCertificate = "Uploads/" + fileName.ToString();
                                    Query.ExperienceCertificate = value.ExperienceCertificate;
                                }
                                if (fileName.StartsWith("DegreeMarkSheet") == true)
                                {
                                    var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                                    postedFile.SaveAs(path);
                                    value.DegreeMarkSheet = "Uploads/" + fileName.ToString();
                                    Query.DegreeMarkSheet = value.DegreeMarkSheet;
                                }
                                if (fileName.StartsWith("IntermediateMarkSheet") == true)
                                {
                                    var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                                    postedFile.SaveAs(path);
                                    value.IntermediateMarkSheet = "Uploads/" + fileName.ToString();
                                    Query.IntermediateMarkSheet = value.IntermediateMarkSheet;
                                }
                                if (fileName.StartsWith("Matricsheetdegree") == true)
                                {
                                    var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                                    postedFile.SaveAs(path);
                                    value.MatricMarketSheet = "Uploads/" + fileName.ToString();
                                    Query.MatricMarketSheet = value.MatricMarketSheet;
                                }
                                if (fileName.StartsWith("AdditionalDocument") == true)
                                {
                                    var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                                    postedFile.SaveAs(path);
                                    value.AdditionalDocuments = "Uploads/" + fileName.ToString();
                                    Query.AdditionalDocuments = value.AdditionalDocuments;
                                }
                                if (fileName.StartsWith("GoodStandingDocuments") == true)
                                {
                                    var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                                    postedFile.SaveAs(path);
                                    value.GoodStandingDocuments = "Uploads/" + fileName.ToString();
                                    Query.GoodStandingDocuments = value.GoodStandingDocuments;
                                }
                                
                            }
                        }
                        //foreach (var files in FileList)
                        //{
                        //    if (files != null && files.ContentLength > 0)
                        //    {
                        //        var fileName = Path.GetFileName(file.FileName);
                        //        if (fileName.StartsWith("Degree") == true)
                        //        {
                        //            var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                        //            file.SaveAs(path);
                        //            value.Degree = "Uploads/" + fileName.ToString();
                        //            Query.Degree = value.Degree;
                        //        }
                        //        if (fileName.StartsWith("Photo") == true)
                        //        {
                        //            var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                        //            file.SaveAs(path);
                        //            value.Photo = "Uploads/" + fileName.ToString();
                        //            Query.Photo = value.Photo;
                        //        }
                        //        if (fileName.StartsWith("Passport") == true)
                        //        {
                        //            var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                        //            file.SaveAs(path);
                        //            value.Passport = "Uploads/" + fileName.ToString();
                        //            Query.Passport = value.Passport;
                        //        }
                        //        if (fileName.StartsWith("RegistrationCertificate") == true)
                        //        {
                        //            var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                        //            file.SaveAs(path);
                        //            value.RegistrationCertificate = "Uploads/" + fileName.ToString();
                        //            Query.RegistrationCertificate = value.RegistrationCertificate;
                        //        }
                        //        if (fileName.StartsWith("ExperienceCertificate") == true)
                        //        {
                        //            var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                        //            file.SaveAs(path);
                        //            value.ExperienceCertificate = "Uploads/" + fileName.ToString();
                        //            Query.ExperienceCertificate = value.ExperienceCertificate;
                        //        }
                        //        if (fileName.StartsWith("DegreeMarkSheet") == true)
                        //        {
                        //            var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                        //            file.SaveAs(path);
                        //            value.DegreeMarkSheet = "Uploads/" + fileName.ToString();
                        //            Query.DegreeMarkSheet = value.DegreeMarkSheet;
                        //        }
                        //        if (fileName.StartsWith("IntermediateMarkSheet") == true)
                        //        {
                        //            var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                        //            file.SaveAs(path);
                        //            value.IntermediateMarkSheet = "Uploads/" + fileName.ToString();
                        //            Query.IntermediateMarkSheet = value.IntermediateMarkSheet;
                        //        }
                        //        if (fileName.StartsWith("Matricsheetdegree") == true)
                        //        {
                        //            var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Uploads"), fileName);
                        //            file.SaveAs(path);
                        //            value.MatricMarketSheet = "Uploads/" + fileName.ToString();
                        //            Query.MatricMarketSheet = value.MatricMarketSheet;
                        //        }
                        //    }
                        //}


                         Query.DataFlowRemarks = value.DataFlowRemarks;
                            db.SaveChanges();
                        _response = "Update Succesfuly..!";
                    }
                    //var QueryDataFlowTransfer = db.DataFlowTransferTBs.Where(x => x.ApplicantId == value.ApplicantId).FirstOrDefault();
                    //if (Query != null)
                    //{
                    //    QueryDataFlowTransfer.DataFlowTransferred = value.DataFlowTransferred;
                    //    QueryDataFlowTransfer.Remarks = value.Remarks;
                    //    QueryDataFlowTransfer.Date = DateTime.Now;
                    //    db.SaveChanges();
                    //    _response = "Update Succesfuly..!";
                    //}

                    //var AdditionalDocumentQuery = db.AdditionalDocumentTbs.Where(x => x.ApplicantId == value.ApplicantId).FirstOrDefault();
                    //if (Query != null)
                    //{
                    //    AdditionalDocumentQuery.AdditionalDocumentsDataflow = value.AdditionalDocumentsDataflow;
                    //    AdditionalDocumentQuery.AdditionalDocumentsDataflowRemarks = value.AdditionalDocumentsDataflowRemarks;

                    //    db.SaveChanges();
                    //    _response = "Update Succesfuly..!";
                    //}

                }
            }
            catch (Exception ex)
            {

                _response = ex.ToString();
            }
            return Json(_response);

        }

        [HttpGet]
        [Route("api/Applicant/GetApplicantServiceById/{id}")]
        public IHttpActionResult GetApplicantServiceById(int id)
        {
            String _response = "";
            List < ApplicantServiceModel> list  = new List<ApplicantServiceModel>();

            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    
                    var Query = db.DataFlowVerificationTbs.Where(x => x.ApplicantId == id).FirstOrDefault();
                    if (Query != null)
                    {
                        list.Add(new ApplicantServiceModel { 
                       
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
                            Matricsheetdegree=Query.MatricMarketSheet,
                            DegreeMarkSheet = Query.DegreeMarkSheet,
                            GoodStandingDocuments = Query.GoodStandingDocuments
                        });
                    
                      
                    }
                    var QueryDataFlowTransfer = db.DataFlowTransferTBs.Where(x => x.ApplicantId == id).FirstOrDefault();
                    if (Query != null)
                    {
                        list[0].DataFlowTransferred = QueryDataFlowTransfer.DataFlowTransferred;
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
            return Json(list);

        }

        [HttpGet]
        [Route("api/Applicant/ApplicantCompleteProfile/{id}")]
        public IHttpActionResult ApplicantCompleteProfile(int id)
        {
            bool _response = true;
            List<ApplicantServiceModel> list = new List<ApplicantServiceModel>();

            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {

                     var Query = db.DataFlowVerificationTbs.Where(x => x.ApplicantId == id ).ToList();
                    var CheckDocumnets = Query.Where(x => x.Degree == null || x.Photo == null || x.MatricMarketSheet == null || x.IntermediateMarkSheet == null || x.RegistrationCertificate == null || x.ExperienceCertificate == null || x.GoodStandingDocuments == null).Any();
                    if (CheckDocumnets == true)
                    {
                        _response = false;
                    }
                    else
                    {
                        _response=  true;
                    }

                }
            }
            catch (Exception ex)
            {

               
            }
            return Json(_response);

        }

        [HttpGet]
        [Route("api/Applicant/ChangeApplicantStatus/{id}")]
        public IHttpActionResult ChangeApplicantStatus(int id)
        {
            List<ApplicantModel> list = new List<ApplicantModel>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.ApplicantsTbs.Where(x => x.ApplicantId == id).FirstOrDefault();
               var AppInformaiton = db.AppUserTbs.Where(x => x.ApplicantId == id).FirstOrDefault();
                if (Query != null)
                {
                    if (Query.IsActive == true)
                    {
                        Query.IsActive = false;
                        String _message = "Dear Mr/Mrs " + AppInformaiton.UserName + "Dear Customer your account has been suspended, please contact to Administrator..";
                        PushNotification.PushNotificationTOuser(AppInformaiton.Token, _message, "Account Block");
                        AppInformaiton.Status = false;
                    }
                    else

                    {
                        Query.IsActive = true;
                        AppInformaiton.Status = true;
                    }
                    db.SaveChanges();
                }
              
          
                
                return Json("Update Sucessfuly.");
            }
        }
        [HttpGet]
        [Route("api/Applicant/GetApplicantCourses/{id}")]
        public IHttpActionResult GetApplicantCourses(int id){
           
            List<ApplicantServiceModel> list = new List<ApplicantServiceModel>();

                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    int GetApplicantId = db.AppUserTbs.Where(x => x.AppUserId == id).Select(x=>x.ApplicantId).FirstOrDefault();

                var Courses = (from c in db.ApplicantCourseSelectionTbs
                               join d in db.CourseTbs on c.CourseId equals d.CourseId
                               where c.ApplicantId == GetApplicantId
                               select new {
                                   c.CourseId,
                                   c.CourseCode,
                                   d.CourseName,
                                   d.CourseUrl,
                                   Questions = db.QuestionsTBs.Where(x => x.CourseId == c.CourseId).Count(),
                                       CourseMaterial = db.CourseMaterialTbs.Where(x => x.CourseId == c.CourseId).ToList()
                               }).ToList();
                    return Json(Courses);
            }
           
          

        }
        public Image byteArrayToImage(byte[] byteArrayIn)
        {
            MemoryStream ms = new MemoryStream(byteArrayIn);
            Image returnImage = Image.FromStream(ms);

            return returnImage;
        }

        [HttpPost]
        [Route("api/Applicant/SaveUserScreenShot")]
        public IHttpActionResult SaveUserScreenShot()
        {
            String _response = "";
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                
                        var httpRequest = HttpContext.Current.Request;
                        int ApplicantId =int.Parse( httpRequest.Form["ApplicantId"]);
                        HttpFileCollection uploadFiles = httpRequest.Files;
                        if (httpRequest.Files.Count > 0)
                        {

                                     HttpPostedFile postedFile = uploadFiles[0];
                                    var fileName = Path.GetFileName(postedFile.FileName);                              
                                    var path = Path.Combine(HttpContext.Current.Server.MapPath("~/Screenshots"), fileName);
                                    postedFile.SaveAs(path);
                                    String ImageUrl = "Screenshots/" + fileName.ToString();
                                    AppUserScreenshotTB appUserScreenshotTB = new AppUserScreenshotTB();
                                    appUserScreenshotTB.ImageUrl = "Screenshots/"+fileName.ToString();
                                    appUserScreenshotTB.ApplicantId = ApplicantId;
                                    appUserScreenshotTB.DateTime = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                                    db.AppUserScreenshotTBs.Add(appUserScreenshotTB);
                                    db.SaveChanges();

                        var ApplicantInformation = (from c in db.AppUserTbs join d in db.ApplicantsTbs on c.ApplicantId equals d.ApplicantId where c.ApplicantId == ApplicantId select new { c.Token, d.FirstName, d.LastName }).FirstOrDefault();
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
           
            return Json(_response);

        }
        [HttpGet]
        [Route("api/Applicant/GetApplicantTransaction/{id}")]
        public IHttpActionResult GetApplicantTransaction(int id)
        {

            List<ApplicantTransactionMD> List = new List<ApplicantTransactionMD>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.ApplicantTransactionTBs
                             where c.ApplicantId==id
                             select new {c.ApplicantId, c.Credit,c.DateTime,c.Debit,c.Reference,c.Remarks }).ToList();
                foreach (var q in query)
                {
                    List.Add(new ApplicantTransactionMD { 
                        ApplicantId=q.ApplicantId,
                        Credit=q.Credit,
                        Debit=q.Debit,
                        DateTime=q.DateTime,
                        Reference=q.Reference,
                        Remarks=q.Remarks,
                        TotalCredit=query.Select(x=>x.Credit).Sum(),
                        TotalDebit=query.Select(x=>x.Debit).Sum(),
                      
                    
                    });
                }
                return Json(List);
            }
        }
        [HttpGet]
        [Route("api/Applicant/GetApplicantInvoice/{id}")]
        public IHttpActionResult GetApplicantInvoice(int id)
        {

            List<ApplicantServiceModel> list = new List<ApplicantServiceModel>();

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
                                 ServiceList=db.CertificateInvoiceTbs.Where(x=>x.InvoiceId==c.InvoiceId).ToList()
                               
                               }).OrderByDescending(x=>x.InvoiceId).ToList();
                return Json(Courses);
            }



        }
        private void RemoveExtraScreenShots(int ApplicantId)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                DateTime Today = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                var Query = db.AppUserScreenshotTBs.Where(x => x.ApplicantId == ApplicantId && DbFunctions.TruncateTime(x.DateTime) != DbFunctions.TruncateTime(Today)).OrderBy(x => x.DateTime).ToList();
                foreach (var q in Query)
                {
                    var DeleteRecord = db.AppUserScreenshotTBs.Where(x => x.ScreenShotId == q.ScreenShotId).FirstOrDefault();
                    db.AppUserScreenshotTBs.Remove(DeleteRecord);
                    db.SaveChanges();
                    if (System.IO.File.Exists(HttpContext.Current.Server.MapPath("~/" + DeleteRecord.ImageUrl)))
                    {
                        System.IO.File.Delete(HttpContext.Current.Server.MapPath("~/" + DeleteRecord.ImageUrl));
                    }
                }
            }
        }
        [HttpPost]
        [Route("api/Applicant/SaveApplicantInvoice")]
        public IHttpActionResult SaveApplicantInvoice([FromBody]ApplicantInvoiceMD value)
        {
            String _response = "";
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {

                    var UpdateQuery = db.ApplicantInvoiceTBs.Where(x => x.InvoiceId == value.InvoiceId).FirstOrDefault();
                    if (UpdateQuery != null)
                    {
                        UpdateQuery.Amount = value.Amount;
                        UpdateQuery.Service = value.Service;
                        UpdateQuery.PaidAmount = value.PaidAmount;
                        UpdateQuery.Balance = value.Balance;
                        UpdateQuery.Remarks = value.Remarks;
                        UpdateQuery.Currency = value.Currency;
                        db.SaveChanges();

                        ///delete 
                        var Query = db.ApplicantTransactionTBs.Where(x => x.Reference == value.InvoiceNo).FirstOrDefault();
                        if (Query != null)
                        {
                            Query.Debit = value.Amount;
                            Query.Credit = (double)value.PaidAmount;
                            Query.Remarks = value.Currency;
                            db.SaveChanges();
                        }

                        //save invoice list
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
                        //add transaction 
                        return Json("Update Successfully");

                       
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
                        //add Transaction
                        ApplicantTransactionTB applicantTransactionTB = new ApplicantTransactionTB();
                        applicantTransactionTB.Debit = value.Amount;
                        applicantTransactionTB.Credit =(double) value.PaidAmount;
                        applicantTransactionTB.Reference = "INV-" + MaxID;
                        applicantTransactionTB.Remarks = value.Currency;
                        applicantTransactionTB.ApplicantId = value.ApplicantId;
                        applicantTransactionTB.DateTime = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                        db.ApplicantTransactionTBs.Add(applicantTransactionTB);
                        db.SaveChanges();

                        //save invoice list
                        foreach (var q in value.ServiceList)
                        {
                            CertificateInvoiceTb certificateInvoiceTb = new CertificateInvoiceTb();
                            certificateInvoiceTb.Amount = q.Amount;
                            certificateInvoiceTb.Service = q.Service;
                            certificateInvoiceTb.InvoiceId = appliantTransactionsTb.InvoiceId;
                            db.CertificateInvoiceTbs.Add(certificateInvoiceTb);
                            db.SaveChanges();
                        }
                        return Json("Saved Successfully");


                    }

                    

                }
            }
            catch (Exception ex)
            {

                _response = ex.ToString();
            }
            return Json(_response);

        }
        [HttpGet]
        [Route("api/Applicant/DeleteInvoiceNo/{id}")]
        public IHttpActionResult DeleteInvoiceNo(int id)
        {


            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var DeleteQuery = db.ApplicantInvoiceTBs.Where(x => x.InvoiceId == id).FirstOrDefault();
                if (DeleteQuery != null)
                {
                    db.ApplicantInvoiceTBs.Remove(DeleteQuery);
                    db.SaveChanges();
                }
                var DeleteTransaction = db.ApplicantTransactionTBs.Where(x => x.Reference == DeleteQuery.InvoiceNo).FirstOrDefault();
                if (DeleteTransaction != null)
                {
                    db.ApplicantTransactionTBs.Remove(DeleteTransaction);
                    db.SaveChanges();
                }
                return Json("Deleted Successfully");
            }



        }

        [HttpPost]
        [Route("api/Applicant/SaveCertificationApplicant")]
        public IHttpActionResult SaveCertificationApplicant([FromBody]CertificationApplicantMD value)
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
                    return Json("Updated Successfully");
                }
                else {
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
                    return Json("Saved Successfully");
                }
               
                
            }
        }

        [HttpPost]
        [Route("api/Applicant/GetAllCertifiiedApplicant")]
        public async Task<IHttpActionResult> GetAllCertifiiedApplicant([FromBody] PaginationFilter filter)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = from c in db.CertificationApplicantTBs where c.IsDeleted==false select new CertificationApplicantMD {
                 Address=c.Address,
                  CertifiedApplicantId=c.CertifiedApplicantId,
                   CountryId=c.CountryId,
                    CourseName=c.CourseName,
                     CreatedOn=c.CreatedOn,
                     Email=c.Email,
                      FirstName=c.FirstName,
                      LastName=c.LastName,
                       
                        Mobile=c.Mobile,
                         RegistrationDate=c.RegistrationDate,
                          RecordId=c.RecordId,
                           Specialty=c.Specialty

                };
                int TotalRecords = Query.Count();
                var pagedData = await Query
                   .OrderByDescending(x => x.CertifiedApplicantId)
                   .Skip((filter.PageNumber - 1) * filter.PageSize)
                   .Take(filter.PageSize)
                   .ToListAsync();
                return Json(new PagedResponse<List<CertificationApplicantMD>>(pagedData, filter.PageNumber, filter.PageSize, TotalRecords));
            }
        }
        [HttpGet]
        [Route("api/Applicant/DeleteCertifiedApplicant/{id}")]
        public async Task<IHttpActionResult> DeleteCertifiedApplicant(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var DeleteQuery = db.CertificationApplicantTBs.Where(x => x.CertifiedApplicantId == id).FirstOrDefault();
                if (DeleteQuery != null)
                {
                    db.CertificationApplicantTBs.Remove(DeleteQuery);
                    db.SaveChanges();
                    return Json("Deleted Successfully");
                }
                else {
                    return Json("Failed to Delete");
                }
            }
        }



    }
}
