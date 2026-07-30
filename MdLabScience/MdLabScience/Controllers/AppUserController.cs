using MdLabScience.DbContext;
using MdLabScience.Models;
using MdLabScience.Utility;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace MdLabScience.Controllers
{
   
    public class AppUserController : ApiController
    {
        private static TimeZoneInfo Pakistan_Standard_Time = TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");
        // GET: api/AppUser


        // GET: api/AppUser/5
        [HttpPost]
        [Route("api/AppUser/GetAllUsers")]
        public async Task<IHttpActionResult> GetAllUsers([FromBody] PaginationFilter filter)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.AppUserTbs
                             join d in db.ApplicantsTbs on c.ApplicantId equals d.ApplicantId
                             where (string.IsNullOrEmpty(filter.SearchTerm) || c.UserName.Contains(filter.SearchTerm))
                                    && (string.IsNullOrEmpty(filter.SearchTerm) || d.FirstName.Contains(filter.SearchTerm))
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
                                 Address = d.Address
                             }).OrderByDescending(x => x.Status);

                var totalRecords = await query.CountAsync();
                var pagedData = await query.Skip((filter.PageNumber - 1) * filter.PageSize)
                                           .Take(filter.PageSize)
                                           .ToListAsync();

                return Json(new PagedResponse<List<AppUserModel>>(pagedData, filter.PageNumber, filter.PageSize, totalRecords));
            }
        }



        [HttpGet]
        [Route("api/AppUser/GetActiveAppUser")]
        public IHttpActionResult GetActiveAppUser()
        {
            List<ApplicantModel> list = new List<ApplicantModel>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from c in db.AppUserTbs
                             join d in db.ApplicantsTbs on c.ApplicantId equals d.ApplicantId
                             where c.Status==true
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
                    list.Add(new ApplicantModel {
                    FirstName=q.FirstName,
                    LastName=q.LastName,
                     AppUserId=q.AppUserId,
                     Course=String.Join(",",CourseInfo.Select(x=>x.CourseName).ToArray()),
                     Messages=UnreadMessage

                    });
                }
                return Json(list);
            }

        }
        [HttpPost]
        [Route("api/AppUser/SaveAppUser")]
        public IHttpActionResult SaveAppUser([FromBody]AppUserModel value)
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
                appUserTb.Password = Encrption.Encrypt( value.Password);
                appUserTb.Status = true;
                appUserTb.CreateOn= TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                db.AppUserTbs.Add(appUserTb);
                db.SaveChanges();
                _response = "Save Succesuly";
            }
            return Json(_response);
        }

        [HttpPost]
        [Route("api/AppUser/UpdateAppUser")]
        public IHttpActionResult UpdateAppUser([FromBody]AppUserModel value)
        {
            String _response = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                
                var Query = db.AppUserTbs.Where(x=>x.ApplicantId==value.ApplicantId).FirstOrDefault();
                if (Query != null)
                {
                                       
                    Query.UserName = value.UserName;
                    Query.ApplicantId = value.ApplicantId;                    
                   
                    db.SaveChanges();
                    _response = "Update Succesuly";
                }
               
            }
            return Json(_response);
        }

        // DELETE: api/AppUser/5
        [HttpGet]
        [Route("api/AppUser/DeleteUser/{id}")]
        public IHttpActionResult DeleteUser(int id)
        {
            String _response = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Delete = db.AppUserTbs.Where(x => x.AppUserId == id).FirstOrDefault();
                db.AppUserTbs.Remove(Delete);
                db.SaveChanges();
                _response = "Delete Successfuly.";
            }
            return Json(_response);
        }
        [HttpGet]
        [Route("api/AppUser/ResetDeviceId/{id}")]
        public IHttpActionResult ResetDeviceId(int id)
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
            return Json(_response);
        }
        [HttpGet]
        [Route("api/AppUser/ChangeStatus/{id}")]
        public IHttpActionResult ChangeStatus(int id)
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
            return Json(_response);
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
                    bool CheckCourseExpiry = AppUserValidation.CheckCourseExpire(ApplicantInformation.RegistrationDate, ApplicantInformation.ExpiryDate, ApplicantInformation.IsActive);
                    if (CheckCourseExpiry == true)
                    {
                        var UpdateUser = db.ApplicantsTbs.Where(x => x.ApplicantId == ApplicantId).FirstOrDefault();
                        UpdateUser.IsActive = false;

                        //Upate user Status
                        var UpdateAppUser = db.AppUserTbs.Where(x => x.ApplicantId == ApplicantId).FirstOrDefault();
                        UpdateAppUser.Status = false;
                        db.SaveChanges();

                        _response = false;
                    }
                    if(ApplicantInformation.IsActive==false)
                    {
                        _response = false;
                    }
                    if (Query.Status == false)
                    {
                        _response = false;
                    }
                }

               
               
            }
          return  _response;
        }
        [HttpPost]
        [Route("api/AppUser/UpdateToken")]
        public IHttpActionResult UpdateToken([FromBody]AppUserModel value)
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
            return Json(_response);
        }
        [HttpGet]
        [Route("api/AppUser/UserPendingExamCount/{id}")]
        public IHttpActionResult UserPendingExamCount(int id)
        {
            
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                int GetAppUserId =(int) db.AppUserTbs.Where(x => x.AppUserId == id).Select(x => x.ApplicantId).FirstOrDefault();
                var PendingTestCounte = db.AppUserTestTbs.Where(x => x.ApplicantId == GetAppUserId && x.IsCompleted == false).Count();
                return Json(PendingTestCounte);

            }
            
        }

        [HttpPost]
        [Route("api/AppUser/ChatMessageSend")]
        public void ChatMessageSend([FromBody] ChatModel value)
        {

            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                //Defalut entry
                ChatTb chatTb = new ChatTb();
                chatTb.AppUserId = value.AppUserId;                
                chatTb.ReceiverId = value.ReceiverId;
                chatTb.DateTime= TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
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

                var ApplicantInformation = (from c in db.AppUserTbs join d in db.ApplicantsTbs on c.ApplicantId equals d.ApplicantId where c.AppUserId==value.ReceiverId select new { c.Token,d.FirstName,d.LastName}).FirstOrDefault();
                String _message = ApplicantInformation.FirstName+ApplicantInformation.LastName+ " : "+value.Message;
                PushNotification.PushNotificationTOuser(ApplicantInformation.Token, _message, "Message");
            }

        }
        [HttpGet]
        [Route("api/AppUser/GetChatMessage/{id}")]
        public IHttpActionResult GetChatMessage(int id)
        {

            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var chat = db.ChatTbs.Where(x => x.AppUserId == id).ToList();
               return Json(chat);
                
            }

        }
        [HttpGet]
        [Route("api/AppUser/SeenMessage/{id}")]
        public void SeenMessage(int id)
        {

            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var chat = db.ChatTbs.Where(x => x.AppUserId == id && x.IsRead==false).ToList();
                foreach (var q in chat)
                {
                    var Update = db.ChatTbs.Where(x => x.ChatId==q.ChatId).FirstOrDefault();
                    Update.IsRead = true;
                    db.SaveChanges();
                }                

            }

        }
        [HttpPost]
        [Route("api/AppUser/GetUserScreenShots")]
        public IHttpActionResult GetUserScreenShots([FromBody] PaginationFilter filter)
        {

            List<AppUserModel> list = new List<AppUserModel>();

            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from c in db.AppUserScreenshotTBs
                             where c.ApplicantId == filter.ApplicantId
                             select c).OrderByDescending(x=>x.ScreenShotId).ToList();
         
                foreach (var q in Query)
                {
                    
                    list.Add(new AppUserModel {
                        ImageUrl=q.ImageUrl,
                        DateTime=q.DateTime

                    });
                }
                var pagedData = list
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize).ToList(); ;
                var totalRecords = Query.Count();
                return Json(new PagedResponse<List<AppUserModel>>(pagedData, filter.PageNumber, filter.PageSize, totalRecords));
            }



        }
    }
}
