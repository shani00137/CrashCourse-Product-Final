using IMS_WebApp.Models;
using MdLabScience.DbContext;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PayrollManagementSystem.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MdLabScience.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserPermissionController : ControllerBase
    {
        [HttpGet]
        public IEnumerable<string> detailGet()
        {
            return new string[] { "value1", "value2" };
        }

        [HttpGet]
        [Route("api/UserPermission/Get")]
        public IActionResult Get()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserPermissions
                             join m in db.UserRoles on c.RoleId equals m.RoleId
                             join r in db.UserPages on c.PageId equals r.PageId
                             select new
                             {
                                 c.RoleId,
                                 m.RoleName,
                                 r.url,
                                 r.name,
                                 r.icon,
                                 r.PageId,
                                 c.PermissionId
                             }).ToList();
                return Ok(query);
            }
        }

        [HttpPost]
        [Route("api/UserPermission/SaveUserPermission")]
        public string SaveUserPermission([FromBody] UserPermissionMD userInfoMD)
        {
            string Message = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var CheckInfo = db.UserPermissions.Where(x => x.PageId == userInfoMD.PageId && x.RoleId == userInfoMD.RoleId).ToList();
                if (CheckInfo.Count == 0)
                {
                    var GetPageMenueInfo = db.UserPages.Where(x => x.PageId == userInfoMD.PageId).ToList();
                    if (GetPageMenueInfo.Count > 0)
                    {
                        UserPermission userPermssion = new UserPermission();
                        userPermssion.RoleId = userInfoMD.RoleId;
                        userPermssion.PageId = userInfoMD.PageId;
                        userPermssion.MenuId = GetPageMenueInfo[0].MenuId;
                        db.UserPermissions.Add(userPermssion);
                        db.SaveChanges();
                        Message = "Permission Added..";
                    }
                }
                else
                {
                    Message = "Page already assigned..";
                }
            }
            return Message;
        }

        [HttpGet]
        [Route("api/UserPermission/Details/{id}")]
        public IActionResult Details(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserPermissions
                             join m in db.UserRoles on c.RoleId equals m.RoleId
                             join r in db.UserPages on c.PageId equals r.PageId
                             where c.RoleId == id
                             select new
                             {
                                 c.RoleId,
                                 m.RoleName,
                                 r.url,
                                 r.name,
                                 r.icon,
                                 c.PermissionId
                             }).ToList();
                return Ok(query);
            }
        }

        [HttpGet]
        [Route("api/UserPermission/Delete/{id}")]
        public void DeletePermissionPage(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserPermissions where c.PermissionId == id select c).ToList();
                if (query.Count > 0)
                {
                    var DeleteRecord = (from c in db.UserPermissions where c.PermissionId == id select c).FirstOrDefault();
                    db.UserPermissions.Remove(DeleteRecord);
                    db.SaveChanges();
                }
            }
        }

        [HttpGet]
        [Route("api/UserPermission/GetManuePages/{id}")]
        public IActionResult GetManuePages(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserPermissions
                             join l in db.UserInfoes on c.RoleId equals l.RoleId
                             join r in db.UserPages on c.PageId equals r.PageId
                             where l.UserNo == id
                             group r by new { r.MenuId } into g
                             select new
                             {
                                 MenuUrl = db.UserMenus.Where(x => x.MenuId == g.Key.MenuId).Select(x => x.url).FirstOrDefault(),
                                 MenuName = db.UserMenus.Where(x => x.MenuId == g.Key.MenuId).Select(x => x.MenuName).FirstOrDefault(),
                                 PageName = (from c in db.UserPages
                                             join w in db.UserPermissions on c.PageId equals w.PageId
                                             join m in db.UserInfoes on w.RoleId equals m.RoleId
                                             where c.MenuId == g.Key.MenuId && m.UserNo == id
                                             select c).ToList()
                             }).ToList();
                return Ok(query);
            }
        }

        [HttpGet]
        [Route("api/UserPermission/GetUserControllers")]
        public IActionResult GetUserControllers()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserControllers
                             join w in db.UserMenus on c.MenuId equals w.MenuId
                             select new
                             {
                                 c.ControllerId,
                                 c.ControllerName,
                                 c.ControllerUrl,
                                 w.MenuName,
                                 w.MenuId
                             }).ToList();
                return Ok(query);
            }
        }

        [HttpPost]
        [Route("api/UserPermission/SaveUserController")]
        public String SaveUserController([FromBody] UserPermissionControllerMD userInfoMD)
        {
            string Message;
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var GetPageMenueInfo = db.UserControllers.Where(x => x.ControllerUrl == userInfoMD.ControllerUrl || x.ControllerName == userInfoMD.ControllerName).ToList();
                if (GetPageMenueInfo.Count == 0)
                {
                    UserController userPermssion = new UserController();
                    userPermssion.ControllerName = userInfoMD.ControllerName;
                    userPermssion.ControllerUrl = userInfoMD.ControllerUrl;
                    userPermssion.MenuId = userInfoMD.MenuId;
                    db.UserControllers.Add(userPermssion);
                    db.SaveChanges();
                    Message = "Save Sucessfully..";
                }
                else
                {
                    Message = "Controller Name already Present..";
                }
            }
            return Message;
        }

        [HttpPost]
        [Route("api/UserPermission/SaveUserControllerPermission")]
        public String SaveUserControllerPermission(UserPermissionMD value)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var DeleteAllExisting = db.ControllerPermissions.Where(x => x.UserNo == value.UserNo).ToList();
                if (DeleteAllExisting.Count > 0)
                {
                    foreach (var q in DeleteAllExisting)
                    {
                        var Delete = db.ControllerPermissions.Where(x => x.CPermissionId == q.CPermissionId).FirstOrDefault();
                        db.ControllerPermissions.Remove(Delete);
                        db.SaveChanges();
                    }
                }
                foreach (var q in value.PermissinList)
                {
                    ControllerPermission userPermssion = new ControllerPermission();
                    userPermssion.ControllerId = q.ControllerId;
                    if (q.Permission == null)
                    {
                        userPermssion.Permission = false;
                    }
                    userPermssion.Permission = q.Permission;
                    userPermssion.UserNo = value.UserNo;
                    db.ControllerPermissions.Add(userPermssion);
                    db.SaveChanges();
                }
            }
            return "Save Sucessfuly";
        }

        [HttpPost]
        [Route("api/UserPermission/UpdateUserController")]
        public String UpdateUserController([FromBody] UserPermissionControllerMD userInfoMD)
        {
            string Message = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var GetInfo = db.UserControllers.Where(x => x.ControllerId == userInfoMD.ControllerId).ToList();
                if (GetInfo.Count > 0)
                {
                    GetInfo[0].ControllerUrl = userInfoMD.ControllerUrl;
                    GetInfo[0].ControllerName = userInfoMD.ControllerName;
                    GetInfo[0].MenuId = userInfoMD.MenuId;
                    db.SaveChanges();
                    Message = "Update Sucessfully..";
                }
            }
            return Message;
        }

        [HttpGet]
        [Route("api/UserPermission/DeleteController/{id}")]
        public String DeleteController(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserControllers where c.ControllerId == id select c).ToList();
                if (query.Count > 0)
                {
                    var DeleteRecord = (from c in db.UserControllers where c.ControllerId == id select c).FirstOrDefault();
                    db.UserControllers.Remove(DeleteRecord);
                    db.SaveChanges();
                }
            }
            return "Delete Sucessfuly..";
        }

        [HttpGet]
        [Route("api/UserPermission/GetAllUserPermissions/{id}")]
        public IActionResult GetAllUserPermissions(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserControllers select c).ToList();

                List<UserPermissionControllerMD> list = new List<UserPermissionControllerMD>();
                foreach (var q in query)
                {
                    var CheckUser = db.ControllerPermissions.Where(x => x.UserNo == id && x.ControllerId == q.ControllerId).ToList();
                    if (CheckUser.Count > 0)
                    {
                        list.Add(new UserPermissionControllerMD
                        {
                            MenuId = q.MenuId,
                            MenuName = db.UserMenus.Where(x => x.MenuId == q.MenuId).Select(x => x.MenuName).FirstOrDefault(),
                            ControllerName = q.ControllerName,
                            ControllerId = q.ControllerId,
                            ControllerUrl = q.ControllerUrl,
                            Permission = CheckUser[0].Permission
                        });
                    }
                    else
                    {
                        list.Add(new UserPermissionControllerMD
                        {
                            MenuId = q.MenuId,
                            MenuName = db.UserMenus.Where(x => x.MenuId == q.MenuId).Select(x => x.MenuName).FirstOrDefault(),
                            ControllerName = q.ControllerName,
                            ControllerId = q.ControllerId,
                            ControllerUrl = q.ControllerUrl,
                            Permission = null
                        });
                    }
                }
                var FilterQuery = (from c in list
                                   group c by c.MenuId into g
                                   select new
                                   {
                                       MenuName = db.UserMenus.Where(x => x.MenuId == g.Key).Select(x => x.MenuName).FirstOrDefault(),
                                       Controllers = g.Where(x => x.MenuId == g.Key).Select(x => x).ToList()
                                   }).ToList();

                return Ok(FilterQuery);
            }
        }
    }
}
