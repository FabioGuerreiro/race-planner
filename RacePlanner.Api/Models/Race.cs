namespace RacePlanner.Api.Models;

/// <summary>
/// Core race information plus resolved distance and circuit membership for API consumers.
/// </summary>
public sealed record Race(
    string Id,
    string Name,
    DateTime Date,
    string Location,
    string District,
    string Municipality,
    string Organizer,
    string Status,
    IReadOnlyCollection<RaceDistance> Distances,
    IReadOnlyCollection<Circuit> Circuits,
    string? RegistrationUrl = null,
    string? OfficialUrl = null);
