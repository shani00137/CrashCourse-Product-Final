using MdLabScience.DbContext;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
    options.SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true);
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins("http://localhost:5008")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"[JWT] Token rejected: {context.Exception?.Message}");
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine($"[JWT] Challenge sent for: {context.HttpContext.Request.Path}");
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter the JWT token returned by the login endpoint."
    });
    c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        [new OpenApiSecuritySchemeReference("Bearer", document)] = []
    });
});
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionString))
{
    var optionsBuilder = new DbContextOptionsBuilder<MdLabScienceDbEntities>();
    optionsBuilder.UseSqlServer(connectionString);
    MdLabScienceDbEntities.SetOptions(optionsBuilder.Options);
}

var app = builder.Build();

if (!string.IsNullOrEmpty(connectionString))
{
    using (var db = new MdLabScienceDbEntities())
    {
        // Each block runs in its own try/catch so a failure in one table never
        // prevents the remaining tables from being upgraded.
        void RunMigration(string name, string sql)
        {
            try
            {
                db.Database.ExecuteSqlRaw(sql);
                Console.WriteLine($"[Migration] {name} verified.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Migration] {name} FAILED: {ex.Message}");
            }
        }

        RunMigration("ServiceTb PurchasePrice/SalePrice", @"
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ServiceTb') AND name = 'PurchasePrice')
            BEGIN
                ALTER TABLE ServiceTb ADD PurchasePrice DECIMAL(18,2) NOT NULL DEFAULT 0;
            END
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ServiceTb') AND name = 'SalePrice')
            BEGIN
                ALTER TABLE ServiceTb ADD SalePrice DECIMAL(18,2) NOT NULL DEFAULT 0;
            END
        ");

        RunMigration("CertificateInvoiceTb PurchaseAmount/IsCompleted", @"
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CertificateInvoiceTb') AND name = 'PurchaseAmount')
            BEGIN
                ALTER TABLE CertificateInvoiceTb ADD PurchaseAmount FLOAT NULL;
            END
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CertificateInvoiceTb') AND name = 'IsCompleted')
            BEGIN
                ALTER TABLE CertificateInvoiceTb ADD IsCompleted BIT NOT NULL DEFAULT 0;
            END
        ");

        RunMigration("QuestionsTB VerifiedBy", @"
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('QuestionsTB') AND name = 'VerifiedBy')
            BEGIN
                ALTER TABLE QuestionsTB ADD VerifiedBy NVARCHAR(50) NULL;
            END
        ");

        RunMigration("AppUserTb IsAIAllowed", @"
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('AppUserTb') AND name = 'IsAIAllowed')
            BEGIN
                ALTER TABLE AppUserTb ADD IsAIAllowed BIT NULL;
            END
        ");

        RunMigration("ApplicantInvoiceTB discount columns", @"
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ApplicantInvoiceTB') AND name = 'DiscountType')
            BEGIN
                ALTER TABLE ApplicantInvoiceTB ADD DiscountType NVARCHAR(20) NULL;
            END
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ApplicantInvoiceTB') AND name = 'DiscountValue')
            BEGIN
                ALTER TABLE ApplicantInvoiceTB ADD DiscountValue FLOAT NULL;
            END
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ApplicantInvoiceTB') AND name = 'DiscountAmount')
            BEGIN
                ALTER TABLE ApplicantInvoiceTB ADD DiscountAmount FLOAT NULL;
            END
        ");

        RunMigration("ApplicantInvoiceTB tax columns", @"
            IF OBJECT_ID('ApplicantInvoiceTB') IS NULL
            BEGIN
                RAISERROR('ApplicantInvoiceTB does not exist in this database.', 16, 1);
                RETURN;
            END
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ApplicantInvoiceTB') AND name = 'TaxType')
            BEGIN
                ALTER TABLE ApplicantInvoiceTB ADD TaxType NVARCHAR(20) NULL;
            END
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ApplicantInvoiceTB') AND name = 'TaxValue')
            BEGIN
                ALTER TABLE ApplicantInvoiceTB ADD TaxValue FLOAT NULL;
            END
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ApplicantInvoiceTB') AND name = 'TaxAmount')
            BEGIN
                ALTER TABLE ApplicantInvoiceTB ADD TaxAmount FLOAT NULL;
            END
        ");

        // The backfill must be its own batch: SQL Server compiles an entire batch
        // before running it, so referencing TaxAmount in the same batch that adds
        // the column fails with "Invalid column name 'TaxAmount'".
        RunMigration("ApplicantInvoiceTB tax backfill", @"
            IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ApplicantInvoiceTB') AND name = 'TaxAmount')
            BEGIN
                UPDATE ApplicantInvoiceTB SET TaxAmount = 0 WHERE TaxAmount IS NULL;
            END
        ");

    }
}

app.UseSwagger();
app.UseSwaggerUI();
app.MapOpenApi();
app.UseCors("Frontend");
//swagger UI finalzed
app.UseDefaultFiles();
app.UseStaticFiles();
var staticDirs = new[] { "Uploads", "Images", "Screenshots" };
foreach (var dir in staticDirs)
{
    var dirPath = Path.Combine(app.Environment.ContentRootPath, dir);
    if (Directory.Exists(dirPath))
    {
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(dirPath),
            RequestPath = "/" + dir,
            OnPrepareResponse = ctx =>
            {
                // Allow the in-app PDF viewer (WebView, null origin) to read files directly.
                ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
            }
        });
    }
}
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
