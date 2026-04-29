using Microsoft.AspNetCore.Mvc;
using RacePlanner.Api.Models;
using RacePlanner.Api.Services;

namespace RacePlanner.Api.Controllers;

[ApiController]
[Route("api/circuits")]
public sealed class CircuitsController : ControllerBase
{
    private readonly RaceCatalog _catalog;

    public CircuitsController(RaceCatalog catalog)
    {
        _catalog = catalog;
    }

    [HttpGet]
    public ActionResult<IReadOnlyCollection<Circuit>> GetCircuits()
    {
        return Ok(_catalog.Circuits);
    }
}
