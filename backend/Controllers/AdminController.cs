using Backend.Models;
using Backend.Services;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.Common;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "gm")]
public class AdminController : ControllerBase
{
    private readonly IDbConnectionFactory _connectionFactory;

    public AdminController(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet("characters")]
    public async Task<IActionResult> GetCharacters()
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        var characters = await connection.QueryAsync<AdminCharacterResponse>(
            "SELECT c.id, c.player_name AS PlayerName, c.character_name AS CharacterName, r.name AS RaceName, p.email AS UserEmail FROM characters c LEFT JOIN races r ON r.id = c.race_id LEFT JOIN profiles p ON p.id = c.user_id ORDER BY c.created_at");

        return Ok(characters);
    }

    [HttpGet("sessions")]
    public async Task<IActionResult> GetSessions()
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        var sessions = await connection.QueryAsync<GameSessionResponse>(
            "SELECT id, name, starts_at AS StartsAt, ARRAY(SELECT character_id FROM game_session_characters WHERE game_session_id = gs.id) AS CharacterIds FROM game_sessions gs ORDER BY starts_at");

        return Ok(sessions);
    }

    [HttpPost("sessions")]
    public async Task<IActionResult> CreateSession([FromBody] CreateGameSessionRequest request)
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();
        using var transaction = await connection.BeginTransactionAsync();

        try
        {
            var sessionId = await connection.QuerySingleAsync<Guid>(
                "INSERT INTO game_sessions (name, starts_at, created_at) VALUES (@Name, @StartsAt, now()) RETURNING id",
                new { request.Name, request.StartsAt },
                transaction);

            if (request.CharacterIds.Any())
            {
                var sessionCharacters = request.CharacterIds.Select(characterId => new { GameSessionId = sessionId, CharacterId = characterId });
                await connection.ExecuteAsync(
                    "INSERT INTO game_session_characters (game_session_id, character_id, created_at) VALUES (@GameSessionId, @CharacterId, now())",
                    sessionCharacters,
                    transaction);
            }

            await transaction.CommitAsync();
            return CreatedAtAction(nameof(GetSessions), new { id = sessionId }, new { id = sessionId });
        }
        catch
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = "Could not create game session." });
        }
    }
}
