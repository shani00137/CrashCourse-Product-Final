
using EMCQWebApi.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

using System.IO;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Web;
using System.Xml.Linq;


using System.Threading.Tasks;

using ClosedXML.Excel;
using MdLabScience.DbContext;
using ExcelDataReader;

namespace EMCQWebApi.Controllers
{
    public class QuestionsController : ApiController
    {
        private static TimeZoneInfo Pakistan_Standard_Time = TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");
        [HttpGet]
        [Route("api/Questions/GetAllQuestions/{CourseId}")]
        public IHttpActionResult GetAllQuestions(int CourseId)
        {
            var Query = (dynamic)null;
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    Query = (from c in db.QuestionsTBs
                                 join q in db.CourseTbs on c.CourseId equals q.CourseId
                             where c.CourseId== CourseId
                             select new
                                 {

                                     c.QuestionContent,
                                     c.QuestionId,
                                     c.DateTime,
                                     c.CourseId,
                                     q.CourseName,
                            
                                     IsSelected = false,
                                     QuestionOptions = db.QuestionOptionsTbs.Where(x => x.QuestionId == c.QuestionId).ToList(),


                                 }).OrderBy(x => x.QuestionId).ToList();
                    return Json(Query);
                }
            }
            catch (Exception ex)
            {
                Query = ex.ToString();
            }
           return Json(Query);
            
        }
        [HttpGet]
        [Route("api/Questions/GetNextQuestion/{QuestionId}")]
        public IHttpActionResult GetNextQuestion(int QuestionId)
        {
            var Query = (dynamic)null;
            try
            {

                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    int IncrementQuestion = 0;
                    if (QuestionId == 0)
                    {
                        IncrementQuestion = 1;
                    }
                    else
                    {
                        IncrementQuestion= QuestionId + 1;
                    }
                    Query = (from c in db.QuestionsTBs
                             join q in db.CourseTbs on c.CourseId equals q.CourseId
                             where c.QuestionId== IncrementQuestion
                             select new
                             {

                                 c.QuestionContent,
                                 c.QuestionId,
                                 c.DateTime,
                                 c.CourseId,
                                 q.CourseName,

                                 IsSelected = false,
                                 QuestionOptions = db.QuestionOptionsTbs.Where(x => x.QuestionId == c.QuestionId).ToList(),


                             }).OrderBy(x => x.QuestionId).ToList();
                    return Json(Query);
                }
            }
            catch (Exception ex)
            {
                Query = ex.ToString();
            }
            return Json(Query);

        }

        [HttpGet]
        [Route("api/Questions/GetLastQuestion/{QuestionId}")]
        public IHttpActionResult GetLastQuestion(int QuestionId)
        {
            var Query = (dynamic)null;
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    int IncrementQuestion = QuestionId - 1;
                    if (IncrementQuestion == 0)
                    {
                        IncrementQuestion = 1;
                    }
                    Query = (from c in db.QuestionsTBs
                             join q in db.CourseTbs on c.CourseId equals q.CourseId
                             where c.QuestionId == IncrementQuestion
                             select new
                             {

                                 c.QuestionContent,
                                 c.QuestionId,
                                 c.DateTime,
                                 c.CourseId,
                                 q.CourseName,

                                 IsSelected = false,
                                 QuestionOptions = db.QuestionOptionsTbs.Where(x => x.QuestionId == c.QuestionId).ToList(),


                             }).OrderBy(x => x.QuestionId).ToList();
                    return Json(Query);
                }
            }
            catch (Exception ex)
            {
                Query = ex.ToString();
            }
            return Json(Query);

        }
        [HttpGet]
        [Route("api/Questions/GetQuestionById/{QuestionId}")]
        public IHttpActionResult GetQuestionById(int QuestionId)
        {
            var Query = (dynamic)null;
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                  
                    Query = (from c in db.QuestionsTBs
                             join q in db.CourseTbs on c.CourseId equals q.CourseId
                             where c.QuestionId == QuestionId
                             select new
                             {

                                 c.QuestionContent,
                                 c.QuestionId,
                                 c.DateTime,
                                 c.CourseId,
                                 q.CourseName,

                                 IsSelected = false,
                                 QuestionOptions = db.QuestionOptionsTbs.Where(x => x.QuestionId == c.QuestionId).ToList(),


                             }).OrderBy(x => x.QuestionId).ToList();
                    return Json(Query);
                }
            }
            catch (Exception ex)
            {
                Query = ex.ToString();
            }
            return Json(Query);

        }
        [HttpGet]
        [Route("api/Questions/FilterQuestions/{CatagoryId},{SubCatagorId}")]
        public IHttpActionResult FilterQuestions(int CatagoryId, int SubCatagorId)
        {
            var Query = (dynamic)null;
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                   
                        Query = (from c in db.QuestionsTBs
                                 join q in db.CourseTbs on c.CourseId equals q.CourseId
                                 where c.CourseId== CatagoryId
                                 select new
                                 {

                                     c.QuestionContent,
                                     c.QuestionId,
                                     c.DateTime,
                                     c.CourseId,
                                     q.CourseName,                              
                                     IsSelected = false,
                                     QuestionOptions = db.QuestionOptionsTbs.Where(x => x.QuestionId == c.QuestionId).ToList(),


                                 }).OrderBy(x => x.QuestionContent).ToList();
                    
         
                    return Json(Query);
                }
            }
            catch (Exception ex)
            {
                Query = ex.ToString();
            }
            return Json(Query);

        }


        public string StripHTMLConvert(string html)
        {
            var regex = new Regex("<[^>]+>", RegexOptions.IgnoreCase);
            return System.Web.HttpUtility.HtmlDecode((regex.Replace(html, "")));
        }


        [HttpPost]
        [Route("api/Questions/SaveQuestions")]
        public String SaveQuestions([FromBody]QuestionMD value)
        {
            String ResponseMessage = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                int QuestionId = 1;
                var GetMaxNo = (from c in db.QuestionsTBs select c.QuestionId).ToList();
                if (GetMaxNo.Count > 0)
                {
                    QuestionId = 1 + int.Parse(GetMaxNo.Max().ToString());
                }
                QuestionsTB Qt = new QuestionsTB();
                Qt.QuestionContent = value.QuestionContent;        
                Qt.QuestionId = QuestionId;
                Qt.CourseId = value.CourseId;
                Qt.DateTime= TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                db.QuestionsTBs.Add(Qt);
                db.SaveChanges();

                // Save Question Options
                foreach (var q in value.QuestionOptionsList)
                {
                    QuestionOptionsTb Qto = new QuestionOptionsTb();
                    Qto.QuestionId = QuestionId;
                    Qto.Options = q.Options;
                    Qto.IsRightAns = q.IsRightAns;
                    
                    db.QuestionOptionsTbs.Add(Qto);
                    db.SaveChanges();
                }
                


                ResponseMessage = "Question Save Sucessfuly..!";
               
            }
            return ResponseMessage;
        }

        [HttpPut]
        [Route("api/Questions/EditQuestion")]
        public String EditQuestion([FromBody]QuestionMD value)
        {
            String ResponseMessage = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var UpdateQuery = db.QuestionsTBs.Where(x => x.QuestionId == value.QuestionId).ToList();
                if (UpdateQuery.Count > 0)
                {
                    UpdateQuery[0].QuestionContent = value.QuestionContent;
                    UpdateQuery[0].CourseId = value.CourseId;
              
                    db.SaveChanges();
                    ResponseMessage = "Question Updated Sucessfuly..!";
                    //Delete Already Save Options
                    var OptionsQuery = db.QuestionOptionsTbs.Where(x => x.QuestionId == value.QuestionId).ToList();
                    if (OptionsQuery.Count > 0)
                    {
                        foreach (var d in OptionsQuery)
                        {
                            var DeleteOption = db.QuestionOptionsTbs.Where(x => x.QuestionId == d.QuestionId).FirstOrDefault();
                            db.QuestionOptionsTbs.Remove(DeleteOption);
                            db.SaveChanges();
                        }
                        
                    }

                    //save Question Option
                    foreach (var q in value.QuestionOptionsList)
                    {
                        QuestionOptionsTb Qto = new QuestionOptionsTb();
                        Qto.QuestionId = value.QuestionId;
                        Qto.Options = q.Options;
                        Qto.IsRightAns = q.IsRightAns;
                      
                        db.QuestionOptionsTbs.Add(Qto);
                        db.SaveChanges();
                    }
                }
          
               

            }
            return ResponseMessage;
        }

        [HttpGet]
        [Route("api/Questions/DeleteQuestion/{id}")]
        public String DeleteQuestion(int id)
        {
            String ResponseMessage = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.QuestionsTBs.Where(x => x.QuestionId == id).ToList();
                if (Query.Count > 0)
                {
                    var DeleteQuery = db.QuestionsTBs.Where(x => x.QuestionId == id).FirstOrDefault();
                    db.QuestionsTBs.Remove(DeleteQuery);
                    db.SaveChanges();
                    var OptionsQuery = db.QuestionOptionsTbs.Where(x => x.QuestionId == id).ToList();
                    if (OptionsQuery.Count > 0)
                    {
                        foreach (var d in OptionsQuery)
                        {
                            var DeleteOption = db.QuestionOptionsTbs.Where(x => x.QuestionId == d.QuestionId).FirstOrDefault();
                            db.QuestionOptionsTbs.Remove(DeleteOption);
                            db.SaveChanges();
                        }

                    }
                    ResponseMessage = "Question Deleted Sucessfuly..!";
                }



            }
            return ResponseMessage;
        }
        [HttpPost]
        [Route("api/Questions/DeleteMultipleQuestions")]
        public String DeleteMultipleQuestions([FromBody]QuestionDeleteMD value)
        {
            string MessageReponse = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                foreach (var q in value.QuestionList)
                {
                    var Query = db.QuestionsTBs.Where(x => x.QuestionId == q.QuestionId).FirstOrDefault();
                    db.QuestionsTBs.Remove(Query);
                    db.SaveChanges();

                    //delete option of query
                    var Options = db.QuestionOptionsTbs.Where(x => x.QuestionId == q.QuestionId).ToList();
                    if (Options.Count > 0)
                    {
                        foreach (var d in Options)
                        {
                            var DeleteOptions = db.QuestionOptionsTbs.Where(x => x.QuestionJobOptionId == d.QuestionJobOptionId).FirstOrDefault();
                            db.QuestionOptionsTbs.Remove(DeleteOptions);
                            db.SaveChanges();
                        }
                            
                        
                    }
                }
               return MessageReponse = value.QuestionList.Count().ToString() + " Record deleted..!";
            }
        }

        [HttpDelete]
        [Route("api/Questions/DeleteQuestionOption/{id},{OpId}")]
        public String DeleteQuestionOption(int id, int OpId)
        {
            String ResponseMessage = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = db.QuestionOptionsTbs.Where(x => x.QuestionId == id && x.QuestionId == OpId).ToList();
                if (Query.Count > 0)
                {
                    var DeleteQuery = db.QuestionOptionsTbs.Where(x => x.QuestionId == id && x.QuestionId == OpId).FirstOrDefault();
                    db.QuestionOptionsTbs.Remove(DeleteQuery);
                    db.SaveChanges();

                    ResponseMessage = "Question Option Deleted Sucessfuly..!";
                }



            }
            return ResponseMessage;
        }
        public string StripHTML(string html)
        {
            var regex = new Regex("<[^>]+>", RegexOptions.IgnoreCase);
            return System.Web.HttpUtility.HtmlDecode((regex.Replace(html, "")));
        }
        [HttpGet]
        [Route("api/Questions/ExportQuestion/{CourseId}")]
        public HttpResponseMessage ExportQuestion(int CourseId)
        {
            DataTable dt = new DataTable();
            var result = new HttpResponseMessage();
            HttpResponseMessage httpResponseMessage = Request.CreateResponse(HttpStatusCode.OK);



            dt.Columns.Add("QuestionId", typeof(int));
            dt.Columns.Add("CourseId");
            dt.Columns.Add("Course Name");       
            dt.Columns.Add("QuestionContent");
            dt.Columns.Add("DateTime"); 
            dt.Columns.Add("RightOption");
          
            dt.Columns.Add("Option1");
            dt.Columns.Add("Option2");
            dt.Columns.Add("Option3");
            dt.Columns.Add("Option4");
            dt.Columns.Add("Option5");
            dt.Columns.Add("Option6");
            dt.Columns.Add("Option7");
            dt.Columns.Add("Option8");
            dt.Columns.Add("Option9");
            dt.Columns.Add("RightOptionNo");



            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var Query = (from c in db.QuestionsTBs
                             join q in db.CourseTbs on c.CourseId equals q.CourseId
                             where c.CourseId== CourseId
                             select new
                             {
                                 c.QuestionContent,
                                 c.QuestionId,
                                 c.DateTime,
                                 q.CourseName,
                                c.CourseId,
                           
                                 QuestionOptions = db.QuestionOptionsTbs.Where(x => x.QuestionId == c.QuestionId).ToList()
                             }).OrderByDescending(x => x.QuestionId).ToList();

                foreach (var q in Query)
                {
                    string RightOptions = "";
                    string Options = q.QuestionOptions.Where(x => x.QuestionId == q.QuestionId && x.IsRightAns == true).Select(x => x.Options).FirstOrDefault();
                    if (Options != null)
                    {
                        RightOptions = StripHTML(Options);
                    }
                    dt.Rows.Add(q.QuestionId, q.CourseId, q.CourseName, StripHTML(q.QuestionContent), q.DateTime, RightOptions

                                );
                    foreach (DataRow dr in dt.Rows) // search whole table
                    {
                        if (int.Parse(dr["QuestionId"].ToString()) == q.QuestionId) // if id==2
                        {
                            int counter = 1;
                            foreach (var m in q.QuestionOptions)
                            {

                                
                                dr["Option"+ counter] =StripHTML( m.Options);
                                if (m.IsRightAns == true)
                                {
                                    dr["RightOptionNo"] = counter;
                                }
                                
                                
                                counter = counter + 1;
                            }
                            
                            //change the name
                                                        //break; break or not depending on you
                        }
                    }
                }


                using (XLWorkbook wb = new XLWorkbook())
                {
                    wb.Worksheets.Add(dt, "Question");
                    wb.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    wb.Style.Font.Bold = true;

                    byte[] buffer = new byte[4096];

                    // processing the stream.

                    using (MemoryStream memoryStream = new MemoryStream())
                    {
                        int count = 0;
                        do
                        {
                            wb.SaveAs(memoryStream);
                            memoryStream.Write(buffer, 0, count);
                            result = new HttpResponseMessage(HttpStatusCode.OK)
                            {
                                Content = new ByteArrayContent(memoryStream.ToArray())
                            };
                        } while (count != 0);
                    }
                    result.Content.Headers.ContentDisposition =
                        new System.Net.Http.Headers.ContentDispositionHeaderValue("attachment")
                        {
                            FileName = "Question.xlsx"
                        };
                    result.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");



                }
            }
           

            return result;




        }
        public bool ValidateIdentity(String CourseId, String RightOption)
        {
            bool IsValid = false;
            if (CourseId != "" && RightOption!="")
            {
                int CataId = int.Parse(CourseId);
               
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    bool CheckCourseId = db.CourseTbs.Where(x => x.CourseId == CataId).Any();
                    
                    if (CheckCourseId == true )
                    {
                        IsValid = true;
                    }

                }
                var isNumeric = int.TryParse(RightOption, out int n);
                if (isNumeric == false)
                {
                    IsValid = false;
                }
            }
            else
            {
                IsValid = false;
            }
            return IsValid;
            
        }

        [HttpPost]
        [Route("api/Questions/ImportQuestion")]
        public async Task<string> ImportQuestion()
        {
            string ResponseMessage = "";
            DataTable dt = new DataTable();
            HttpPostedFileBase fileBase=null;
            try
            {
                HttpResponseMessage response = new HttpResponseMessage();
                var httpRequest = HttpContext.Current.Request;
                if (httpRequest.Files.Count > 0)
                {
               
                    IExcelDataReader excelReader = null;
                    var provider = new MultipartMemoryStreamProvider();
                    await Request.Content.ReadAsMultipartAsync(provider);

                    // extract file name and file contents
                    Stream stream = new MemoryStream(await provider.Contents[0].ReadAsByteArrayAsync());

                    //get fileName
                    var filename = provider.Contents[0].Headers.ContentDisposition.FileName.Replace("\"", string.Empty);

                    //Check file type

                    if (filename.EndsWith(".xls"))
                    {
                        excelReader = ExcelReaderFactory.CreateBinaryReader(stream);
                    }

                    else if (filename.EndsWith(".xlsx"))
                    {
                        excelReader = ExcelReaderFactory.CreateOpenXmlReader(stream);
                    }
                    else
                    {
                        return "Not Valid";
                    }
                    using (var rdr = ExcelReaderFactory.CreateOpenXmlReader(stream))
                    {
                        var conf = new ExcelDataSetConfiguration()
                        {
                            ConfigureDataTable = (tableReader) => new ExcelDataTableConfiguration()
                            {
                                UseHeaderRow = true //THIS IS WHAT YOU ARE AFTER
                            }
                        };

                        var ds = rdr.AsDataSet(conf); //THIS IS WHERE IT IS USED
                        var dataSet = excelReader.AsDataSet(conf);
                        dt= dataSet.Tables[0];
                    }
                    
                        if (dt.Rows.Count > 0)
                        {
                            int Counter = 0;
                            //foreach (DataRow objDataRow in dt.Rows)
                            //{
                            //}
                            for (int i = 0; i < dt.Rows.Count; i++)
                            {
                                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                                {
                                    bool IsValid=ValidateIdentity(dt.Rows[i]["CourseId"].ToString().Trim(), dt.Rows[i]["RightOption"].ToString().Trim());
                                    if (IsValid == true)
                                    {
                                        int QuestionId = 1;
                                        var GetMaxNo = (from c in db.QuestionsTBs select c.QuestionId).ToList();
                                        if (GetMaxNo.Count > 0)
                                        {
                                            QuestionId = 1 + int.Parse(GetMaxNo.Max().ToString());
                                        }
                                        QuestionsTB Qt = new QuestionsTB();
                                        Qt.QuestionContent = dt.Rows[i]["QuestionContent"].ToString();
                                        Qt.CourseId = int.Parse(dt.Rows[i]["CourseId"].ToString());
                                       
                                        Qt.QuestionId = QuestionId;
                                  
                                        Qt.DateTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                                        db.QuestionsTBs.Add(Qt);
                                        db.SaveChanges();
                                        Counter++;
                                        // Save Question Options
                                        for (int k = 1; k < 5; k++)
                                        {
                                            QuestionOptionsTb Qto = new QuestionOptionsTb();
                                            Qto.QuestionId = QuestionId;
                                            var name = dt.Rows[i]["RightOption"].ToString();
                                            Qto.Options = dt.Rows[i]["Option" + k].ToString();
                                            if (int.Parse(dt.Rows[i]["RightOption"].ToString()) == k)
                                            {
                                                Qto.IsRightAns = true;
                                            }
                                            else
                                            {
                                                Qto.IsRightAns = false;
                                            }


                                            db.QuestionOptionsTbs.Add(Qto);
                                            db.SaveChanges();
                                        }
                                    }
                                    else
                                    {

                                    }
                                    ResponseMessage = Counter.ToString()+" Question Save Sucessfuly..!";

                                }
                            }

                        }
                        
                    //result = Request.CreateResponse(HttpStatusCode.Created, docfiles);
                }
                else
                {
                    // result = Request.CreateResponse(HttpStatusCode.BadRequest);
                }
            }
            catch (Exception ex)
            {
                ResponseMessage = ex.ToString();
            }
            return ResponseMessage;

        }

        [HttpGet]
        [Route("api/Questions/DownloadQuestionModel/{filename}")]
        public HttpResponseMessage DownloadQuestionModel(string filename)
            {
            var path = System.Web.HttpContext.Current.Server.MapPath("~/ExcelFormate/"+filename+".xlsx"); ;
            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            var stream = new FileStream(path, FileMode.Open);
            result.Content = new StreamContent(stream);
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
            result.Content.Headers.ContentDisposition.FileName = Path.GetFileName(path);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            result.Content.Headers.ContentLength = stream.Length;
            return result;
        }


        [HttpGet]
        [Route("api/Questions/TakeExercise/{start},{end},{courseid}")]
        public IHttpActionResult TakeExercise(int start, int end, int courseid)
        {
            DataTable dt = new DataTable();
          
            dt.Columns.Add("QuestionId", typeof(int));
            dt.Columns.Add("QuestionContent");
            dt.Columns.Add("RightOption");
            dt.Columns.Add("Option1");
            dt.Columns.Add("Option2");
            dt.Columns.Add("Option3");
            dt.Columns.Add("Option4");
            dt.Columns.Add("isSelected");
            dt.Columns.Add("TestStartTime", typeof(DateTime));
            dt.Columns.Add("Duration", typeof(int));
            dt.Columns.Add("Answer");

            var QuestionQuery = (dynamic)null;
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                if (start > 0)
                {
                    start = start - 1;
                }
                db.Database.CommandTimeout =  60 * 3;
                QuestionQuery = (from c in db.QuestionsTBs
                                 where c.CourseId == courseid
                                 select new
                                 {
                                     QuestionId = c.QuestionId,
                                     QuestionOptions = db.QuestionOptionsTbs.Where(x => x.QuestionId == c.QuestionId).ToList(),
                                     QuestionContent = c.QuestionContent
                                 }).OrderBy(x => x.QuestionId).Take(end).Skip(start).ToList();

  

                    int RowIndex = 0;

                    foreach (var q in QuestionQuery)
                    {
                        int OpIndex = 1;
                        dt.Rows.Add(q.QuestionId, q.QuestionContent);
                        foreach (var w in q.QuestionOptions)
                        {
                            dt.Rows[RowIndex]["Option" + (OpIndex)] = w.Options;
                                   
                         
                            if (w.IsRightAns == true)
                            {
                                dt.Rows[RowIndex]["RightOption"] = OpIndex;
                            }
                            OpIndex++;
                        }
                        RowIndex++;

                    }
                    return Json(dt);

            }

        }
    }
}
