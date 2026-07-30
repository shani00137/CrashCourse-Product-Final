


using HotelManagement.Models;
using IMS_WebApp.Models;
using MdLabScience.DbContext;
using Newtonsoft.Json.Linq;

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;


namespace IMS_WebApp.Controllers
{
    
    public class LoginController : ApiController
    {
        private static TimeZoneInfo Pakistan_Standard_Time = TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");
        // GET: api/Login
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET: api/Login/5
        public string Get(int id)
        {
            return "value";
        }


        [HttpPost]
        [Route("api/login/Details")]
        public IEnumerable<UserInofMD> Details([FromBody] LoginModel loginInfo)
        {
            List<UserInofMD> UserList = new List<UserInofMD>();
            try
            {
                string pwd = Encrypt(loginInfo.Password);
            
                int DefaultStoreId = 0;
                MdLabScienceDbEntities db = new MdLabScienceDbEntities();

                var query = (from c in db.UserInfoes
                             where c.Status == true && c.UserName == loginInfo.Username && c.UserPassword == pwd
                             select new
                             {

                                 c.UserName,
                                 c.UserPassword,
                                 c.UserNo,
                              
                                 c.Email,
                                 c.UserToken,
                               


                             }).ToList();



                if (query.Count > 0)
                {
                   
                  
                    bool Licence = ValidateLicence();
                    UserList.Add(new UserInofMD
                    {
                        UserName = query[0].UserName,
                        UserNo = query[0].UserNo,
                      
                        Email = query[0].Email,
                   
                        Licence= Licence

                    });

                }




            }
            catch (Exception ex)
            {
                UserList.Add(new UserInofMD
                {
                    UserName = ex.ToString()
                });
            }

            return UserList;
        }


        [HttpPost]
        [Route("api/login/AppUserDetails")]
        public IHttpActionResult AppUserDetails([FromBody] LoginModel loginInfo)
        {
            List<LoginModel> LoginModelList = new List<LoginModel>();
            try
            {
                string pwd = Encrypt(loginInfo.Password);              
                MdLabScienceDbEntities db = new MdLabScienceDbEntities();
                var query = (from c in db.AppUserTbs
                             join a in db.ApplicantsTbs on c.ApplicantId equals a.ApplicantId                            
                             where c.Status == true && c.UserName == loginInfo.Username && c.Password == pwd
                             select new {
                             c.ApplicantId,
                             c.UserName,
                             c.AppUserId,
                             c.Status,
                             a.FirstName,
                             a.LastName,
                             a.Mobile,
                             a.OtherMobile,
                             c.DeviceId,
                             a.Address,
                             a.Email ,
                             c.LoginOn
                             }).FirstOrDefault();
                if (query!= null)
                {
                    if (query.DeviceId!="")
                    {
                        //if (query.DeviceId == loginInfo.DeviceId)
                        //{
                            LoginModelList.Add(new LoginModel
                            {
                                IsValid = true,
                                Response = "Welcome",
                                Username = query.UserName,
                                AppUserId = query.AppUserId,
                                Name = query.FirstName + query.LastName,
                                Mobile = query.Mobile,
                                Email = query.Email,
                                Address = query.Address,
                                ApplicantId=query.ApplicantId

                            });
                        //}
                        //else
                        //{
                        //    LoginModelList.Add(new LoginModel
                        //    {
                        //        IsValid = false,
                        //        Response = "Your device already registery, Please contact to Administrator..",
                        //        Username = query.UserName,
                        //        AppUserId = query.AppUserId,
                        //        Name = query.FirstName + query.LastName,
                        //        Mobile = query.Mobile,
                        //        Email = query.Email,
                        //        Address = query.Address,
                        //        ApplicantId = query.ApplicantId
                        //    });
                        //}
                    }
                    else
                    {
                        var UpdateDeviceId = db.AppUserTbs.Where(x => x.AppUserId == query.AppUserId).FirstOrDefault();
                        UpdateDeviceId.DeviceId = loginInfo.DeviceId;
                        db.SaveChanges();
                        LoginModelList.Add(new LoginModel
                        {
                            IsValid = true,
                            Response = "Welcome",
                            Username=query.UserName,
                            AppUserId = query.AppUserId,
                           Name = query.FirstName+query.LastName,
                            Mobile = query.Mobile,
                            Email = query.Email,
                            Address = query.Address,
                            ApplicantId = query.ApplicantId
                        });
                    }

                    //UpdateLoginDate
                    if (query.LoginOn == null)
                    {
                        int UserNo = query.AppUserId;
                        var UpdateLogin = db.AppUserTbs.Where(x => x.AppUserId == UserNo).FirstOrDefault();
                        UpdateLogin.LoginOn= TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                        db.SaveChanges();
                    }
                   
                }
                else
                {
                    LoginModelList.Add(new LoginModel
                    {
                        IsValid = false,
                        Response = "No User exist, please insert right users details"

                    });
                }
            }
            catch (Exception ex)
            {
               
            }

            return Json(LoginModelList);
        }

