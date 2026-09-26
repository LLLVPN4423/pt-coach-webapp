using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PT.Api.Modules.Infrastructure;
using PT.Shared.Models.Intake;
using Microsoft.AspNetCore.Mvc;

namespace PT.Api.Modules.Intake;

public static class IntakeEndpoints
{
    public static void MapIntakeEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/intake").WithTags("Intake");

        group.MapPost("/", async ([FromBody] ClientProfile profile, [FromServices] IGoogleSheetsService sheetsService) =>
        {
            if (profile == null)
            {
                return Results.BadRequest("Invalid client profile data.");
            }

            try
            {
                await sheetsService.AppendClientAsync(profile);
                return Results.Ok(new { Message = "Client profile saved successfully", ClientId = profile.Id });
            }
            catch (System.Exception ex)
            {
                return Results.Problem($"An error occurred while saving the profile: {ex.Message}");
            }
        });
    }
}
