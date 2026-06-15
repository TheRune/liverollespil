using System.Text.Json.Serialization;

namespace Backend.Models;

public record AuthRequest(
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("password")] string Password
);

public record AuthResult(bool Success, string? Token, string? Error, Guid? UserId, string? Email, string? Role)
{
    public static AuthResult SuccessResult(string token, Guid userId, string email, string role) =>
        new(true, token, null, userId, email, role);

    public static AuthResult Failure(string message) =>
        new(false, null, message, null, null, null);
}

public record LoginResponse(string Token, string TokenType = "Bearer");

public record MeResponse(Guid Id, string Email, string Role, string? DisplayName);

public record RaceResponse(Guid Id, string Name, string? Description);

public record AbilityRequirementResponse(Guid RequiredAbilityId);

public record AbilityConflictResponse(Guid ConflictingAbilityId);

public record AbilityResponse(
    Guid Id,
    string Name,
    string? Description,
    IEnumerable<AbilityRequirementResponse> Requirements,
    IEnumerable<AbilityConflictResponse> Conflicts
);

public record CreateCharacterRequest(
    Guid RaceId,
    string PlayerName,
    string CharacterName,
    IEnumerable<Guid> AbilityIds
);

public record CharacterSummaryResponse(
    Guid Id,
    string PlayerName,
    string CharacterName,
    Guid RaceId,
    string? RaceName,
    IEnumerable<string> AbilityNames
);

public record AdminCharacterResponse(
    Guid Id,
    string PlayerName,
    string CharacterName,
    string? RaceName,
    string? UserEmail
);

public record GameSessionResponse(Guid Id, string Name, DateTime? StartsAt, IEnumerable<Guid> CharacterIds);

public record CreateGameSessionRequest(string Name, DateTime StartsAt, IEnumerable<Guid> CharacterIds);
