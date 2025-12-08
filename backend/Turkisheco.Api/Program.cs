using Microsoft.EntityFrameworkCore;
using Turkisheco.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// 1) Controller + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2) CORS: Angular dev server için (4200)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// PostgreSQL DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connStr = builder.Configuration.GetConnectionString("DefaultConnection");
    options.UseNpgsql(connStr);
});

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // gerekirse açılabilir

// 3) CORS middleware MapControllers'tan ÖNCE olmalı
app.UseCors("AllowFrontend");

app.UseAuthorization();
app.MapControllers();

app.Run();
