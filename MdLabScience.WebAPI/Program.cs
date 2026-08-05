using MdLabScience.DbContext;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (!string.IsNullOrEmpty(connectionString))
{
    var optionsBuilder = new DbContextOptionsBuilder<MdLabScienceDbEntities>();
    optionsBuilder.UseSqlServer(connectionString);
    MdLabScienceDbEntities.SetOptions(optionsBuilder.Options);
}

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
 app.MapOpenApi();


app.MapControllers();

app.Run();
