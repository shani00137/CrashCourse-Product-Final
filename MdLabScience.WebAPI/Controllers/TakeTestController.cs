using EMCQWebApi.Models;
using MdLabScience.DbContext;
using MdLabScience.Models;
using MdLabScience.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace MdLabScience.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TakeTestController : ControllerBase
    {
        private static object Lock = new object();
        private static TimeZoneInfo Pakistan_Standard_Time = TimeZoneInfo.FindSystemTimeZoneById("Pakistan Standard Time");

        [HttpPost]
        [Route("api/TakeTest/PrepareTest")]
        public IActionResult PrepareTest([FromBody] AppUserTestModel value)
        {
            String _response = "";
            using (MdLabScienceDbEntities db = new MdLabScienceDbEntities())
            {
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
                    bool RightOptions = GetQuestion.Where(x => x.IsRightAns == true && x.Answer == x.Options).Any();
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
    }
}
