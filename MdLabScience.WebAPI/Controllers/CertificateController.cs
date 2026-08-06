using MdLabScience.DbContext;
using MdLabScience.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MdLabScience.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CertificateController : ControllerBase
    {
        [HttpPost]
        [Route("api/Certificate/ExportCertificate")]
        public Task<IActionResult> ExportCertificate([FromBody] CertificateMD value)
        {
            // TODO: Crystal Reports is not supported in .NET Core.
            // This is a stub that returns an empty response.
            // In the future, replace with a PDF generation library like QuestPDF, DinkToPdf, or similar.
            try
            {
                // TODO: Implement PDF generation for certificates
                // Previously used Crystal Reports with report types: ACLSC, ACTTrauma, AHSC, AlliedHealth, BLS, PALS
            }
            catch (Exception ex)
            {
            }
            return Task.FromResult<IActionResult>(Ok(new { Message = "Certificate export not available in .NET Core. Crystal Reports not supported." }));
        }

        [HttpGet]
        [Route("api/Certificate/ExportTestingReport/{id}")]
        public String ExportTestingReport(String id)
        {
            // TODO: Crystal Reports is not supported in .NET Core.
            // This is a stub that returns an empty response.
            try
            {
                // TODO: Implement PDF generation for testing reports
            }
            catch (Exception ex)
            {
                return ex.ToString();
            }
            return "Crystal Reports not supported in .NET Core";
        }

        [HttpGet]
        [Route("api/Certificate/ExportInvoice/{id}")]
        public Task<IActionResult> ExportInvoice(int id)
        {
            // TODO: Crystal Reports is not supported in .NET Core.
            // This is a stub that returns an empty response.
            // Previously used InvoiceReport.rpt with data from CertificationApplicantTBs and ApplicantInvoiceTBs
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var Query = (from c in db.CertificationApplicantTBs
                                 join a in db.ApplicantInvoiceTBs on c.CertifiedApplicantId equals a.ApplicantId
                                 join d in db.CertificateInvoiceTbs on a.InvoiceId equals d.InvoiceId
                                 where a.InvoiceId == id
                                 select new
                                 {
                                     a.ApplicantId,
                                     a.Amount,
                                     a.InvoiceNo,
                                     a.Remarks,
                                     a.Balance,
                                     a.PaidAmount,
                                     a.DateTime,
                                     c.FirstName,
                                     c.LastName,
                                     c.Mobile,
                                     c.Email,
                                     c.Specialty,
                                     c.RegistrationDate,
                                     c.Address,
                                     d.Service,
                                     SerivceAmount = d.Amount,
                                     a.Currency
                                 }).ToList();
                    // TODO: Generate PDF from invoice data
                }
            }
            catch (Exception ex)
            {
            }
            return Task.FromResult<IActionResult>(Ok(new { Message = "Invoice export not available in .NET Core. Crystal Reports not supported." }));
        }
    }
}
