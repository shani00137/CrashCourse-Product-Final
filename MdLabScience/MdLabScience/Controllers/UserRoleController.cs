



using IMS_WebApp.Models;
using MdLabScience.DbContext;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;


namespace IMS_WebApp.Controllers
{
    public class UserRoleController : ApiController
    {
       
        [HttpGet]
        [Route("api/UserRole/Get")]
        public IEnumerable<UserRoleMD> Get()
        {
            List<UserRoleMD> RoleList = new List<UserRoleMD>();
            MdLabScienceDbEntities db = new MdLabScienceDbEntities();
            var query = (from c in db.UserRoles select c).ToList();
            foreach (var q in query)
            {
                RoleList.Add(new UserRoleMD
                {
                    RoleId = q.RoleId,
                    RoleName = q.RoleName,
                  
                });
            }
            return RoleList;
        }

        [HttpPost]
        [Route("api/UserRole/SaveUserRole")]
        public void SaveUserRole([FromBody]UserRoleMD userRoleMD)
        {
            MdLabScienceDbEntities db = new MdLabScienceDbEntities();
            UserRole Users = new UserRole();
            Users.RoleName = userRoleMD.RoleName;
            db.UserRoles.Add(Users);
            db.SaveChanges();


        }


        [HttpGet]
        [Route("api/UserRole/Details/{id}")]
        public IEnumerable<UserRoleMD> Details(int id)
        {
            List<UserRoleMD> list = new List<UserRoleMD>();
            MdLabScienceDbEntities db = new MdLabScienceDbEntities();
            var query = (from c in db.UserRoles where c.RoleId==id select c).ToList();
            foreach (var q in query)
            {
                list.Add(new UserRoleMD
                {
                    RoleId = query[0].RoleId,
                    RoleName = query[0].RoleName,

                });
            }
            return list;

        }
        [HttpPut]
        [Route("api/UserRole/Edit")]
        public void Edit([FromBody]UserRoleMD value)
        {

            MdLabScienceDbEntities db = new MdLabScienceDbEntities();
            var query = (from c in db.UserRoles where c.RoleId == value.RoleId select c).ToList();


            query[0].RoleName = value.RoleName.ToString();
           
            db.SaveChanges();

        }
    }
}
