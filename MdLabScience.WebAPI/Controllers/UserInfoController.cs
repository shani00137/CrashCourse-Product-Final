using IMS_WebApp.Models;
using MdLabScience.DbContext;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;

namespace MdLabScience.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserInfoController : ControllerBase
    {
        [HttpGet]
        [Route("api/UserInfo/Get")]
        public IActionResult Get()
        {
            List<UserInofMD> list = new List<UserInofMD>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserInfoes
                             join r in db.UserRoles on c.RoleId equals r.RoleId
                             select new
                             {
                                 c.UserNo,
                                 c.UserName,
                                 c.CreatedDate,
                                 c.ExpireDate,
                                 r.RoleName,
                                 c.Status,
                                 c.RoleId,
                                 c.Email,
                                 c.UserToken
                             }).ToList();

                foreach (var q in query)
                {
                    String Saleman = "";
                    int AreaId = 0;
                    String AreaType = "";
                    int SalemanId = 0;

                    list.Add(new UserInofMD
                    {
                        UserNo = q.UserNo,
                        UserName = q.UserName,
                        CreatedDate = q.CreatedDate,
                        SalemanId = SalemanId,
                        RoleName = q.RoleName,
                        Status = q.Status,
                        RoleId = q.RoleId,
                        Email = q.Email,
                        Saleman = Saleman,
                        UserToken = q.UserToken,
                        AreaType = AreaType,
                        AreaId = AreaId
                    });
                }
            }
            return Ok(list);
        }

        [HttpGet]
        [Route("api/UserInfo/GetUsersInfoWithEMP")]
        public IActionResult GetUsersInfoWithEMP()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserInfoes
                             select new
                             {
                                 c.UserNo,
                                 c.UserName,
                                 c.CreatedDate,
                                 c.ExpireDate,
                                 c.Status,
                                 c.RoleId,
                             }).ToList();

                return Ok(query);
            }
        }

        [HttpPost]
        [Route("api/UserInfo/SaveUsers")]
        public string SaveUsers([FromBody] UserInofMD userInfoMD)
        {
            string Message;
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    UserInfo userInfo = new UserInfo();

                    int UserNo = 1;

                    var getmaxID = (from c in db.UserInfoes
                                    orderby c.UserNo descending
                                    select new
                                    {
                                        c.UserNo,
                                    }).ToList();

                    if (getmaxID.Count > 0)
                    {
                        UserNo = getmaxID.First().UserNo + 1;
                    }

                    var CheckQueryforName = db.UserInfoes.Where(x => x.UserName == userInfoMD.UserName).ToList();
                    if (CheckQueryforName.Count == 0)
                    {
                        bool valid = IsValidEmail(userInfoMD.Email);
                        if (valid == true)
                        {
                            String Password = "Abc123";
                            userInfo.UserName = userInfoMD.UserName;
                            userInfo.UserPassword = Encrypt(Password);
                            userInfo.Email = userInfoMD.Email;
                            userInfo.UserNo = UserNo;
                            userInfo.Status = true;
                            userInfo.CreatedDate = DateTime.Now;
                            userInfo.RoleId = userInfoMD.RoleId;
                            db.UserInfoes.Add(userInfo);
                            db.SaveChanges();
                            Message = "User Sucessfuly Generated default Password is " + Password;
                        }
                        else
                        {
                            Message = "Email is not valid!";
                        }
                    }
                    else
                    {
                        Message = "User Name Already present please try different...!";
                    }
                }
            }
            catch (Exception ex)
            {
                Message = ex.ToString();
            }

            return Message;
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

        string get_unique_string(int string_length)
        {
            using (var rng = new RNGCryptoServiceProvider())
            {
                var bit_count = (string_length * 6);
                var byte_count = ((bit_count + 7) / 8);
                var bytes = new byte[byte_count];
                rng.GetBytes(bytes);
                return Convert.ToBase64String(bytes);
            }
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

        [HttpGet]
        [Route("api/UserInfo/Details/{id}")]
        public IEnumerable<UserInofMD> Details(int id)
        {
            List<UserInofMD> Userlist = new List<UserInofMD>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserInfoes
                             join r in db.UserRoles on c.RoleId equals r.RoleId
                             where c.UserNo == id
                             select new
                             {
                                 c.UserNo,
                                 c.UserName,
                                 r.RoleName,
                                 c.Status,
                                 c.RoleId,
                             }).ToList();
                foreach (var q in query)
                {
                    Userlist.Add(new UserInofMD
                    {
                        UserNo = q.UserNo,
                        UserName = Decrypt(q.UserName),
                        RoleName = q.RoleName,
                        Status = q.Status,
                        RoleId = q.RoleId,
                    });
                }
            }
            return Userlist;
        }

        [HttpPut]
        [Route("api/UserInfo/Edit")]
        public string Edit([FromBody] UserInofMD value)
        {
            string Messageis = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserInfoes where c.UserNo == value.UserNo select c).ToList();
                if (query.Count > 0)
                {
                    query[0].UserName = value.UserName.ToString();
                    query[0].Email = value.Email;
                    query[0].RoleId = value.RoleId;
                    db.SaveChanges();
                    Messageis = "Update Sucessfuly..";
                }
            }
            return Messageis;
        }

        [HttpGet]
        [Route("api/UserInfo/ChangeStatus/{id},{Status}")]
        public string ChangeStatus(int id, bool Status)
        {
            string Message = "";
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var query = (from c in db.UserInfoes where c.UserNo == id select c).ToList();
                    if (query.Count > 0)
                    {
                        var Updatedquery = (from c in db.UserInfoes where c.UserNo == id select c).ToList();
                        if (Status == true)
                        {
                            Updatedquery[0].Status = false;
                        }
                        else
                        {
                            Updatedquery[0].Status = true;
                        }
                        db.SaveChangesAsync();
                        Message = "Updated Successfuly..";
                    }
                }
            }
            catch (Exception ex)
            {
                Message = ex.ToString();
            }
            return Message;
        }
    }
}
