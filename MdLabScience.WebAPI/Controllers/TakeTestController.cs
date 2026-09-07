using EMCQWebApi.Models;
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
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace MdLabScience.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TakeTestController : ControllerBase
    {
        private static object Lock = new object();
        private static TimeZoneInfo Pakistan_Standard_Time = TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");
        private readonly IConfiguration _configuration;

        public TakeTestController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost]
        [Route("api/TakeTest/PrepareTest")]
        public IActionResult PrepareTest([FromBody] AppUserTestModel value)
        {
            String _response = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                if (value.ApplicantId == null)
                {
                    value.ApplicantId = new List<int>();
                }
                var QuestionCount = db.QuestionsTBs.Where(x => x.CourseId == value.CourseId).Count();
                if (QuestionCount >= value.Questions)
                {
                    if (value.ApplicantId.Any())
                    {
                        foreach (var q in value.ApplicantId)
                        {
                            int TestId = 1;
                            var GetMaxNo = db.AppUserTestTbs.OrderByDescending(x => x.TestRecordId).Select(x => x.TestId).FirstOrDefault();
                            if (GetMaxNo != 0)
                            {
                                TestId += GetMaxNo;
                            }
                            AppUserTestTb appUserTest = new AppUserTestTb();
                            appUserTest.TestId = TestId;
                            appUserTest.CourseId = value.CourseId;
                            appUserTest.ApplicantId = q;
                            appUserTest.CreatedDate = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                            appUserTest.IsCompleted = false;
                            appUserTest.Duration = value.Duration;
                            appUserTest.Questions = value.Questions;
                            appUserTest.CreatedBy = value.CreatedBy;
                            appUserTest.TestDate = value.TestDate;
                            db.AppUserTestTbs.Add(appUserTest);
                            db.SaveChanges();

                            var AppInformaiton = db.AppUserTbs.Where(x => x.ApplicantId == q).FirstOrDefault();
                            if (AppInformaiton != null)
                            {
                                String _message = "Dear Mr/Mrs " + AppInformaiton.UserName + "A new Exam has been generated for you, please check and take exam. best of luck..";
                                PushNotification.PushNotificationTOuser(AppInformaiton.Token, _message, "Exam Test.");
                            }
                            var RandomQuestions = db.QuestionsTBs.Where(x => x.CourseId == value.CourseId).OrderBy(x => Guid.NewGuid()).Take(value.Questions).ToList();
                            foreach (var m in RandomQuestions)
                            {
                                TestQuestionTb testQuestionTb = new TestQuestionTb();
                                testQuestionTb.QuestionContent = m.QuestionContent;
                                testQuestionTb.CourseId = m.CourseId;
                                testQuestionTb.QuestionId = m.QuestionId;
                                testQuestionTb.TestId = TestId;
                                db.TestQuestionTbs.Add(testQuestionTb);
                                db.SaveChanges();

                                var OptionListQuery = db.QuestionOptionsTbs.Where(x => x.QuestionId == m.QuestionId).ToList();
                                foreach (var d in OptionListQuery)
                                {
                                    TestQuestionOptionTb testQuestionOptionTb = new TestQuestionOptionTb();
                                    testQuestionOptionTb.Options = d.Options;
                                    testQuestionOptionTb.QuestionId = d.QuestionId;
                                    testQuestionOptionTb.IsRightAns = d.IsRightAns;
                                    testQuestionOptionTb.TestId = TestId;
                                    testQuestionOptionTb.Answer = null;
                                    testQuestionOptionTb.isSelected = 0;
                                    db.TestQuestionOptionTbs.Add(testQuestionOptionTb);
                                    db.SaveChanges();
                                }
                            }
                        }
                        _response = "Test Created Successfuly..";
                    }
                    else
                    {
                        var GetApplicantQuery = (from c in db.ApplicantsTbs
                                                 join d in db.ApplicantCourseSelectionTbs on c.ApplicantId equals d.ApplicantId
                                                 where c.IsActive == true && d.CourseId == value.CourseId
                                                 select new { c.ApplicantId }).ToList();
                        foreach (var q in GetApplicantQuery)
                        {
                            int TestId = 1;
                            var GetMaxNo = db.AppUserTestTbs.OrderByDescending(x => x.TestRecordId).Select(x => x.TestId).FirstOrDefault();
                            if (GetMaxNo != 0)
                            {
                                TestId += GetMaxNo;
                            }
                            AppUserTestTb appUserTest = new AppUserTestTb();
                            appUserTest.TestId = TestId;
                            appUserTest.ApplicantId = (int)q.ApplicantId;
                            appUserTest.CreatedDate = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                            appUserTest.IsCompleted = false;
                            appUserTest.CourseId = value.CourseId;
                            appUserTest.Questions = value.Questions;
                            appUserTest.Duration = value.Duration;
                            appUserTest.CreatedBy = value.CreatedBy;
                            appUserTest.TestDate = value.TestDate;
                            db.AppUserTestTbs.Add(appUserTest);
                            db.SaveChanges();
                            var AppInformaiton = db.AppUserTbs.Where(x => x.ApplicantId == q.ApplicantId).FirstOrDefault();
                            if (AppInformaiton != null)
                            {
                                String _message = "Dear Mr/Mrs " + AppInformaiton.UserName + "A new Exam has been generated for you, please check and take exam. best of luck..";
                                PushNotification.PushNotificationTOuser(AppInformaiton.Token, _message, "Exam Test.");
                            }
                            var RandomQuestions = db.QuestionsTBs.Where(x => x.CourseId == value.CourseId).OrderBy(x => Guid.NewGuid()).Take(value.Questions).ToList();
                            foreach (var m in RandomQuestions)
                            {
                                TestQuestionTb testQuestionTb = new TestQuestionTb();
                                testQuestionTb.QuestionContent = m.QuestionContent;
                                testQuestionTb.CourseId = m.CourseId;
                                testQuestionTb.QuestionId = m.QuestionId;
                                testQuestionTb.TestId = TestId;
                                db.TestQuestionTbs.Add(testQuestionTb);
                                db.SaveChanges();

                                var OptionListQuery = db.QuestionOptionsTbs.Where(x => x.QuestionId == m.QuestionId).ToList();
                                foreach (var d in OptionListQuery)
                                {
                                    TestQuestionOptionTb testQuestionOptionTb = new TestQuestionOptionTb();
                                    testQuestionOptionTb.Options = d.Options;
                                    testQuestionOptionTb.QuestionId = d.QuestionId;
                                    testQuestionOptionTb.IsRightAns = d.IsRightAns;
                                    testQuestionOptionTb.TestId = TestId;
                                    db.TestQuestionOptionTbs.Add(testQuestionOptionTb);
                                    db.SaveChanges();
                                }
                            }
                        }
                        _response = "Test Created Successfuly..";
                    }
                }
                else
                {
                    _response = "Selected Question Count not available in Question Bank..";
                }
            }
            return Ok(_response);
        }

        [HttpGet]
        [Route("api/TakeTest/GetTestHistory/{AppUserId}")]
        public IActionResult GetTestHistory(int AppUserId)
        {
            List<AppUserTestModel> list = new List<AppUserTestModel>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var QuestionQuery = (from c in db.AppUserTestTbs
                                     join d in db.CourseTbs on c.CourseId equals d.CourseId
                                     join a in db.AppUserTbs on c.ApplicantId equals a.ApplicantId
                                     where a.AppUserId == AppUserId
                                     select
                                     new
                                     {
                                         c.CreatedBy,
                                         d.CourseName,
                                         c.IsCompleted,
                                         c.TestDate,
                                         c.TestId,
                                         c.TestStartTime,
                                         c.Questions,
                                         c.Duration
                                     }
                           ).OrderByDescending(x => x.TestId).ToList();
                foreach (var q in QuestionQuery)
                {
                    if (q.TestStartTime.HasValue)
                    {
                        bool Status = AppUserValidation.CheckExamExpiry(Convert.ToDateTime(q.TestStartTime), q.Duration, q.IsCompleted);
                        list.Add(new AppUserTestModel
                        {
                            TestId = q.TestId,
                            Questions = q.Questions,
                            TestDate = q.TestDate,
                            CreatedBy = q.CreatedBy,
                            CourseName = q.CourseName,
                            IsCompleted = Status
                        });
                    }
                    else
                    {
                        list.Add(new AppUserTestModel
                        {
                            TestId = q.TestId,
                            Questions = q.Questions,
                            TestDate = q.TestDate,
                            CreatedBy = q.CreatedBy,
                            CourseName = q.CourseName,
                            IsCompleted = q.IsCompleted
                        });
                    }
                }
                return Ok(list);
            }
        }

        [HttpGet]
        [Route("api/TakeTest/GetAppUserTest")]
        public IActionResult GetAppUserTest(int page = 1, int pageSize = 20)
        {
            if (page < 1) page = 1;
            if (pageSize < 1) pageSize = 20;
            if (pageSize > 100) pageSize = 100;

            List<AppUserTestModel> list = new List<AppUserTestModel>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var BaseQuery = (from c in db.AppUserTestTbs
                                 join d in db.CourseTbs on c.CourseId equals d.CourseId
                                 join a in db.ApplicantsTbs on c.ApplicantId equals a.ApplicantId
                                 select
                                 new
                                 {
                                     c.CreatedBy,
                                     d.CourseName,
                                     c.IsCompleted,
                                     c.TestDate,
                                     c.TestId,
                                     c.Questions,
                                     c.Duration,
                                     a.FirstName,
                                     a.LastName,
                                     c.CreatedDate,
                                     c.TestStartTime,
                                     c.RightQuestions,
                                     c.Remarks,
                                 });

                int total = BaseQuery.Count();
                var QuestionQuery = BaseQuery
                                  .OrderByDescending(x => x.TestId)
                                  .Skip((page - 1) * pageSize)
                                  .Take(pageSize)
                                  .ToList();

                foreach (var q in QuestionQuery)
                {
                    int Percentage = 0;
                    if (q.IsCompleted == true && q.Questions > 0)
                    {
                        double value = ((double)(q.RightQuestions ?? 0) / (double)q.Questions);
                        double NetPercentage = value * 100;
                        Percentage = (int)NetPercentage;
                    }

                    if (q.TestStartTime.HasValue)
                    {
                        bool Status = AppUserValidation.CheckExamExpiry(Convert.ToDateTime(q.TestStartTime), q.Duration, q.IsCompleted);
                        list.Add(new AppUserTestModel
                        {
                            TestId = q.TestId,
                            Questions = q.Questions,
                            TestDate = q.TestDate,
                            CreatedBy = q.CreatedBy,
                            CourseName = q.CourseName,
                            IsCompleted = Status,
                            FirstName = q.FirstName,
                            LastName = q.LastName,
                            RightQuestions = q.RightQuestions,
                            Remarks = q.Remarks,
                            Percentage = Percentage
                        });
                    }
                    else
                    {
                        list.Add(new AppUserTestModel
                        {
                            TestId = q.TestId,
                            Questions = q.Questions,
                            TestDate = q.TestDate,
                            CreatedBy = q.CreatedBy,
                            CourseName = q.CourseName,
                            IsCompleted = q.IsCompleted,
                            FirstName = q.FirstName,
                            LastName = q.LastName,
                            RightQuestions = q.RightQuestions,
                            Remarks = q.Remarks,
                            Percentage = Percentage
                        });
                    }
                }
                return Ok(new { data = list, total = total, page = page, pageSize = pageSize });
            }
        }

        [HttpGet]
        [Route("api/TakeTest/GetUserTests/{AppUserId}")]
        public IActionResult GetUserTests(int AppUserId)
        {
            List<AppUserTestModel> list = new List<AppUserTestModel>();
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var QuestionQuery = (from c in db.AppUserTestTbs
                                     join d in db.CourseTbs on c.CourseId equals d.CourseId
                                     join a in db.AppUserTbs on c.ApplicantId equals a.ApplicantId
                                     where a.AppUserId == AppUserId
                                     select
                                     new
                                     {
                                         c.TestId,
                                         c.CourseId,
                                         d.CourseName,
                                         c.IsCompleted,
                                         c.TestDate,
                                         c.Questions,
                                         c.Duration,
                                         c.TestStartTime,
                                         c.RightQuestions,
                                         c.Remarks
                                     })
                                     .OrderByDescending(x => x.TestId)
                                     .ToList();

                foreach (var q in QuestionQuery)
                {
                    int Answered = db.TestQuestionOptionTbs.Count(x => x.TestId == q.TestId && x.isSelected == 1);
                    int Percentage = 0;
                    if (q.IsCompleted == true && q.Questions > 0)
                    {
                        double value = ((double)(q.RightQuestions ?? 0) / (double)q.Questions);
                        double NetPercentage = value * 100;
                        Percentage = (int)NetPercentage;
                    }

                    list.Add(new AppUserTestModel
                    {
                        TestId = q.TestId,
                        CourseId = q.CourseId,
                        CourseName = q.CourseName,
                        IsCompleted = q.IsCompleted,
                        TestDate = q.TestDate,
                        Questions = q.Questions,
                        Duration = q.Duration,
                        TestStartTime = q.TestStartTime,
                        RightQuestions = q.RightQuestions,
                        Remarks = q.Remarks,
                        Percentage = Percentage,
                        AnsweredQuestions = Answered
                    });
                }
                return Ok(list);
            }
        }

        [HttpGet]
        [Route("api/TakeTest/ConductTestByUser/{testId}")]
        public IActionResult ConductTestByUser(int testId)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var appUserTest = db.AppUserTestTbs.Where(x => x.TestId == testId).FirstOrDefault();
                if (appUserTest == null)
                {
                    return Ok(new { succeeded = false, message = "Test not found." });
                }

                if (appUserTest.TestStartTime == null)
                {
                    appUserTest.TestStartTime = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                    db.SaveChanges();
                }

                var QuestionsSql = @"
