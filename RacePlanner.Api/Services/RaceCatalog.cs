using RacePlanner.Api.Models;

namespace RacePlanner.Api.Services;

/// <summary>
/// In-memory race catalog used until the database-backed repository is introduced.
/// </summary>
public sealed class RaceCatalog
{
    private readonly IReadOnlyCollection<Circuit> _circuits =
    [
        new("national-trail-cup-2026", "National Trail Cup", "national", "2026"),
        new("portugal-ultra-series-2026", "Portugal Ultra Series", "national", "2026"),
        new("centro-trail-series-2026", "Centro Trail Series", "regional", "2026"),
        new("lisboa-trail-series-2026", "Lisboa Trail Series", "regional", "2026")
    ];

    private readonly IReadOnlyCollection<RaceCircuit> _raceCircuits =
    [
        new("trail-rio-paiva-2026", "national-trail-cup-2026", "2026"),
        new("alcanena-trail-2026", "national-trail-cup-2026", "2026"),
        new("ultra-trail-marao-2026", "portugal-ultra-series-2026", "2026"),
        new("figueira-ultra-trail-2026", "centro-trail-series-2026", "2026"),
        new("lobo-iberico-trail-2026", "lisboa-trail-series-2026", "2026"),
        new("trail-demonios-lizandro-2026", "lisboa-trail-series-2026", "2026")
    ];

    private readonly IReadOnlyCollection<RaceDistance> _distances =
    [
        new("algarve-xtreme-curto-2026", "algarve-xtreme-trail-2026", "Trail Curto", 18, 700, "TC", "TC"),
        new("algarve-xtreme-longo-2026", "algarve-xtreme-trail-2026", "Trail Longo", 32, 1400, "TL", "TL"),
        new("trail-rio-paiva-2026", "trail-rio-paiva-2026", "Trail Longo", 30, 1600, "TL", "TL"),
        new("alcanena-trail-2026", "alcanena-trail-2026", "Trail Curto", 20, 850, "TC", "TC"),
        new("ultra-trail-marao-2026", "ultra-trail-marao-2026", "Ultra Trail", 45, 2500, "UT", "UT"),
        new("figueira-ultra-trail-2026", "figueira-ultra-trail-2026", "Ultra Trail", 50, 2200, "UT", "UT"),
        new("trans-peneda-geres-2026", "trans-peneda-geres-2026", "Ultra Trail Endurance", 105, 6500, "UTE", "UTE")
    ];

    /// <summary>
    /// All configured circuits available for race association.
    /// </summary>
    public IReadOnlyCollection<Circuit> Circuits => _circuits;

    /// <summary>
    /// Current many-to-many race/circuit associations.
    /// </summary>
    public IReadOnlyCollection<RaceCircuit> RaceCircuits => _raceCircuits;

    /// <summary>
    /// Race catalog with distances and circuits resolved for client display.
    /// </summary>
    public IReadOnlyCollection<Race> Races => BuildRaces();

    private IReadOnlyCollection<Race> BuildRaces()
    {
        var circuitsById = _circuits.ToDictionary(circuit => circuit.Id);
        var distancesByRaceId = _distances.GroupBy(distance => distance.RaceId).ToDictionary(
            group => group.Key,
            group => group.OrderBy(distance => distance.DistanceKm).ToArray() as IReadOnlyCollection<RaceDistance>);
        var circuitIdsByRaceId = _raceCircuits.GroupBy(raceCircuit => raceCircuit.RaceId).ToDictionary(
            group => group.Key,
            group => group.Select(raceCircuit => raceCircuit.CircuitId).ToArray());

        return
        [
            CreateRace("algarve-xtreme-trail-2026", "Algarve Xtreme Trail", new DateTime(2026, 1, 25, 7, 0, 0), "Querenca", "Faro", "Loule", "AA Algarve", "confirmed"),
            CreateRace("trail-rio-paiva-2026", "Trail do Rio Paiva", new DateTime(2026, 3, 15, 9, 0, 0), "Castelo de Paiva", "Aveiro", "Castelo de Paiva", "ATRP", "confirmed"),
            CreateRace("alcanena-trail-2026", "Alcanena Trail", new DateTime(2026, 3, 22, 9, 0, 0), "Alcanena", "Santarem", "Alcanena", "ATRP", "confirmed"),
            CreateRace("ultra-trail-marao-2026", "Ultra Trail do Marao", new DateTime(2026, 3, 27, 6, 0, 0), "Amarante", "Porto", "Amarante", "UTM Organization", "confirmed"),
            CreateRace("figueira-ultra-trail-2026", "Figueira Ultra Trail", new DateTime(2026, 4, 4, 7, 0, 0), "Figueira da Foz", "Coimbra", "Figueira da Foz", "FUT Organization", "confirmed"),
            CreateRace("trans-peneda-geres-2026", "Trans Peneda-Geres", new DateTime(2026, 5, 2, 6, 0, 0), "Montalegre", "Vila Real", "Montalegre", "TPG Organization", "confirmed"),
            CreateRace("lobo-iberico-trail-2026", "Lobo Iberico Trail", new DateTime(2026, 5, 3, 9, 0, 0), "Malveira", "Lisboa", "Mafra", "Local Organization", "announced"),
            CreateRace("trail-demonios-lizandro-2026", "Trail Demonios do Lizandro", new DateTime(2026, 11, 6, 20, 0, 0), "Sintra", "Lisboa", "Sintra", "Local Organization", "announced")
        ];

        Race CreateRace(
            string id,
            string name,
            DateTime date,
            string location,
            string district,
            string municipality,
            string organizer,
            string status)
        {
            var raceCircuits = (circuitIdsByRaceId.GetValueOrDefault(id) ?? [])
                .Select(circuitId => circuitsById[circuitId])
                .ToArray();

            return new Race(
                id,
                name,
                date,
                location,
                district,
                municipality,
                organizer,
                status,
                distancesByRaceId.GetValueOrDefault(id) ?? [],
                raceCircuits);
        }
    }
}
