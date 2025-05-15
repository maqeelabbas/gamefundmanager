using GameFundManager.Application.Common;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GameFundManager.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public abstract class BaseApiController : ControllerBase
{
    protected Guid GetCurrentUserId()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            return Guid.Empty;
        }

        if (Guid.TryParse(userId, out Guid result))
        {
            return result;
        }

        return Guid.Empty;
    }

    protected IActionResult HandleApiResponse<T>(ApiResponse<T> response)
    {
        if (response.Success)
        {
            return Ok(response);
        }

        if (response.Errors != null && response.Errors.Any())
        {
            return BadRequest(response);
        }

        return NotFound(response);
    }
}
