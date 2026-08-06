using ClosedXML.Excel;
using EMCQWebApi.Models;
using ExcelDataReader;
using MdLabScience.DbContext;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace MdLabScience.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class QuestionsController : ControllerBase
    {
        private static TimeZoneInfo Pakistan_Standard_Time = TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");
        private readonly IWebHostEnvironment _env;

        public QuestionsController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpGet]
        [Route("api/Questions/GetAllQuestions/{CourseId}")]
        public IActionResult GetAllQuestions(int CourseId)
        {
            var Query = (dynamic)null;
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    Query = (from c in db.QuestionsTBs
                             join q in db.CourseTbs on c.CourseId equals q.CourseId
                             where c.CourseId == CourseId
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
                    return Ok(Query);
                }
            }
            catch (Exception ex)
            {
                Query = ex.ToString();
            }
            return Ok(Query);
        }

        [HttpGet]
        [Route("api/Questions/GetNextQuestion/{QuestionId}")]
        public IActionResult GetNextQuestion(int QuestionId)
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
                        IncrementQuestion = QuestionId + 1;
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
                    return Ok(Query);
                }
            }
            catch (Exception ex)
            {
                Query = ex.ToString();
            }
            return Ok(Query);
        }

        [HttpGet]
        [Route("api/Questions/GetLastQuestion/{QuestionId}")]
        public IActionResult GetLastQuestion(int QuestionId)
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
                    return Ok(Query);
                }
            }
            catch (Exception ex)
            {
                Query = ex.ToString();
            }
            return Ok(Query);
        }

        [HttpGet]
        [Route("api/Questions/GetQuestionById/{QuestionId}")]
        public IActionResult GetQuestionById(int QuestionId)
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
                    return Ok(Query);
                }
            }
            catch (Exception ex)
            {
                Query = ex.ToString();
            }
            return Ok(Query);
        }

        [HttpGet]
        [Route("api/Questions/FilterQuestions/{CatagoryId},{SubCatagorId}")]
        public IActionResult FilterQuestions(int CatagoryId, int SubCatagorId)
        {
            var Query = (dynamic)null;
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    Query = (from c in db.QuestionsTBs
                             join q in db.CourseTbs on c.CourseId equals q.CourseId
                             where c.CourseId == CatagoryId
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
                    return Ok(Query);
                }
            }
            catch (Exception ex)
            {
                Query = ex.ToString();
            }
            return Ok(Query);
        }

        [NonAction]
        public string StripHTMLConvert(string html)
        {
            var regex = new Regex("<[^>]+>", RegexOptions.IgnoreCase);
            return System.Net.WebUtility.HtmlDecode(regex.Replace(html, ""));
        }

        [HttpPost]
        [Route("api/Questions/SaveQuestions")]
        public String SaveQuestions([FromBody] QuestionMD value)
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
                Qt.DateTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                db.QuestionsTBs.Add(Qt);
                db.SaveChanges();

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
        public String EditQuestion([FromBody] QuestionMD value)
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
        public String DeleteMultipleQuestions([FromBody] QuestionDeleteMD value)
        {
            string MessageReponse = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                foreach (var q in value.QuestionList)
                {
                    var Query = db.QuestionsTBs.Where(x => x.QuestionId == q.QuestionId).FirstOrDefault();
                    db.QuestionsTBs.Remove(Query);
                    db.SaveChanges();

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

        [NonAction]
        public string StripHTML(string html)
        {
            var regex = new Regex("<[^>]+>", RegexOptions.IgnoreCase);
            return System.Net.WebUtility.HtmlDecode(regex.Replace(html, ""));
        }

        [HttpGet]
        [Route("api/Questions/ExportQuestion/{CourseId}")]
        public IActionResult ExportQuestion(int CourseId)
        {
            DataTable dt = new DataTable();

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
                             where c.CourseId == CourseId
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
                    dt.Rows.Add(q.QuestionId, q.CourseId, q.CourseName, StripHTML(q.QuestionContent), q.DateTime, RightOptions);

                    foreach (DataRow dr in dt.Rows)
                    {
                        if (int.Parse(dr["QuestionId"].ToString()) == q.QuestionId)
                        {
                            int counter = 1;
                            foreach (var m in q.QuestionOptions)
                            {
                                dr["Option" + counter] = StripHTML(m.Options);
                                if (m.IsRightAns == true)
                                {
                                    dr["RightOptionNo"] = counter;
                                }
                                counter = counter + 1;
                            }
                        }
                    }
                }

                using (XLWorkbook wb = new XLWorkbook())
                {
                    wb.Worksheets.Add(dt, "Question");
                    wb.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    wb.Style.Font.Bold = true;

                    using (MemoryStream memoryStream = new MemoryStream())
                    {
                        wb.SaveAs(memoryStream);
                        memoryStream.Seek(0, SeekOrigin.Begin);
                        byte[] buffer = memoryStream.ToArray();
                        return File(buffer, "application/octet-stream", "Question.xlsx");
                    }
                }
            }
        }

        [NonAction]
        public bool ValidateIdentity(String CourseId, String RightOption)
        {
            bool IsValid = false;
            if (CourseId != "" && RightOption != "")
            {
                int CataId = int.Parse(CourseId);
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    bool CheckCourseId = db.CourseTbs.Where(x => x.CourseId == CataId).Any();
                    if (CheckCourseId == true)
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
            try
            {
                if (Request.Form.Files.Count > 0)
                {
                    IExcelDataReader excelReader = null;
                    var file = Request.Form.Files[0];
                    var filename = file.FileName;

                    using (var stream = file.OpenReadStream())
                    {
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
                                    UseHeaderRow = true
                                }
                            };

                            var dataSet = excelReader.AsDataSet(conf);
                            dt = dataSet.Tables[0];
                        }
                    }

                    if (dt.Rows.Count > 0)
                    {
                        int Counter = 0;
                        for (int i = 0; i < dt.Rows.Count; i++)
                        {
                            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                            {
                                bool IsValid = ValidateIdentity(dt.Rows[i]["CourseId"].ToString().Trim(), dt.Rows[i]["RightOption"].ToString().Trim());
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
                                    for (int k = 1; k < 5; k++)
                                    {
                                        QuestionOptionsTb Qto = new QuestionOptionsTb();
                                        Qto.QuestionId = QuestionId;
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
                                ResponseMessage = Counter.ToString() + " Question Save Sucessfuly..!";
                            }
                        }
                    }
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
        public IActionResult DownloadQuestionModel(string filename)
        {
            var path = Path.Combine(_env.ContentRootPath, "ExcelFormate", filename + ".xlsx");
            var stream = new FileStream(path, FileMode.Open, FileAccess.Read);
            return File(stream, "application/octet-stream", Path.GetFileName(path));
        }

        [HttpGet]
        [Route("api/Questions/TakeExercise/{start},{end},{courseid}")]
        public IActionResult TakeExercise(int start, int end, int courseid)
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
                db.Database.SetCommandTimeout(TimeSpan.FromSeconds(180));
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
                return Ok(dt);
            }
        }
    }
}