SELECT t.TestId, t.QuestionId, ISNULL(t.QuestionContent, '') AS QuestionContent
FROM TestQuestionTb t
WHERE t.TestId = {0}
ORDER BY t.QuestionId";
                var QuestionQuery = db.Database.SqlQueryRaw<ConductQuestionRow>(QuestionsSql, testId).ToList();

                var result = new List<object>();
                foreach (var item in QuestionQuery)
                {
                    int OpIndex = 1;
                    int RightOption = 0;
                    int IsSelected = 0;
                    string Answer = "";

                    var OptionSql = @"
SELECT o.TestId, o.QuestionId, o.TestQuestionOptionId,
       ISNULL(o.Options, '') AS [Options],
       ISNULL(o.Answer, '') AS [Answer],
       o.IsRightAns, o.isSelected
FROM TestQuestionOptionTb o
WHERE o.TestId = {0} AND o.QuestionId = {1}
ORDER BY o.TestQuestionOptionId";
                    var OptionQuery = db.Database.SqlQueryRaw<ConductOptionRow>(OptionSql, testId, item.QuestionId).ToList();

                    var options = new Dictionary<string, string>();
                    foreach (var w in OptionQuery)
                    {
                        string OptionText = StripHTML(w.Options);
                        options["Option" + OpIndex] = OptionText;
                        if (w.IsRightAns == true)
                        {
                            RightOption = OpIndex;
                        }
                        IsSelected = w.isSelected.HasValue && w.isSelected.Value > 0 ? w.isSelected.Value : IsSelected;
                        if (!string.IsNullOrEmpty(w.Answer))
                        {
                            Answer = w.Answer;
                        }
                        OpIndex++;
                    }

                    result.Add(new
                    {
                        TestId = testId,
                        QuestionId = item.QuestionId,
                        QuestionContent = StripHTML(item.QuestionContent),
                        RightOption,
                        Option1 = HasOption(options, "Option1"),
                        Option2 = HasOption(options, "Option2"),
                        Option3 = HasOption(options, "Option3"),
                        Option4 = HasOption(options, "Option4"),
                        isSelected = IsSelected,
                        answer = Answer,
                        durationMinutes = appUserTest.Duration,
                        testStartTime = appUserTest.TestStartTime
                    });
                }

                return Ok(new { succeeded = true, data = result, durationMinutes = appUserTest.Duration, testStartTime = appUserTest.TestStartTime });
            }
        }

        [HttpGet]
        [Route("api/TakeTest/DeleteTest/{testId}")]
        public IActionResult DeleteTest(int testId)
        {
            String Message = "";

            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var QuestionQuery = (from c in db.AppUserTestTbs
                                     where c.TestId == testId
                                     select c).FirstOrDefault();
                if (QuestionQuery != null)
                {
                    var Delete = (from c in db.AppUserTestTbs
                                  where c.TestId == testId
                                  select c).FirstOrDefault();
                    db.AppUserTestTbs.Remove(Delete);
                    db.SaveChanges();

                    var TestQuestiondQuery = db.TestQuestionTbs.Where(x => x.TestId == testId).ToList();
                    foreach (var q in TestQuestiondQuery)
                    {
                        var DeleteQuestion = db.TestQuestionTbs.Where(x => x.TestQuestionRecordId == q.TestQuestionRecordId).FirstOrDefault();
                        db.TestQuestionTbs.Remove(DeleteQuestion);
                        db.SaveChanges();
                    }

                    var TestQuestiondOptionQuery = db.TestQuestionOptionTbs.Where(x => x.TestId == testId).ToList();
                    foreach (var q in TestQuestiondOptionQuery)
                    {
                        var DeleteOptionQuestion = db.TestQuestionOptionTbs.Where(x => x.TestQuestionOptionId == q.TestQuestionOptionId).FirstOrDefault();
                        db.TestQuestionOptionTbs.Remove(DeleteOptionQuestion);
                        db.SaveChanges();
                    }
                }

                Message = "Delete Sucessfuly..";
                return Ok(Message);
            }
        }

        [HttpGet]
        [Route("api/TakeTest/GetTestDetails/{testId}")]
        public IActionResult GetTestDetails(int testId)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var QuestionQuery = (from c in db.TestQuestionTbs
                                     where c.TestId == testId
                                     select new
                                     {
                                         c.TestId,
                                         c.QuestionContent,
                                         c.QuestionId,
                                         QuestionOptions = db.TestQuestionOptionTbs.Where(x => x.QuestionId == c.QuestionId && x.TestId == testId).ToList()
                                     }).ToList();
                return Ok(QuestionQuery);
            }
        }

        [HttpGet]
        [Route("api/TakeTest/GetTestSummary/{id}")]
        public IActionResult GetTestSummary(int id)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TestId");
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
                var QuestionCount = db.TestQuestionTbs.Where(x => x.TestId == id).OrderBy(x => x.QuestionId).ToList();
                if (QuestionCount.Count > 0)
                {
                    QuestionQuery = (from c in db.TestQuestionTbs
                                     where c.TestId == id
                                     select new
                                     {
                                         QuestionId = c.QuestionId,
                                         QuestionOptions = db.TestQuestionOptionTbs.Where(x => x.TestId == id && x.QuestionId == c.QuestionId).ToList(),
                                         QuestionContent = c.QuestionContent
                                     }).OrderBy(x => x.QuestionId).ToList();

                    var UpdateTestStartDate = db.AppUserTestTbs.Where(x => x.TestId == id).FirstOrDefault();

                    if (UpdateTestStartDate.TestStartTime == null)
                    {
                        UpdateTestStartDate.TestStartTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                        db.SaveChanges();
                    }

                    int RowIndex = 0;

                    foreach (var q in QuestionQuery)
                    {
                        int OpIndex = 1;
                        dt.Rows.Add(id, q.QuestionId, q.QuestionContent);
                        foreach (var w in q.QuestionOptions)
                        {
                            dt.Rows[RowIndex]["Option" + (OpIndex)] = w.Options;
                            dt.Rows[RowIndex]["isSelected"] = w.isSelected;
                            dt.Rows[RowIndex]["TestStartTime"] = UpdateTestStartDate.TestStartTime;
                            dt.Rows[RowIndex]["Duration"] = UpdateTestStartDate.Duration;
                            dt.Rows[RowIndex]["Answer"] = w.Answer;
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
                else
                {
                    QuestionQuery = "null";
                    return Ok(QuestionQuery);
                }
            }
        }

        [HttpGet]
        [Route("api/TakeTest/TakeTestByUser/{id}")]
        public IActionResult TakeTestByUser(int id)
        {
            DataTable dt = new DataTable();
            dt.Columns.Add("TestId");
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

            var QuestionQuery = (dynamic)null;
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var QuestionCount = db.TestQuestionTbs.Where(x => x.TestId == id).OrderBy(x => x.QuestionId).ToList();
                if (QuestionCount.Count > 0)
                {
                    QuestionQuery = (from c in db.TestQuestionOptionTbs
                                     join d in db.TestQuestionTbs on c.QuestionId equals d.QuestionId
                                     where c.TestId == id && d.TestId == id
                                     group c by c.QuestionId into g
                                     select new
                                     {
                                         QuestionId = g.Key,
                                         QuestionOptions = g.Where(x => x.QuestionId == g.Key && x.TestId == id).ToList(),
                                         QuestionContent = db.QuestionsTBs.Where(x => x.QuestionId == g.Key).Select(x => x.QuestionContent).FirstOrDefault()
                                     }).OrderBy(x => x.QuestionId).ToList();

                    var UpdateTestStartDate = db.AppUserTestTbs.Where(x => x.TestId == id).FirstOrDefault();

                    if (UpdateTestStartDate.TestStartTime == null)
                    {
                        UpdateTestStartDate.TestStartTime = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Pakistan_Standard_Time);
                        db.SaveChanges();
                    }

                    int RowIndex = 0;

                    foreach (var q in QuestionQuery)
                    {
                        int OpIndex = 1;
                        dt.Rows.Add(id, q.QuestionId, q.QuestionContent);
                        foreach (var w in q.QuestionOptions)
                        {
                            dt.Rows[RowIndex]["Option" + (OpIndex)] = w.Options;
                            dt.Rows[RowIndex]["isSelected"] = w.isSelected;
                            dt.Rows[RowIndex]["TestStartTime"] = UpdateTestStartDate.TestStartTime;
                            dt.Rows[RowIndex]["Duration"] = UpdateTestStartDate.Duration;
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
                else
                {
                    QuestionQuery = "null";
                    return Ok(QuestionQuery);
                }
            }
        }

        [HttpPost]
        [Route("api/TakeTest/UserTestUpdate")]
        public void UserTestUpdate([FromBody] UserTestAnswerModel value)
        {
            lock (Lock)
            {
                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var QuestionCount = db.TestQuestionOptionTbs.Where(x => x.TestId == value.TestId && x.QuestionId == value.QuestionId).OrderBy(x => x.QuestionId).ToList();
                    if (QuestionCount != null)
                    {
                        for (int i = 0; i < QuestionCount.Count; i++)
                        {
                            QuestionCount[i].isSelected = value.IsSelected;
                            QuestionCount[i].Answer = value.Answer;
                            db.SaveChanges();
                        }
                    }
                }
            }
        }

        [HttpGet]
        [Route("api/TakeTest/SaveTest/{testId}")]
        public IActionResult SaveTest(int testId)
        {
            int RightAnswers = 0;
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                var GetResult = db.TestQuestionOptionTbs.Where(x => x.TestId == testId).ToList();
                var GroupByQuestions = (from c in GetResult
                                        group c by c.QuestionId
                                        into g
                                        select new { QuestionId = g.Key }).ToList();
                foreach (var q in GroupByQuestions)
                {
                    var GetQuestion = GetResult.Where(x => x.QuestionId == q.QuestionId).ToList();
                    bool RightOptions = GetQuestion.Where(x => x.IsRightAns == true && StripHTML(x.Answer) == StripHTML(x.Options)).Any();
                    if (RightOptions == true)
                    {
                        RightAnswers += 1;
                    }
                }
                var Query = db.AppUserTestTbs.Where(x => x.TestId == testId).FirstOrDefault();
                if (Query != null)
                {
                    Query.IsCompleted = true;
                    Query.RightQuestions = RightAnswers;
                    Query.Remarks = ExamPerformance.GetRemarks(Query.Questions, RightAnswers);
                    db.SaveChanges();
                }
                return Ok("Submit Sucessfuly..");
            }
        }

        [HttpGet]
        [Route("api/TakeTest/GetAppUserTestResult/{AppUserId}")]
        public IActionResult GetAppUserTestResult(int AppUserId)
        {
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
                List<AppUserTestModel> list = new List<AppUserTestModel>();
                var QuestionQuery = (from c in db.AppUserTestTbs
                                     join d in db.CourseTbs on c.CourseId equals d.CourseId
                                     join a in db.AppUserTbs on c.ApplicantId equals a.ApplicantId
                                     where a.AppUserId == AppUserId && c.IsCompleted == true
                                     select
                                     new
                                     {
                                         c.CreatedBy,
                                         d.CourseName,
                                         c.IsCompleted,
                                         c.TestDate,
                                         c.TestId,
                                         c.Questions,
                                         c.Duration,
                                         c.Remarks,
                                         c.TestStartTime,
                                         c.RightQuestions,
                                     }
                                  ).OrderByDescending(x => x.TestId).ToList();

                return Ok(QuestionQuery);
            }
        }

        [HttpPost]
        [Route("api/TakeTest/GenerateTest")]
        public async Task<IActionResult> GenerateTest([FromBody] GenerateTestRequest value)
        {
            try
            {
                if (value == null || value.CourseId <= 0)
                {
                    return BadRequest(new { succeeded = false, message = "Course is required.", testId = 0 });
                }

                int count = Math.Clamp(value.Questions < 1 ? 20 : value.Questions, 1, 50);
                string mode = string.IsNullOrWhiteSpace(value.Mode) ? "random" : value.Mode.ToLowerInvariant();
                string difficulty = string.IsNullOrWhiteSpace(value.Difficulty) ? "Medium" : value.Difficulty;

                using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
                {
                    var appUser = db.AppUserTbs.Where(x => x.AppUserId == value.AppUserId).FirstOrDefault();
                    int applicantId = appUser != null ? appUser.ApplicantId : 0;

                    if (appUser != null && appUser.ApplicantId > 0)
                    {
                        var applicant = db.ApplicantsTbs.Where(x => x.ApplicantId == appUser.ApplicantId).FirstOrDefault();
                        if (applicant != null && applicant.RegistrationDate.HasValue && applicant.ExpiryDate.HasValue)
                        {
                            DateTime reg = applicant.RegistrationDate.Value;
                            DateTime exp = applicant.ExpiryDate.Value;
                            bool isTrial = exp > DateTime.Now && (exp - reg).TotalDays <= 6;
                            if (isTrial)
                            {
                                int ExistingTests = db.AppUserTestTbs.Where(x => x.ApplicantId == appUser.ApplicantId).Count();
                                if (ExistingTests >= 2)
                                {
                                    return Ok(new { succeeded = false, message = "Trial limit reached — you can create up to 2 tests. Upgrade your subscription for unlimited tests.", testId = 0 });
                                }
                            }
                        }
                    }

                    string courseName = db.CourseTbs.Where(x => x.CourseId == value.CourseId).Select(x => x.CourseName).FirstOrDefault() ?? "";

                    List<PickedQuestion> picked = new List<PickedQuestion>();

                    if (mode == "ai")
                    {
                        var aiResult = await GenerateAiQuestionsInternal(db, value.CourseId, courseName, count, difficulty);
                        if (!aiResult.succeeded)
                        {
                            return Ok(new { succeeded = false, message = aiResult.message, testId = 0 });
                        }
                        foreach (var q in aiResult.questions)
                        {
                            var options = new List<PickedOption>();
                            if (q.Options != null)
                            {
                                for (int i = 0; i < q.Options.Count; i++)
                                {
                                    options.Add(new PickedOption
                                    {
                                        Text = StripHTML(q.Options[i].Text),
                                        IsRightAns = i == q.CorrectIndex
                                    });
                                }
                            }
                            if (options.Count > 0)
                            {
                                picked.Add(new PickedQuestion { Content = StripHTML(q.QuestionContent), Options = options });
                            }
                        }
                    }
                    else
                    {
                        var bank = db.QuestionsTBs.Where(x => x.CourseId == value.CourseId).OrderBy(x => Guid.NewGuid()).Take(count).ToList();
                        if (bank.Count == 0)
                        {
                            return Ok(new { succeeded = false, message = "No questions available in the question bank for this course.", testId = 0 });
                        }
                        foreach (var m in bank)
                        {
                            var options = db.QuestionOptionsTbs
                                .Where(o => o.QuestionId == m.QuestionId)
                                .OrderBy(o => o.QuestionJobOptionId)
                                .Select(o => new PickedOption { Text = StripHTML(o.Options) ?? "", IsRightAns = o.IsRightAns == true })
                                .ToList();
                            if (options.Count > 0)
                            {
                                picked.Add(new PickedQuestion { Content = StripHTML(m.QuestionContent) ?? "", QuestionId = m.QuestionId, Options = options });
                            }
                        }
                    }

                    if (picked.Count == 0)
                    {
                        return Ok(new { succeeded = false, message = "Could not generate any questions.", testId = 0 });
                    }

                    int TestId = 1;
                    var GetMaxNo = db.AppUserTestTbs.OrderByDescending(x => x.TestRecordId).Select(x => (int?)x.TestId).FirstOrDefault();
                    if (GetMaxNo.HasValue)
                    {
                        TestId += GetMaxNo.Value;
                    }

                    int duration = value.Duration > 0 ? value.Duration : picked.Count;

                    AppUserTestTb appUserTest = new AppUserTestTb();
                    appUserTest.TestId = TestId;
                    appUserTest.CourseId = value.CourseId;
                    appUserTest.ApplicantId = applicantId;
                    appUserTest.CreatedDate = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                    appUserTest.IsCompleted = false;
                    appUserTest.Duration = duration;
                    appUserTest.Questions = picked.Count;
                    appUserTest.CreatedBy = value.AppUserId;
                    appUserTest.TestDate = TimeZoneInfo.ConvertTime(DateTime.Now, Pakistan_Standard_Time);
                    db.AppUserTestTbs.Add(appUserTest);
                    db.SaveChanges();

                    int syntheticQuestionId = 1;
                    foreach (var m in picked)
                    {
                        TestQuestionTb testQuestionTb = new TestQuestionTb();
                        testQuestionTb.QuestionContent = m.Content;
                        testQuestionTb.CourseId = value.CourseId;
                        testQuestionTb.QuestionId = m.QuestionId > 0 ? m.QuestionId : syntheticQuestionId++;
                        testQuestionTb.TestId = TestId;
                        db.TestQuestionTbs.Add(testQuestionTb);
                        db.SaveChanges();

                        foreach (var d in m.Options)
                        {
                            TestQuestionOptionTb testQuestionOptionTb = new TestQuestionOptionTb();
                            testQuestionOptionTb.Options = d.Text;
                            testQuestionOptionTb.QuestionId = testQuestionTb.QuestionId;
                            testQuestionOptionTb.IsRightAns = d.IsRightAns;
                            testQuestionOptionTb.TestId = TestId;
                            testQuestionOptionTb.Answer = null;
                            testQuestionOptionTb.isSelected = 0;
                            db.TestQuestionOptionTbs.Add(testQuestionOptionTb);
                        }
                        db.SaveChanges();
                    }

                    return Ok(new { succeeded = true, message = "Test created successfully.", testId = TestId, durationMinutes = duration, questions = picked.Count });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[GenerateTest] {ex}");
                return Ok(new { succeeded = false, message = "Failed to generate test: " + ex.Message, testId = 0 });
            }
        }

        private sealed class ConductQuestionRow
        {
            public int TestId { get; set; }
            public int QuestionId { get; set; }
            public string QuestionContent { get; set; }
        }

        private sealed class ConductOptionRow
        {
            public int TestId { get; set; }
            public int QuestionId { get; set; }
            public int TestQuestionOptionId { get; set; }
            public string Options { get; set; }
            public string Answer { get; set; }
            public bool? IsRightAns { get; set; }
            public int? isSelected { get; set; }
        }

        private sealed class PickedQuestion
        {
            public string Content { get; set; }
            public int QuestionId { get; set; }
            public List<PickedOption> Options { get; set; }
        }

        private sealed class PickedOption
        {
            public string Text { get; set; }
            public bool IsRightAns { get; set; }
        }

        private async Task<(bool succeeded, string message, List<GenerateAiQuestionItem> questions)>
            GenerateAiQuestionsInternal(MdLabScienceDbEntities db, int courseId, string courseName, int count, string difficulty)
        {
            string apiKey = _configuration["OpenAI:ApiKey1"];
            string model = _configuration["OpenAI:Model"] ?? "gpt-4o";
            if (string.IsNullOrEmpty(apiKey))
            {
                return (false, "OpenAI ApiKey is not configured.", new List<GenerateAiQuestionItem>());
            }

            string existingQuestionsJson = "";
            var dbQuestions = (from q in db.QuestionsTBs
                               where q.CourseId == courseId
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

                existingQuestionsJson = JsonSerializer.Serialize(sampleList, new JsonSerializerOptions { WriteIndented = false });
            }

            string dbSection = "";
            if (!string.IsNullOrEmpty(existingQuestionsJson))
            {
                dbSection = $@"

Here are existing questions from the course database for reference. Use them as inspiration for topic coverage and style, but generate NEW and DIFFERENT questions — do NOT duplicate these:

{existingQuestionsJson}";
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
7. Return ONLY valid JSON, no commentary.{dbSection}

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

            var questions = JsonSerializer.Deserialize<List<GenerateAiQuestionItem>>(responseText,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            return (true, "OK", questions ?? new List<GenerateAiQuestionItem>());
        }

        [NonAction]
        private static string StripHTML(string html)
        {
            if (string.IsNullOrEmpty(html)) return "";
            var regex = new System.Text.RegularExpressions.Regex("<[^>]+>", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            return System.Net.WebUtility.HtmlDecode(regex.Replace(html, "")).Trim();
        }

        [NonAction]
        private static string HasOption(Dictionary<string, string> options, string key)
        {
            return options.ContainsKey(key) ? options[key] : "";
        }
    }
}