        private string Encrypt(string clearText)
        {
            string EncryptionKey = "MAKV2SPBNI99212";
            byte[] clearBytes = Encoding.Unicode.GetBytes(clearText);
            using (Aes encryptor = Aes.Create())
            {
                Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);
                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateEncryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(clearBytes, 0, clearBytes.Length);
                        cs.Close();
                    }
                    clearText = Convert.ToBase64String(ms.ToArray());
                }
            }
            return clearText;
        }

        private string Decrypt(string cipherText)
        {
            string EncryptionKey = "MAKV2SPBNI99212";
            byte[] cipherBytes = Convert.FromBase64String(cipherText);
            using (Aes encryptor = Aes.Create())
            {
                Rfc2898DeriveBytes pdb = new Rfc2898DeriveBytes(EncryptionKey, new byte[] { 0x49, 0x76, 0x61, 0x6e, 0x20, 0x4d, 0x65, 0x64, 0x76, 0x65, 0x64, 0x65, 0x76 });
                encryptor.Key = pdb.GetBytes(32);
                encryptor.IV = pdb.GetBytes(16);
                using (MemoryStream ms = new MemoryStream())
                {
                    using (CryptoStream cs = new CryptoStream(ms, encryptor.CreateDecryptor(), CryptoStreamMode.Write))
                    {
                        cs.Write(cipherBytes, 0, cipherBytes.Length);
                        cs.Close();
                    }
                    cipherText = Encoding.Unicode.GetString(ms.ToArray());
                }
            }
            return cipherText;
        }
        //[HttpGet]
        //[Route("api/login/GetManuePages/{id}")]
        //public IEnumerable<UserPermissionMD> GetManuePages(int id)
        //{
        //    List<UserPermissionMD> Permissionlist = new List<UserPermissionMD>();
        //    StandardTradingInventoryERPEntities db = new StandardTradingInventoryERPEntities();
        //    var query = (from c in db.UserPermissions
        //                 join l in db.UserInfoes on c.RoleId equals l.RoleId
        //                 join r in db.UserPages on c.PageId equals r.PageId


        //                 where l.UserNo == id && c.PageId ==r.PageId
        //                 select new
        //                 {

        //                     c.RoleId,

        //                     r.PageName,
        //                     r.PageHeader,
        //                     r.PageIcone,
        //                     c.PermissionId,
        //                     r.MenuId
        //                 }).ToList();
        //    foreach (var q in query)
        //    {
        //        Permissionlist.Add(new UserPermissionMD
        //        {
        //            RoleId = q.RoleId,

        //            PageName = q.PageName,
        //            PageHeader = q.PageHeader,
        //            PageIcone = q.PageIcone,
        //            PermissionId = q.PermissionId,
        //            MenuId=Convert.ToInt16( q.MenuId)




        //        });
        //    }
        //    return Permissionlist;

        //}
        //// PUT: api/Login/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Login/5
        public bool ValidateLicence()
        {
            DateTime Today = DateTime.Today;
            DateTime ExpireDate = Convert.ToDateTime("7/30/2022").Date;
            if (Today > ExpireDate)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
        [HttpGet]
        [Route("api/login/ChangePassword/{UserNo},{CurrentPassword},{NewPassword}")]
        public string ChangePassword(int UserNo, string CurrentPassword, string NewPassword)
        {
            string PasswordChanged = "";

            MdLabScienceDbEntities db = new MdLabScienceDbEntities();
            string CurrentEncriptedPassword = Encrypt(CurrentPassword);
            var query = (from c in db.UserInfoes where c.UserNo == UserNo && c.UserPassword == CurrentEncriptedPassword select c).ToList();
            if (query.Count > 0)
            {
                query[0].UserPassword = Encrypt(NewPassword);
                db.SaveChanges();
                PasswordChanged = "Password Changed Sucessfuly, You are requried to logout..";
            }
            else
            {
                PasswordChanged = "Password Changed Error";
            }

            return PasswordChanged;

        }

        [HttpGet]
        [Route("api/login/ResetPassword/{UserNo},{newpassword}")]
        public string ResetPassword(int UserNo, string newpassword)
        {
            string PasswordChanged = "";

            MdLabScienceDbEntities db = new MdLabScienceDbEntities();

            var query = (from c in db.UserInfoes where c.UserNo == UserNo select c).ToList();
            if (query.Count > 0)
            {
                string Password = newpassword;
                query[0].UserPassword = Encrypt(Password);
                db.SaveChanges();
                PasswordChanged = "Password Reset Succesfully New Password is " + Password;
            }
            else
            {
                PasswordChanged = "Password Changed Error";
            }

            return PasswordChanged;

        }
        [HttpGet]
        [Route("api/login/ResetPasswordAppUser/{UserNo},{newpassword}")]
        public string ResetPasswordAppUser(int UserNo, string newpassword)
        {
            string PasswordChanged = "";

            MdLabScienceDbEntities db = new MdLabScienceDbEntities();

            var query = (from c in db.AppUserTbs where c.AppUserId == UserNo select c).ToList();
            if (query.Count > 0)
            {
                string Password = newpassword;
                query[0].Password = Encrypt(Password);
                db.SaveChanges();
                PasswordChanged = "Password Reset Succesfully New Password is " + Password;
            }
            else
            {
                PasswordChanged = "Password Changed Error";
            }

            return PasswordChanged;

        }
        [HttpPost]
        [Route("api/login/RecoveryPassword")]
        public async Task<string> ReoverPassword([FromBody] JObject value)
        {
            string PasswordChanged = "";
            try
            {
                MdLabScienceDbEntities db = new MdLabScienceDbEntities();
                String getemail = value["Email"].ToString();
                String getUser = value["UserName"].ToString();
                var query = (from c in db.UserInfoes where c.UserName == getUser select new { c.UserName, c.Email, c.UserPassword }).ToList();
                if (query.Count > 0)
                {
                    String Email = query[0].Email;
                    String Password = Decrypt(query[0].UserPassword.ToString());
                    String Name = query[0].UserName;
                    String Message = "Dear " + Name + "  Your Password is : " + Password;
                    PasswordChanged = SendEmail(Email, Message);
                }
                else
                {
                    PasswordChanged = "Email Address not Verified Please Contact to Administrator";
                }
            }
            catch (Exception ex)
            {
                PasswordChanged = ex.ToString();
            }


            return PasswordChanged;

        }
        public string SendEmail(String email, String Message)
        {
            string ResponseMessage = "";
            try
            {
                SmtpClient client = new SmtpClient();
                client.DeliveryMethod = SmtpDeliveryMethod.Network;
                client.EnableSsl = true;
                client.Host = "smtp.gmail.com";
                client.Port = 587;
                // setup Smtp authentication
                System.Net.NetworkCredential credentials =
                    new System.Net.NetworkCredential("isolution00137@gmail.com", "Chshani123");
                client.UseDefaultCredentials = false;
                client.Credentials = credentials;
                //can be obtained from your model
                MailMessage msg = new MailMessage();
                msg.From = new MailAddress("isolution00137@gmail.com");
                msg.To.Add(new MailAddress(email.Trim()));

                msg.Subject = "Password Recovery";
                msg.IsBodyHtml = true;
                msg.Body = string.Format("<html><head></head><body><b>'" + Message + "'</b></body>");
                client.Send(msg);
                ResponseMessage = "Please Check Your Email";
            }
            catch (Exception ex)
            {
                ResponseMessage = ex.ToString();
            }
            return ResponseMessage;
        }

        string get_unique_string(int string_length)
        {
            using (var rng = new RNGCryptoServiceProvider())
            {
                var bit_count = (string_length * 6);
                var byte_count = ((bit_count + 7) / 8); // rounded up
                var bytes = new byte[byte_count];
                rng.GetBytes(bytes);
                return Convert.ToBase64String(bytes);
            }
        }

    }
}
