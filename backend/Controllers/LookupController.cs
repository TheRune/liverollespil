using Backend.Models;
using Backend.Services;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Data.Common;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LookupController : ControllerBase
{
    private readonly IDbConnectionFactory _connectionFactory;

    public LookupController(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    [HttpGet("races")]
    public async Task<IActionResult> GetRaces()
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        var races = await connection.QueryAsync<RaceResponse>(
            "SELECT id, name, description FROM races ORDER BY name");

        return Ok(races);
    }

    [HttpGet("abilities")]
    public async Task<IActionResult> GetAbilities()
    {
        using var connection = _connectionFactory.CreateConnection();
        await connection.OpenAsync();

        var abilities = (await connection.QueryAsync<AbilityResponse>(
            "SELECT id, name, description FROM abilities ORDER BY name")).ToList();

        var requirements = await connection.QueryAsync<(Guid AbilityId, Guid RequiredAbilityId)>(
            "SELECT ability_id AS AbilityId, required_ability_id AS RequiredAbilityId FROM ability_requirements");

        var conflicts = await connection.QueryAsync<(Guid AbilityId, Guid ConflictingAbilityId)>(
            "SELECT ability_id AS AbilityId, conflicting_ability_id AS ConflictingAbilityId FROM ability_conflicts");

        var abilityDict = abilities.ToDictionary(a => a.Id);

        foreach (var requirement in requirements)
        {
            if (abilityDict.TryGetValue(requirement.AbilityId, out var ability))
            {
                abilityDict[requirement.AbilityId] = ability with
                {
                    Requirements = ability.Requirements.Append(new AbilityRequirementResponse(requirement.RequiredAbilityId)).ToList()
                };
            }
        }

        foreach (var conflict in conflicts)
        {
            if (abilityDict.TryGetValue(conflict.AbilityId, out var ability))
            {
                abilityDict[conflict.AbilityId] = ability with
                {
                    Conflicts = ability.Conflicts.Append(new AbilityConflictResponse(conflict.ConflictingAbilityId)).ToList()
                };
            }
        }

        return Ok(abilityDict.Values);
    }
}
