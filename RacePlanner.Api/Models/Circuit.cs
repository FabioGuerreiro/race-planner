namespace RacePlanner.Api.Models;

/// <summary>
/// Season-based trail circuit that can include many races.
/// </summary>
public sealed record Circuit(
    string Id,
    string Name,
    string Type,
    string Season,
    string? Website = null);
