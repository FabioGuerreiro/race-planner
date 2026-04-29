using Microsoft.AspNetCore.Mvc;
using RacePlanner.Api.Models;
using RacePlanner.Api.Services;

namespace RacePlanner.Api.Controllers;

[ApiController]
[Route("api/races")]
public sealed class RacesController : ControllerBase
{
    private readonly RaceCatalog _catalog;

    public RacesController(RaceCatalog catalog)
    {
        _catalog = catalog;
    }

    [HttpGet]
    public ActionResult<IReadOnlyCollection<Race>> GetRaces()
    {
        return Ok(_catalog.Races);
    }

    [HttpGet("{id}")]
    public ActionResult<Race> GetRace(string id)
    {
        var race = _catalog.Races.FirstOrDefault(race => race.Id == id);

        return race is null ? NotFound() : Ok(race);
    }
}
