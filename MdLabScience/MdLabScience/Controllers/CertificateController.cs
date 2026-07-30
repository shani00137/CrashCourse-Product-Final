using CrystalDecisions.CrystalReports.Engine;
using MdLabScience.Certificates;
using MdLabScience.DbContext;
using MdLabScience.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace MdLabScience.Controllers
{
    public class CertificateController : ApiController
    {
        [HttpPost]
        [Route("api/Certificate/ExportCertificate")]
        public Task<HttpResponseMessage> ExportCertificate([FromBody] CertificateMD value)
        {
            HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
            try
            {
                DataTable dt = new DataTable();
                dt.Columns.Add("Name");
                dt.Columns.Add("SerialNo");                
                dt.Columns.Add("StartDate", typeof(DateTime));
                dt.Columns.Add("EndDate", typeof(DateTime));
                dt.Columns.Add("CourseName");
                ReportDocument rpt=null;
                if (value.Export == "ACLSC")
                {
                    rpt = new ACLSC();
                }
                if (value.Export == "ACTTrauma")
                {
                    rpt = new ACTTrauma();
                }
                if (value.Export == "AHSC")
                {
                    rpt = new AHSCnEW();
                }
                if (value.Export == "AlliedHealth")
                {
                    rpt = new AlliedHealth();
                }
                if (value.Export == "BLS")
                {
                    rpt = new BLS();
                }
                if (value.Export == "PALS")
                {
                    rpt = new PALS();
                }
                dt.Rows.Add(value.Name, value.SerialNo, value.StartDate, value.EndDate, value.CourseName);
                rpt.SetDataSource(dt);
                Stream stream = rpt.ExportToStream(CrystalDecisions.Shared.ExportFormatType.PortableDocFormat);

                httpResponseMessage.Content = new StreamContent(stream);
                httpResponseMessage.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment");
                httpResponseMessage.Content.Headers.ContentDisposition.FileName = "Report.pdf";
                httpResponseMessage.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
                rpt.Clone();
                rpt.Dispose();
            }
            catch (Exception ex)
            {

            }
            return Task.FromResult(httpResponseMessage);
        }

        [HttpGet]
        [Route("api/Certificate/ExportTestingReport/{id}")]
        public String ExportTestingReport(String id)
        {
            String ErrorMessage = "";
            HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
            try
            {
                DataTable dt = new DataTable();
                dt.Columns.Add("Name");
                dt.Columns.Add("SerialNo");
                dt.Columns.Add("StartDate", typeof(DateTime));
                dt.Columns.Add("EndDate", typeof(DateTime));
                dt.Columns.Add("CourseName");
                ReportDocument rpt = null;
              
                    rpt = new PALS();
              
                dt.Rows.Add("Ad", "ED0000", "03/07/4", "03/07/4", "01");
                rpt.SetDataSource(dt);
                Stream stream = rpt.ExportToStream(CrystalDecisions.Shared.ExportFormatType.PortableDocFormat);

                httpResponseMessage.Content = new StreamContent(stream);
                httpResponseMessage.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment");
                httpResponseMessage.Content.Headers.ContentDisposition.FileName = "Report.pdf";
                httpResponseMessage.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
                rpt.Clone();
                rpt.Dispose();
            }
            catch (Exception ex)
            {
                ErrorMessage = ex.ToString();
            }
            return ErrorMessage;
        }

        [HttpGet]
        [Route("api/Certificate/ExportInvoice/{id}")]
        public Task<HttpResponseMessage> ExportInvoice(int id)
        {
            HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);
            try
            {
                DataTable dt = new DataTable();
                dt.Columns.Add("Name");
                dt.Columns.Add("InvoiceNo");
                dt.Columns.Add("Amount", typeof(double));
                dt.Columns.Add("Service");
                dt.Columns.Add("Remarks");
                dt.Columns.Add("Date", typeof(DateTime));
                dt.Columns.Add("PaidAmount", typeof(double));
                dt.Columns.Add("Balance", typeof(double));
                dt.Columns.Add("Email");
                dt.Columns.Add("Mobile");
                dt.Columns.Add("Address");
                dt.Columns.Add("Specialty");
                dt.Columns.Add("RegistrationDate", typeof(DateTime));
                dt.Columns.Add("Currency");
                dt.Columns.Add("SerivceAmount", typeof(double));
                ReportDocument rpt = null;
               
                rpt = new InvoiceReport();
                
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
                                     SerivceAmount=d.Amount,
                                     a.Currency
                                     

                                 }).ToList();
                    foreach (var q in Query)
                    {
                        dt.Rows.Add(q.FirstName + " " + q.LastName, q.InvoiceNo, q.Amount, q.Service, q.Remarks, q.DateTime, q.PaidAmount, q.Balance,q.Email,q.Mobile,q.Address,q.Specialty,q.RegistrationDate,"("+q.Currency+")",q.SerivceAmount);
                    }
                   
                    rpt.SetDataSource(dt);
                    Stream stream = rpt.ExportToStream(CrystalDecisions.Shared.ExportFormatType.PortableDocFormat);

                    httpResponseMessage.Content = new StreamContent(stream);
                    httpResponseMessage.Content.Headers.ContentDisposition = new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment");
                    httpResponseMessage.Content.Headers.ContentDisposition.FileName = "SaleInvoice.pdf";
                    httpResponseMessage.Content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
                    rpt.Clone();
                    rpt.Dispose();
                }
            }
            catch (Exception ex)
            {

            }
            return Task.FromResult(httpResponseMessage);
        }


    }
}
