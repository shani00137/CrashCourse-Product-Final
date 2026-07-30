using IMS_WebApp.Models;
using MdLabScience.DbContext;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MdLabScience.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserPagesController : ControllerBase
    {
        [HttpGet]
        [Route("api/UserPages/Get")]
        public IEnumerable<UserPermissionMD> Get()
        {
            List<UserPermissionMD> Userlist = new List<UserPermissionMD>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserPages
                             select c).ToList();
                foreach (var q in query)
                {
                    Userlist.Add(new UserPermissionMD
                    {
                        PageId = q.PageId,
                        PageHeader = q.name,
                    });
                }
            }
            return Userlist;
        }

        [HttpGet]
        [Route("api/UserPages/MenuList")]
        public IActionResult MenuList()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserMenus
                             select c).ToList();
                return Ok(query);
            }
        }

        [HttpPost]
        [Route("api/UserPages/Save")]
        public string Save([FromBody] UserPagesMD value)
        {
            String Message = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                UserPage tb = new UserPage();
                var Query = db.UserPages.Where(x => x.name == value.PageName).ToList();
                if (Query.Count == 0)
                {
                    tb.name = value.PageHeader;
                    tb.icon = value.PageIcone;
                    tb.url = value.PageName;
                    tb.MenuId = value.MenuId;
                    db.UserPages.Add(tb);
                    db.SaveChanges();
                    Message = "Sucessfully Save..";
                }
                else
                {
                    Message = "Page Name Already Present";
                }
            }
            return Message;
        }

        [HttpGet]
        [Route("api/UserPages/GetList")]
        public IActionResult GetList()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserPages
                             join m in db.UserMenus on c.MenuId equals m.MenuId
                             select new { c.MenuId, c.PageId, c.url, c.icon, c.name, m.MenuName }).ToList();
                return Ok(query);
            }
        }

        [HttpGet]
        [Route("api/UserPages/Details/{id}")]
        public IEnumerable<UserPagesMD> Details(int id)
        {
            List<UserPagesMD> List = new List<UserPagesMD>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserPages
                             join m in db.UserMenus on c.MenuId equals m.MenuId
                             where c.PageId == id
                             select new { c.PageId, c.url, c.icon, c.MenuId, c.name, m.MenuName }).ToList();
                foreach (var q in query)
                {
                    List.Add(new UserPagesMD
                    {
                        PageId = q.PageId,
                        PageName = q.url,
                        PageHeader = q.name,
                        PageIcone = q.icon,
                        MenuId = q.MenuId
                    });
                }
            }
            return List;
        }

        [HttpPut]
        [Route("api/UserPages/Edit")]
        public void Edit([FromBody] UserPagesMD value)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserPages where c.PageId == value.PageId select c).ToList();
                query[0].url = value.PageName.ToString();
                query[0].name = value.PageHeader;
                query[0].icon = value.PageIcone;
                query[0].MenuId = value.MenuId;
                db.SaveChanges();
            }
        }

        [HttpDelete]
        [Route("api/UserPages/Delete/{id}")]
        public void DeleteUserPages(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = (from c in db.UserPages where c.PageId == id select c).ToList();
                if (query.Count > 0)
                {
                    var Deletequery = (from c in db.UserPages where c.PageId == id select c).ToList();
                    var DeletequeryPermission = (from c in db.UserPermissions where c.PageId == id select c).ToList();

                    if (Deletequery.Count > 0)
                    {
                        var DeletequeryConfimed = (from c in db.UserPages where c.PageId == id select c).FirstOrDefault();
                        db.UserPages.Remove(DeletequeryConfimed);
                    }
                    if (DeletequeryPermission.Count > 0)
                    {
                        var DeletequeryPermissionConfirmed = (from c in db.UserPermissions where c.PageId == id select c).FirstOrDefault();
                        db.UserPermissions.Remove(DeletequeryPermissionConfirmed);
                    }
                    db.SaveChangesAsync();
                }
            }
        }
    }
}
