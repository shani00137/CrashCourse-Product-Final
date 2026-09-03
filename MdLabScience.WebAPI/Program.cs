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
    try
    {
        using var db = new MdLabScienceDbEntities();
        db.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ServiceTb') AND name = 'PurchasePrice')
            BEGIN
                ALTER TABLE ServiceTb ADD PurchasePrice DECIMAL(18,2) NOT NULL DEFAULT 0;
            END
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('ServiceTb') AND name = 'SalePrice')
            BEGIN
                ALTER TABLE ServiceTb ADD SalePrice DECIMAL(18,2) NOT NULL DEFAULT 0;
            END
        ");
        Console.WriteLine("[Migration] PurchasePrice and SalePrice columns verified.");
        db.Database.ExecuteSqlRaw(@"
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CertificateInvoiceTb') AND name = 'PurchaseAmount')
            BEGIN
                ALTER TABLE CertificateInvoiceTb ADD PurchaseAmount FLOAT NULL;
            END
            IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('CertificateInvoiceTb') AND name = 'IsCompleted')
            BEGIN
                ALTER TABLE CertificateInvoiceTb ADD IsCompleted BIT NOT NULL DEFAULT 0;
            END
        ");
        Console.WriteLine("[Migration] CertificateInvoiceTb columns verified.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Migration] Auto-migration skipped: {ex.Message}");
    }
}

app.UseSwagger();
app.UseSwaggerUI();
app.MapOpenApi();
app.UseCors("Frontend");
//swagger UI finalzed
app.UseDefaultFiles();
app.UseStaticFiles();
var staticDirs = new[] { "Uploads", "Images" };
foreach (var dir in staticDirs)
{
    var dirPath = Path.Combine(app.Environment.ContentRootPath, dir);
    if (Directory.Exists(dirPath))
    {
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(dirPath),
            RequestPath = "/" + dir
        });
    }
}
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
