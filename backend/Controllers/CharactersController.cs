using Backend.Models;
using Backend.Services;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.Common;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CharactersController : ControllerBase
{
    private readonly IDbConnectionFactory _connectionFactory;

    public CharactersController(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet("mine")]
    public async Task<IActionResult> GetMine()
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        var characters = await connection.QueryAsync<CharacterSummaryResponse>(
            "SELECT c.id, c.player_name AS PlayerName, c.character_name AS CharacterName, c.race_id AS RaceId, r.name AS RaceName FROM characters c LEFT JOIN races r ON r.id = c.race_id WHERE c.user_id = @UserId ORDER BY c.created_at",
            new { UserId = userId });

        var abilities = await connection.QueryAsync<(Guid CharacterId, string Name)>(
            "SELECT ca.character_id AS CharacterId, a.name AS Name FROM character_abilities ca JOIN abilities a ON a.id = ca.ability_id WHERE ca.character_id = ANY(@CharacterIds)",
            new { CharacterIds = characters.Select(c => c.Id).ToArray() });

        var abilitiesByCharacter = abilities.GroupBy(x => x.CharacterId)
            .ToDictionary(group => group.Key, group => group.Select(item => item.Name).ToList());

        var result = characters.Select(character =>
            character with { AbilityNames = abilitiesByCharacter.TryGetValue(character.Id, out var names) ? names : Enumerable.Empty<string>() }
        );

        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCharacter([FromBody] CreateCharacterRequest request)
    {
        var userId = GetUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        using var transaction = await connection.BeginTransactionAsync();

        try
        {
            var characterId = await connection.QuerySingleAsync<Guid>(
                "INSERT INTO characters (user_id, player_name, character_name, race_id, created_at) VALUES (@UserId, @PlayerName, @CharacterName, @RaceId, now()) RETURNING id",
                new { UserId = userId, request.PlayerName, request.CharacterName, request.RaceId },
                transaction);

            if (request.AbilityIds.Any())
            {
                var inserts = request.AbilityIds.Select(abilityId => new { CharacterId = characterId, AbilityId = abilityId });
                await connection.ExecuteAsync(
                    "INSERT INTO character_abilities (character_id, ability_id, created_at) VALUES (@CharacterId, @AbilityId, now())",
                    inserts,
                    transaction);
            }

            await transaction.CommitAsync();

            return CreatedAtAction(nameof(GetMine), new { id = characterId }, new { id = characterId });
        }
        catch
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = "Could not create character." });
        }
    }

    private Guid? GetUserId()
    {
        var userIdValue = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(userIdValue, out var userId))
        {
            return userId;
        }

        return null;
    }
}
