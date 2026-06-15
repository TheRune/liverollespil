using System.Data.Common;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Backend.Models;
using Dapper;
using Microsoft.IdentityModel.Tokens;

namespace Backend.Services;

public class AuthService
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly string _jwtSecret;
    private readonly string _jwtIssuer;
    private readonly string _jwtAudience;

    public AuthService(IDbConnectionFactory connectionFactory, IConfiguration configuration)
    {
        _connectionFactory = connectionFactory;
        _jwtSecret = configuration["JWT_SECRET"] ?? throw new InvalidOperationException("JWT_SECRET environment variable is required.");
        _jwtIssuer = configuration["JWT_ISSUER"] ?? "liverollespil-backend";
        _jwtAudience = configuration["JWT_AUDIENCE"] ?? "liverollespil-frontend";
    }

    public async Task<AuthResult> RegisterAsync(string email, string password)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return AuthResult.Failure("Email and password are required.");
        }

        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        var normalizedEmail = email.Trim().ToLowerInvariant();
        var existingUser = await connection.QuerySingleOrDefaultAsync<Guid?>(
            "SELECT id FROM users WHERE email = @Email LIMIT 1",
            new { Email = normalizedEmail });

        if (existingUser is not null)
        {
            return AuthResult.Failure("This email address is already registered.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
        var userId = await connection.QuerySingleAsync<Guid>(
            "INSERT INTO users (email, password_hash, created_at) VALUES (@Email, @PasswordHash, now()) RETURNING id",
            new { Email = normalizedEmail, PasswordHash = passwordHash });

        await connection.ExecuteAsync(
            "INSERT INTO profiles (id, email, role, created_at) VALUES (@Id, @Email, @Role, now()) ON CONFLICT (id) DO NOTHING",
            new { Id = userId, Email = normalizedEmail, Role = "player" });

        var token = CreateJwtToken(userId, normalizedEmail, "player");
        return AuthResult.SuccessResult(token, userId, normalizedEmail, "player");
    }

    public async Task<AuthResult> LoginAsync(string email, string password)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return AuthResult.Failure("Email and password are required.");
        }

        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        var normalizedEmail = email.Trim().ToLowerInvariant();
        var result = await connection.QuerySingleOrDefaultAsync<(Guid Id, string PasswordHash, string? Role)>(
            "SELECT u.id, u.password_hash AS PasswordHash, COALESCE(p.role, 'player') AS Role FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.email = @Email LIMIT 1",
            new { Email = normalizedEmail });

        if (result == default || string.IsNullOrEmpty(result.PasswordHash))
        {
            return AuthResult.Failure("Invalid email or password.");
        }

        if (!BCrypt.Net.BCrypt.Verify(password, result.PasswordHash))
        {
            return AuthResult.Failure("Invalid email or password.");
        }

        var token = CreateJwtToken(result.Id, normalizedEmail, result.Role ?? "player");
        return AuthResult.SuccessResult(token, result.Id, normalizedEmail, result.Role ?? "player");
    }

    public async Task<MeResponse?> GetProfileAsync(Guid userId)
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        var profile = await connection.QuerySingleOrDefaultAsync<MeResponse?>(
            "SELECT id, email, COALESCE(role, 'player') AS role, display_name AS displayname FROM profiles WHERE id = @Id",
            new { Id = userId });

        return profile;
    }

    private string CreateJwtToken(Guid userId, string email, string role)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _jwtIssuer,
            audience: _jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(14),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
