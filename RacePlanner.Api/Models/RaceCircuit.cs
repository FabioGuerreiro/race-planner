namespace RacePlanner.Api.Models;

/// <summary>
/// Join record connecting races to circuits for a given season.
/// </summary>
public sealed record RaceCircuit(
    string RaceId,
    string CircuitId,
    string Season,
    string? Category = null);
