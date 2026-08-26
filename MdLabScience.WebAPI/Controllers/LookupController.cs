using MdLabScience.DbContext;
using MdLabScience.Models;
using MdLabScience.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace MdLabScience.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LookupController : ControllerBase
    {
        [HttpGet]
        [Route("GetAllApplicationStatuses")]
        public IActionResult GetAllApplicationStatuses()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = db.ApplicationStatusTbs
                    .Select(s => new ApplicationStatusModel
                    {
                        ApplicationStatusId = s.ApplicationStatusId,
                        StatusName = s.StatusName
                    })
                    .OrderBy(x => x.ApplicationStatusId)
                    .ToList();
                return Ok(query);
            }
        }

        [HttpGet]
        [Route("GetApplicationStatus/{id}")]
        public IActionResult GetApplicationStatus(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var status = db.ApplicationStatusTbs
                    .Where(x => x.ApplicationStatusId == id)
                    .Select(s => new ApplicationStatusModel
                    {
                        ApplicationStatusId = s.ApplicationStatusId,
                        StatusName = s.StatusName
                    })
                    .FirstOrDefault();
                if (status == null)
                    return NotFound("Application status not found");
                return Ok(status);
            }
        }

        [HttpPost]
        [Route("SaveApplicationStatus")]
        public IActionResult SaveApplicationStatus([FromBody] ApplicationStatusModel model)
        {
            if (string.IsNullOrWhiteSpace(model.StatusName))
                return BadRequest("Status name is required");

            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var entity = new ApplicationStatusTb
                {
                    StatusName = model.StatusName.Trim()
                };
                db.ApplicationStatusTbs.Add(entity);
                db.SaveChanges();
                model.ApplicationStatusId = entity.ApplicationStatusId;
                return Ok(model);
            }
        }

        [HttpPost]
        [Route("UpdateApplicationStatus")]
        public IActionResult UpdateApplicationStatus([FromBody] ApplicationStatusModel model)
        {
            if (string.IsNullOrWhiteSpace(model.StatusName))
                return BadRequest("Status name is required");

            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var entity = db.ApplicationStatusTbs.FirstOrDefault(x => x.ApplicationStatusId == model.ApplicationStatusId);
                if (entity == null)
                    return NotFound("Application status not found");

                entity.StatusName = model.StatusName.Trim();
                db.SaveChanges();
                return Ok(model);
            }
        }

        [HttpGet]
        [Route("DeleteApplicationStatus/{id}")]
        public IActionResult DeleteApplicationStatus(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var entity = db.ApplicationStatusTbs.FirstOrDefault(x => x.ApplicationStatusId == id);
                if (entity == null)
                    return NotFound("Application status not found");

                db.ApplicationStatusTbs.Remove(entity);
                db.SaveChanges();
                return Ok("Deleted successfully");
            }
        }

        [HttpGet]
        [Route("GetAllServices")]
        public IActionResult GetAllServices()
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var query = db.ServiceTbs
                    .Select(s => new ServiceModel
                    {
                        ServiceId = s.ServiceId,
                        ServiceName = s.ServiceName,
                        PurchasePrice = s.PurchasePrice,
                        SalePrice = s.SalePrice
                    })
                    .OrderBy(x => x.ServiceId)
                    .ToList();
                return Ok(query);
            }
        }

        [HttpGet]
        [Route("GetService/{id}")]
        public IActionResult GetService(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var service = db.ServiceTbs
                    .Where(x => x.ServiceId == id)
                    .Select(s => new ServiceModel
                    {
                        ServiceId = s.ServiceId,
                        ServiceName = s.ServiceName,
                        PurchasePrice = s.PurchasePrice,
                        SalePrice = s.SalePrice
                    })
                    .FirstOrDefault();
                if (service == null)
                    return NotFound("Service not found");
                return Ok(service);
            }
        }

        [HttpPost]
        [Route("SaveService")]
        public IActionResult SaveService([FromBody] ServiceModel model)
        {
            if (string.IsNullOrWhiteSpace(model.ServiceName))
                return BadRequest("Service name is required");

            if (model.PurchasePrice < 0 || model.SalePrice < 0)
                return BadRequest("Prices cannot be negative");

            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var entity = new ServiceTb
                {
                    ServiceName = model.ServiceName.Trim(),
                    PurchasePrice = model.PurchasePrice,
                    SalePrice = model.SalePrice
                };
                db.ServiceTbs.Add(entity);
                db.SaveChanges();
                model.ServiceId = entity.ServiceId;
                return Ok(model);
            }
        }

        [HttpPost]
        [Route("UpdateService")]
        public IActionResult UpdateService([FromBody] ServiceModel model)
        {
            if (string.IsNullOrWhiteSpace(model.ServiceName))
                return BadRequest("Service name is required");

            if (model.PurchasePrice < 0 || model.SalePrice < 0)
                return BadRequest("Prices cannot be negative");

            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var entity = db.ServiceTbs.FirstOrDefault(x => x.ServiceId == model.ServiceId);
                if (entity == null)
                    return NotFound("Service not found");

                entity.ServiceName = model.ServiceName.Trim();
                entity.PurchasePrice = model.PurchasePrice;
                entity.SalePrice = model.SalePrice;
                db.SaveChanges();
                return Ok(model);
            }
        }

        [HttpGet]
        [Route("DeleteService/{id}")]
        public IActionResult DeleteService(int id)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var entity = db.ServiceTbs.FirstOrDefault(x => x.ServiceId == id);
                if (entity == null)
                    return NotFound("Service not found");

                db.ServiceTbs.Remove(entity);
                db.SaveChanges();
                return Ok("Deleted successfully");
            }
        }

    }
}
