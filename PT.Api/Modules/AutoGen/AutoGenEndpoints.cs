using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using PT.Shared.Models.Intake;
using Microsoft.AspNetCore.Mvc;

namespace PT.Api.Modules.AutoGen;

public static class AutoGenEndpoints
{
    public static void MapAutoGenEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/autogen").WithTags("AutoGen");

        group.MapPost("/generate-plan", async ([FromBody] ClientProfile profile,
            [FromServices] PromptBuilderService promptBuilder,
            [FromServices] ILLMReasoningService llmService) =>
        {
            if (profile == null)
            {
                return Results.BadRequest("Invalid client profile data.");
            }

            try
            {
                var prompt = promptBuilder.BuildSystemPrompt(profile);
                var plan = await llmService.GeneratePlanAsync(profile, prompt);
                return Results.Ok(plan);
            }
            catch (System.Exception ex)
            {
                return Results.Problem($"An error occurred during plan generation: {ex.Message}");
            }
        });
    }
}
