namespace RacePlanner.Api.Models;

/// <summary>
/// Published distance option within a race, such as a short trail or ultra route.
/// </summary>
public sealed record RaceDistance(
    string Id,
    string RaceId,
    string Name,
    double DistanceKm,
    int ElevationGainM,
    string Category,
    string? AtrpCategory = null);
