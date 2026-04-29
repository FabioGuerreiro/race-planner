using Microsoft.AspNetCore.Mvc;
using RacePlanner.Api.Models;
using RacePlanner.Api.Services;

namespace RacePlanner.Api.Controllers;

[ApiController]
[Route("api/race-circuits")]
public sealed class RaceCircuitsController : ControllerBase
{
    private readonly RaceCatalog _catalog;

    public RaceCircuitsController(RaceCatalog catalog)
    {
        _catalog = catalog;
    }

    [HttpGet]
    public ActionResult<IReadOnlyCollection<RaceCircuit>> GetRaceCircuits()
    {
        return Ok(_catalog.RaceCircuits);
    }
}
