using PT.Shared.Models.Intake;
using PT.Shared.Models.AutoGen;
using System.Threading.Tasks;

namespace PT.Api.Modules.Infrastructure;

public interface IGoogleSheetsService
{
    Task AppendClientAsync(ClientProfile client);
    Task AppendDealAsync(ClientProfile client, GeneratedPlanResult plan);
}
