using Microsoft.EntityFrameworkCore;

namespace MdLabScience.DbContext
{
    public class MdLabScienceDbEntities : Microsoft.EntityFrameworkCore.DbContext
    {
        private static DbContextOptions<MdLabScienceDbEntities>? _staticOptions;

        public static void SetOptions(DbContextOptions<MdLabScienceDbEntities> options)
        {
            _staticOptions = options;
        }

        public MdLabScienceDbEntities() : base(_staticOptions ?? throw new InvalidOperationException("DbContext not configured. Call MdLabScienceDbEntities.SetOptions() at startup."))
        {
        }

        public MdLabScienceDbEntities(DbContextOptions<MdLabScienceDbEntities> options) : base(options) { }

        public virtual DbSet<AdditionalDocumentTb> AdditionalDocumentTbs { get; set; }
        public virtual DbSet<ApplicantCourseSelectionTb> ApplicantCourseSelectionTbs { get; set; }
        public virtual DbSet<ApplicantInvoiceTB> ApplicantInvoiceTBs { get; set; }
        public virtual DbSet<ApplicantsTb> ApplicantsTbs { get; set; }
        public virtual DbSet<ApplicantTransactionTB> ApplicantTransactionTBs { get; set; }
        public virtual DbSet<AppUserScreenshotTB> AppUserScreenshotTBs { get; set; }
        public virtual DbSet<AppUserTb> AppUserTbs { get; set; }
        public virtual DbSet<AppUserTestDetailsTb> AppUserTestDetailsTbs { get; set; }
        public virtual DbSet<AppUserTestTb> AppUserTestTbs { get; set; }
        public virtual DbSet<CertificateInvoiceTb> CertificateInvoiceTbs { get; set; }
        public virtual DbSet<CertificationApplicantTB> CertificationApplicantTBs { get; set; }
        public virtual DbSet<ChatTb> ChatTbs { get; set; }
        public virtual DbSet<ControllerPermission> ControllerPermissions { get; set; }
        public virtual DbSet<CountryTb> CountryTbs { get; set; }
        public virtual DbSet<CourseMaterialTb> CourseMaterialTbs { get; set; }
        public virtual DbSet<CourseTb> CourseTbs { get; set; }
        public virtual DbSet<DataFlowTransferTB> DataFlowTransferTBs { get; set; }
        public virtual DbSet<DataFlowVerificationTb> DataFlowVerificationTbs { get; set; }
        public virtual DbSet<ExerciseTb> ExerciseTbs { get; set; }
        public virtual DbSet<QuestionOptionsTb> QuestionOptionsTbs { get; set; }
        public virtual DbSet<QuestionsTB> QuestionsTBs { get; set; }
        public virtual DbSet<TestQuestionOptionTb> TestQuestionOptionTbs { get; set; }
        public virtual DbSet<TestQuestionTb> TestQuestionTbs { get; set; }
        public virtual DbSet<UserController> UserControllers { get; set; }
        public virtual DbSet<UserInfo> UserInfoes { get; set; }
        public virtual DbSet<UserMenu> UserMenus { get; set; }
        public virtual DbSet<UserPage> UserPages { get; set; }
        public virtual DbSet<UserPermission> UserPermissions { get; set; }
        public virtual DbSet<UserRole> UserRoles { get; set; }
        public virtual DbSet<UserdiscussionTB> UserdiscussionTBs { get; set; }
        public virtual DbSet<QuestionTopicTB> QuestionTopicTBs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<AdditionalDocumentTb>(entity =>
            {
                entity.HasKey(e => e.AdditionalDocumentId);
                entity.ToTable("AdditionalDocumentTb");
            });
            modelBuilder.Entity<ApplicantCourseSelectionTb>(entity =>
            {
                entity.HasKey(e => e.CourseSelectionId);
                entity.ToTable("ApplicantCourseSelectionTb");
            });
            modelBuilder.Entity<ApplicantInvoiceTB>(entity =>
            {
                entity.HasKey(e => e.InvoiceId);
                entity.ToTable("ApplicantInvoiceTB");
            });
            modelBuilder.Entity<ApplicantsTb>(entity =>
            {
                entity.HasKey(e => e.RecordId);
                entity.ToTable("ApplicantsTb");
            });
            modelBuilder.Entity<ApplicantTransactionTB>(entity =>
            {
                entity.HasKey(e => e.TransactionId);
                entity.ToTable("ApplicantTransactionTB");
            });
            modelBuilder.Entity<AppUserScreenshotTB>(entity =>
            {
                entity.HasKey(e => e.ScreenShotId);
                entity.ToTable("AppUserScreenshotTB");
            });
            modelBuilder.Entity<AppUserTb>(entity =>
            {
                entity.HasKey(e => e.AppUserRecordId);
                entity.ToTable("AppUserTb");
            });
            modelBuilder.Entity<AppUserTestDetailsTb>(entity =>
            {
                entity.HasKey(e => e.TestRecordId);
                entity.ToTable("AppUserTestDetailsTb");
            });
            modelBuilder.Entity<AppUserTestTb>(entity =>
            {
                entity.HasKey(e => e.TestRecordId);
                entity.ToTable("AppUserTestTb");
            });
            modelBuilder.Entity<CertificateInvoiceTb>(entity =>
            {
                entity.HasKey(e => e.CertificateInoviceId);
                entity.ToTable("CertificateInvoiceTb");
            });
            modelBuilder.Entity<CertificationApplicantTB>(entity =>
            {
                entity.HasKey(e => e.RecordId);
                entity.ToTable("CertificationApplicantTB");
            });
            modelBuilder.Entity<ChatTb>(entity =>
            {
                entity.HasKey(e => e.ChatId);
                entity.ToTable("ChatTb");
            });
            modelBuilder.Entity<ControllerPermission>(entity =>
            {
                entity.HasKey(e => e.CPermissionId);
                entity.ToTable("ControllerPermission");
            });
            modelBuilder.Entity<CountryTb>(entity =>
            {
                entity.HasKey(e => e.CountryId);
                entity.ToTable("CountryTb");
            });
            modelBuilder.Entity<CourseMaterialTb>(entity =>
            {
                entity.HasKey(e => e.CourseMaterialId);
                entity.ToTable("CourseMaterialTb");
            });
            modelBuilder.Entity<CourseTb>(entity =>
            {
                entity.HasKey(e => e.CourseId);
                entity.ToTable("CourseTb");
            });
            modelBuilder.Entity<DataFlowTransferTB>(entity =>
            {
                entity.HasKey(e => e.DataFlowTransferredId);
                entity.ToTable("DataFlowTransferTB");
            });
            modelBuilder.Entity<DataFlowVerificationTb>(entity =>
            {
                entity.HasKey(e => e.DataFlowVerificationId);
                entity.ToTable("DataFlowVerificationTb");
            });
            modelBuilder.Entity<ExerciseTb>(entity =>
            {
                entity.HasKey(e => e.ExerciseRecordId);
                entity.ToTable("ExerciseTb");
            });
            modelBuilder.Entity<QuestionOptionsTb>(entity =>
            {
                entity.HasKey(e => e.QuestionJobOptionId);
                entity.ToTable("QuestionOptionsTb");
            });
            modelBuilder.Entity<QuestionsTB>(entity =>
            {
                entity.HasKey(e => e.QuestionRecordId);
                entity.ToTable("QuestionsTB");
            });
            modelBuilder.Entity<TestQuestionOptionTb>(entity =>
            {
                entity.HasKey(e => e.TestQuestionOptionId);
                entity.ToTable("TestQuestionOptionTb");
            });
            modelBuilder.Entity<TestQuestionTb>(entity =>
            {
                entity.HasKey(e => e.TestQuestionRecordId);
                entity.ToTable("TestQuestionTb");
            });
            modelBuilder.Entity<UserController>(entity =>
            {
                entity.HasKey(e => e.ControllerId);
                entity.ToTable("UserController");
            });
            modelBuilder.Entity<UserInfo>(entity =>
            {
                entity.HasKey(e => e.UserId);
                entity.ToTable("UserInfo");
            });
            modelBuilder.Entity<UserMenu>(entity =>
            {
                entity.HasKey(e => e.RecordId);
                entity.ToTable("UserMenu");
            });
            modelBuilder.Entity<UserPage>(entity =>
            {
                entity.HasKey(e => e.PageId);
                entity.ToTable("UserPage");
            });
            modelBuilder.Entity<UserPermission>(entity =>
            {
                entity.HasKey(e => e.PermissionId);
                entity.ToTable("UserPermission");
            });
            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.HasKey(e => e.RoleId);
                entity.ToTable("UserRole");
            });
            modelBuilder.Entity<QuestionTopicTB>(entity =>
            {
                entity.HasKey(e => e.TopId);
                entity.ToTable("QuestionTopicTB");
            });
            modelBuilder.Entity<UserdiscussionTB>(entity =>
            {
                entity.HasKey(e => e.DiscuId);
                entity.ToTable("UserdiscussionTB");
            });
        }
    }
}
