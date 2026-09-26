using PT.Shared.Models.AutoGen;
using PT.Shared.Models.Intake;
using System.Threading.Tasks;

namespace PT.Api.Modules.AutoGen;

public interface ILLMReasoningService
{
    Task<GeneratedPlanResult> GeneratePlanAsync(ClientProfile clientProfile, string systemPrompt);
}
