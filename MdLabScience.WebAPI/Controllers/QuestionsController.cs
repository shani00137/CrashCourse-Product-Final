using ClosedXML.Excel;
using Docnet.Core;
using Docnet.Core.Models;
using Docnet.Core.Readers;
using EMCQWebApi.Models;
using ExcelDataReader;
using MdLabScience.DbContext;
using MdLabScience.Models;
using MdLabScience.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenAI.Chat;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Net.Http.Headers;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
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
        private readonly IConfiguration _configuration;

        public QuestionsController(IWebHostEnvironment env, IConfiguration configuration)
        {
            _env = env;
            _configuration = configuration;
        }

        [HttpPost]
        [Route("api/Questions/GetAllQuestions")]
        public IActionResult GetAllQuestions([FromBody] PaginationFilter filter)
        {
            try
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var filtered = (from c in db.QuestionsTBs
                                    where (filter.CourseId == null || c.CourseId == filter.CourseId)
                                          && (string.IsNullOrEmpty(filter.SearchTerm) || c.QuestionContent.Contains(filter.SearchTerm))
                                    select c);

                    var totalRecords = filtered.Count();

                    var pagedQuestionIds = filtered.AsNoTracking()
                        .OrderBy(c => c.QuestionId)
                        .Select(c => c.QuestionId)
                        .Skip((filter.PageNumber - 1) * filter.PageSize)
                        .Take(filter.PageSize)
                        .ToList();

                    var rows = (from c in db.QuestionsTBs.AsNoTracking()
                                join q in db.CourseTbs.AsNoTracking() on c.CourseId equals q.CourseId
                                where pagedQuestionIds.Contains(c.QuestionId)
                                select new
                                {
                                    c.QuestionContent,
                                    c.QuestionId,
                                    c.DateTime,
                                    c.CourseId,
                                    q.CourseName
                                }).OrderBy(x => x.QuestionId).ToList();

                    var options = db.QuestionOptionsTbs.AsNoTracking()
                        .Where(o => o.QuestionId != null && pagedQuestionIds.Contains(o.QuestionId.Value))
                        .ToList();

                    var Query = rows.Select(r => new
                    {
                        r.QuestionContent,
                        r.QuestionId,
                        r.DateTime,
                        r.CourseId,
                        r.CourseName,
                        IsSelected = false,
                        QuestionOptions = options.Where(o => o.QuestionId == r.QuestionId).ToList()
                    }).ToList();

                    return Ok(new PagedResponse<List<object>>(Query.Cast<object>().ToList(), filter.PageNumber, filter.PageSize, totalRecords));
                }
            }
            catch (Exception ex)
            {
                return Ok(ex.ToString());
            }
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

        [HttpPost]
        [Route("api/Questions/OcrPdf")]
        public async Task<IActionResult> OcrPdf([FromBody] PdfOcrRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request?.ImageBase64))
                {
                    return BadRequest("ImageBase64 is required.");
                }

                byte[] imageBytes;
                try
                {
                    imageBytes = Convert.FromBase64String(request.ImageBase64);
                }
                catch (Exception bex)
                {
                    return BadRequest("ImageBase64 is not valid base64 data: " + bex.Message);
                }

                if (imageBytes.Length == 0)
                {
                    return BadRequest("ImageBase64 is empty.");
                }

                string serviceUrl = _configuration["Ocr:ServiceUrl"] ?? "http://localhost:5100/ocr";
                string fileName = (string.IsNullOrWhiteSpace(request.FileName) ? "page" : System.IO.Path.GetFileNameWithoutExtension(request.FileName))
                                  + ".png";

                using (var httpClient = new HttpClient())
                {
                    httpClient.Timeout = TimeSpan.FromMinutes(20);

                    using (var content = new MultipartFormDataContent())
                    using (var fileStream = new MemoryStream(imageBytes))
                    {
                        var fileContent = new StreamContent(fileStream);
                        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");
                        content.Add(fileContent, "file", fileName);

                        HttpResponseMessage response;
                        try
                        {
                            response = await httpClient.PostAsync(serviceUrl, content);
                        }
                        catch (Exception httpEx)
                        {
                            Console.WriteLine($"[OcrPdf:Remote] {httpEx}");
                            return Ok(new PdfOcrResponse()
                            {
                                Succeeded = false,
                                Message = "Could not reach the OCR service at " + serviceUrl + ": " + httpEx.Message
                            });
                        }

                        string body = await response.Content.ReadAsStringAsync();

                        if (!response.IsSuccessStatusCode)
                        {
                            return Ok(new PdfOcrResponse()
                            {
                                Succeeded = false,
                                Message = "OCR service returned error (" + (int)response.StatusCode + "): " + body
                            });
                        }

                        var ocrResult = System.Text.Json.JsonSerializer.Deserialize<PdfOcrRemoteResult>(body,
                            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                        string text = ocrResult?.Text ?? string.Empty;

                        return Ok(new PdfOcrResponse()
                        {
                            Succeeded = true,
                            Message = "OCR completed successfully.",
                            FullText = text,
                            Pages = new List<PdfOcrPageResult>()
                            {
                                new PdfOcrPageResult()
                                {
                                    PageNumber = 1,
                                    Width = 0,
                                    Height = 0,
                                    Text = text
                                }
                            }
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[OcrPdf] {ex}");
                return Ok(new PdfOcrResponse()
                {
                    Succeeded = false,
                    Message = "OCR failed: " + ex.Message
                });
            }
        }
        
        

        [HttpPost]
        [Route("api/Questions/ParseOcrToQuestions")]
        public async Task<IActionResult> ParseOcrToQuestions([FromBody] ParseOcrRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request?.OcrText))
                {
                    return BadRequest("OcrText is required.");
                }

                string apiKey = _configuration["OpenAI:ApiKey1"];
                string model = _configuration["OpenAI:Model"] ?? "gpt-4o";
                if (string.IsNullOrEmpty(apiKey))
                {
                    return Ok(new ParseOcrResponse()
                    {
                        Succeeded = false,
                        Message = "OpenAI ApiKey is not configured."
                    });
                }

                ChatClient client = new ChatClient(model, apiKey);

                string prompt = @"You are an expert exam question parser. Given the OCR text extracted from a PDF exam page, parse it into structured MCQ questions.

Rules:
1. Sort questions in their original order (Q1, Q2, Q3...).
2. Each question has exactly 4 options (A, B, C, D).
3. Mark exactly one option as the correct answer (correctIndex: 0=A, 1=B, 2=C, 3=D).
4. Add a brief explanation for the correct answer (max 200 words).
5. Preserve the original question text and option text as closely as possible.
6. If the OCR text is messy, clean up obvious OCR errors but keep the original meaning.
7. Return ONLY valid JSON, no commentary.

Return a JSON array with this exact structure:
[
  {
    ""questionContent"": ""question text here"",
    ""options"": [
      { ""text"": ""option A text"" },
      { ""text"": ""option B text"" },
      { ""text"": ""option C text"" },
      { ""text"": ""option D text"" }
    ],
    ""correctIndex"": 0,
    ""explanation"": ""brief explanation of the correct answer""
  }
]

OCR Text:
" + request.OcrText;

                ChatCompletion completion = await client.CompleteChatAsync(new UserChatMessage(prompt));
                string responseText = string.Join("", completion.Content.Select(c => c.Text));

                responseText = responseText.Trim();
                if (responseText.StartsWith("```"))
                {
                    responseText = responseText.Substring(responseText.IndexOf('\n') + 1);
                    if (responseText.EndsWith("```"))
                    {
                        responseText = responseText.Substring(0, responseText.LastIndexOf("```"));
                    }
                    responseText = responseText.Trim();
                }

                var questions = System.Text.Json.JsonSerializer.Deserialize<List<ParsedQuestionItem>>(responseText,
                    new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                return Ok(new ParseOcrResponse()
                {
                    Succeeded = true,
                    Questions = questions ?? new List<ParsedQuestionItem>()
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ParseOcrToQuestions] {ex}");
                return Ok(new ParseOcrResponse()
                {
                    Succeeded = false,
                    Message = "Failed to parse questions: " + ex.Message
                });
            }
        }

        [HttpPost]
        [Route("api/Questions/BulkSaveQuestions")]
        public IActionResult BulkSaveQuestions([FromBody] BulkSaveRequest request)
        {
            try
            {
                if (request?.Questions == null || request.Questions.Count == 0)
                {
                    return BadRequest("No questions to save.");
                }

                int savedCount = 0;
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    foreach (var q in request.Questions)
                    {
                        var GetMaxNo = (from c in db.QuestionsTBs select c.QuestionId).ToList();
                        int QuestionId = 1;
                        if (GetMaxNo.Count > 0)
                        {
                            QuestionId = 1 + int.Parse(GetMaxNo.Max().ToString());
                        }

                        QuestionsTB Qt = new QuestionsTB();
                        Qt.QuestionContent = q.QuestionContent;
                        Qt.QuestionId = QuestionId;
                        Qt.CourseId = request.CourseId;
                        Qt.DateTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                        db.QuestionsTBs.Add(Qt);
                        db.SaveChanges();

                        if (q.QuestionOptionsList != null)
                        {
                            foreach (var opt in q.QuestionOptionsList)
                            {
                                QuestionOptionsTb Qto = new QuestionOptionsTb();
                                Qto.QuestionId = QuestionId;
                                Qto.Options = opt.Options;
                                Qto.IsRightAns = opt.IsRightAns;
                                db.QuestionOptionsTbs.Add(Qto);
                                db.SaveChanges();
                            }
                        }
                        savedCount++;
                    }
                }

                return Ok($"Successfully saved {savedCount} questions.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[BulkSaveQuestions] {ex}");
                return StatusCode(500, "Failed to save questions: " + ex.Message);
            }
        }

        [HttpPost]
        [Route("api/Questions/GenerateAiQuestions")]
        public async Task<IActionResult> GenerateAiQuestions([FromBody] GenerateAiRequest request)
        {
            try
            {
                if (request == null || request.CourseId <= 0)
                {
                    return BadRequest("CourseId is required.");
                }

                int count = Math.Clamp(request.Count, 1, 50);
                string difficulty = string.IsNullOrWhiteSpace(request.Difficulty) ? "Medium" : request.Difficulty;
                string courseName = "";
                string existingQuestionsJson = "";

                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var course = db.CourseTbs.FirstOrDefault(c => c.CourseId == request.CourseId);
                    if (course == null)
                    {
                        return BadRequest("Course not found.");
                    }
                    courseName = course.CourseName ?? "";

                    if (request.UseDatabase)
                    {
                        var dbQuestions = (from q in db.QuestionsTBs
                                           where q.CourseId == request.CourseId
                                           select new
                                           {
                                               q.QuestionContent,
                                               Options = db.QuestionOptionsTbs
                                                   .Where(o => o.QuestionId == q.QuestionId)
                                                   .Select(o => new { o.Options, o.IsRightAns })
                                                   .ToList()
                                           })
                                           .OrderBy(x => Guid.NewGuid())
                                           .Take(100)
                                           .ToList();

                        if (dbQuestions.Count > 0)
                        {
                            var sampleList = dbQuestions.Select(q => new
                            {
                                question = StripHTML(q.QuestionContent),
                                options = q.Options.Select(o => new
                                {
                                    text = StripHTML(o.Options),
                                    isCorrect = o.IsRightAns == true
                                }).ToList()
                            }).ToList();

                            existingQuestionsJson = System.Text.Json.JsonSerializer.Serialize(sampleList,
                                new System.Text.Json.JsonSerializerOptions { WriteIndented = false });
                        }
                    }
                }

                string apiKey = _configuration["OpenAI:ApiKey1"];
                string model = _configuration["OpenAI:Model"] ?? "gpt-4o";
                if (string.IsNullOrEmpty(apiKey))
                {
                    return Ok(new GenerateAiResponse()
                    {
                        Succeeded = false,
                        Message = "OpenAI ApiKey is not configured."
                    });
                }

                string dbSection = "";
                if (!string.IsNullOrEmpty(existingQuestionsJson))
                {
                    dbSection = $@"

Here are existing questions from the course database for reference. Use them as inspiration for topic coverage and style, but generate NEW and DIFFERENT questions — do NOT duplicate these:

{existingQuestionsJson}";
                }

                string customSection = "";
                if (!string.IsNullOrWhiteSpace(request.Prompt))
                {
                    customSection = $@"

Additional instructions from the user: {request.Prompt}";
                }

                string prompt = $@"You are an expert exam question writer for the course: ""{courseName}"".

Generate exactly {count} multiple-choice questions at **{difficulty}** difficulty level.

Rules:
1. Each question must have exactly 4 options (A, B, C, D).
2. Mark exactly one option as the correct answer (correctIndex: 0=A, 1=B, 2=C, 3=D).
3. Add a brief explanation for the correct answer (max 150 words).
4. Questions should be clear, unambiguous, and professionally written.
5. Vary the topics to provide good coverage of the subject matter.
6. Do NOT repeat or closely paraphrase the same question.
7. Return ONLY valid JSON, no commentary.{dbSection}{customSection}

Return a JSON array with this exact structure:
[
  {{
    ""questionContent"": ""question text here"",
    ""options"": [
      {{ ""text"": ""option A text"" }},
      {{ ""text"": ""option B text"" }},
      {{ ""text"": ""option C text"" }},
      {{ ""text"": ""option D text"" }}
    ],
    ""correctIndex"": 0,
    ""explanation"": ""brief explanation of the correct answer""
  }}
]";

                ChatClient client = new ChatClient(model, apiKey);

                ChatCompletion completion = await client.CompleteChatAsync(new UserChatMessage(prompt));
                string responseText = string.Join("", completion.Content.Select(c => c.Text));

                responseText = responseText.Trim();
                if (responseText.StartsWith("```"))
                {
                    responseText = responseText.Substring(responseText.IndexOf('\n') + 1);
                    if (responseText.EndsWith("```"))
                    {
                        responseText = responseText.Substring(0, responseText.LastIndexOf("```"));
                    }
                    responseText = responseText.Trim();
                }

                var questions = System.Text.Json.JsonSerializer.Deserialize<List<GenerateAiQuestionItem>>(responseText,
                    new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                return Ok(new GenerateAiResponse()
                {
                    Succeeded = true,
                    Questions = questions ?? new List<GenerateAiQuestionItem>()
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GenerateAiQuestions] {ex}");
                return Ok(new GenerateAiResponse()
                {
                    Succeeded = false,
                    Message = "AI generation failed: " + ex.Message
                });
            }
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
        [AllowAnonymous]
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
