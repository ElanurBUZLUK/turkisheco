using Microsoft.EntityFrameworkCore;
using Turkisheco.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Turkisheco.Api.Services;
using Turkisheco.Api.Entities;

var builder = WebApplication.CreateBuilder(args);

var connectionString = GetRequiredConnectionString(builder.Configuration, "DefaultConnection");
var jwtKey = GetRequiredConfig(builder.Configuration, "Jwt:Key", "Jwt__Key");
var jwtIssuer = GetRequiredConfig(builder.Configuration, "Jwt:Issuer", "Jwt__Issuer");
var jwtAudience = GetRequiredConfig(builder.Configuration, "Jwt:Audience", "Jwt__Audience");
var allowedOrigins = GetAllowedOrigins(builder.Configuration, builder.Environment);

// 1) Controller + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 2) CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// PostgreSQL DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});
builder.Services.AddScoped<WriterCodeHasher>();
builder.Services.AddScoped<WriterMailService>();
builder.Services.AddScoped<WriterTokenService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.Zero
    };
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

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

await EnsureBootstrapAdminAsync(app);

app.Run();

static string GetRequiredConfig(IConfiguration configuration, string key, string envVarName)
{
    var value = configuration[key];

    if (!string.IsNullOrWhiteSpace(value))
    {
        return value;
    }

    throw new InvalidOperationException(
        $"Missing required configuration '{key}'. Configure it via '{envVarName}' environment variable or a secret store.");
}

static string GetRequiredConnectionString(IConfiguration configuration, string name)
{
    var value = configuration.GetConnectionString(name);

    if (!string.IsNullOrWhiteSpace(value))
    {
        return value;
    }

    throw new InvalidOperationException(
        $"Missing required connection string 'ConnectionStrings:{name}'. Configure it via 'ConnectionStrings__{name}' environment variable or a secret store.");
}

static string[] GetAllowedOrigins(IConfiguration configuration, IWebHostEnvironment environment)
{
    if (environment.IsDevelopment())
    {
        return ["http://localhost:4200"];
    }

    var sectionOrigins = configuration
        .GetSection("Cors:AllowedOrigins")
        .Get<string[]>()?
        .Where(origin => !string.IsNullOrWhiteSpace(origin))
        .ToArray();

    if (sectionOrigins is { Length: > 0 })
    {
        return sectionOrigins;
    }

    var rawOrigins = configuration["Cors:AllowedOrigins"];
    if (!string.IsNullOrWhiteSpace(rawOrigins))
    {
        var splitOrigins = rawOrigins
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        if (splitOrigins.Length > 0)
        {
            return splitOrigins;
        }
    }

    throw new InvalidOperationException(
        "Production CORS origins are not configured. Set 'Cors__AllowedOrigins__0' (and additional indexes as needed) or use 'Cors__AllowedOrigins' as a comma-separated list.");
}

static async Task EnsureBootstrapAdminAsync(WebApplication app)
{
    var bootstrapSection = app.Configuration.GetSection("BootstrapAdmin");
    var userName = bootstrapSection["UserName"]?.Trim();
    var email = bootstrapSection["Email"]?.Trim();
    var password = bootstrapSection["Password"];
    var displayName = bootstrapSection["DisplayName"]?.Trim();

    if (string.IsNullOrWhiteSpace(userName) &&
        string.IsNullOrWhiteSpace(email) &&
        string.IsNullOrWhiteSpace(password))
    {
        return;
    }

    if (string.IsNullOrWhiteSpace(userName) ||
        string.IsNullOrWhiteSpace(email) ||
        string.IsNullOrWhiteSpace(password))
    {
        throw new InvalidOperationException(
            "Bootstrap admin configuration is incomplete. Set BootstrapAdmin__UserName, BootstrapAdmin__Email and BootstrapAdmin__Password together.");
    }

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if (await db.ForumUsers.AnyAsync(user => user.Role == "super_admin"))
    {
        app.Logger.LogInformation("Bootstrap admin skipped because a super_admin user already exists.");
        return;
    }

    if (await db.ForumUsers.AnyAsync(user => user.UserName == userName || user.Email == email))
    {
        throw new InvalidOperationException(
            "Bootstrap admin could not be created because the configured username or email is already in use.");
    }

    var admin = new ForumUser
    {
        UserName = userName,
        Email = email,
        DisplayName = string.IsNullOrWhiteSpace(displayName) ? userName : displayName,
        PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
        Role = "super_admin"
    };

    db.ForumUsers.Add(admin);
    await db.SaveChangesAsync();

    app.Logger.LogInformation("Bootstrap super_admin user '{UserName}' created via configuration.", userName);
}
