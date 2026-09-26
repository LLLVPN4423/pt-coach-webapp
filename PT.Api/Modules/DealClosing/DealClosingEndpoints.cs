using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PT.Api.Modules.Infrastructure;
using PT.Shared.Models.Intake;
using PT.Shared.Models.AutoGen;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace PT.Api.Modules.DealClosing;

public static class DealClosingEndpoints
{
    public class CloseDealRequest
    {
        public ClientProfile Profile { get; set; } = new();
        public GeneratedPlanResult Plan { get; set; } = new();
    }

    public static void MapDealClosingEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/deal").WithTags("DealClosing");

        group.MapPost("/close", async ([FromBody] CloseDealRequest request, [FromServices] IGoogleSheetsService sheetsService) =>
        {
            if (request == null || request.Profile == null || request.Plan == null)
            {
                return Results.BadRequest("Invalid deal data.");
            }

            try
            {
                // Note: Client might already be saved from Intake, but for this step we ensure all plan data is saved
                await sheetsService.AppendDealAsync(request.Profile, request.Plan);
                return Results.Ok(new { Message = "Deal closed successfully" });
            }
            catch (System.Exception ex)
            {
                return Results.Problem($"An error occurred while closing the deal: {ex.Message}");
            }
        });
    }
}
