using System.Net.Http.Json;
using PT.Shared.Models.Intake;
using PT.Shared.Models.AutoGen;
using PT.Shared.Models.DealClosing;
using System.Threading.Tasks;
using System.Net.Http;

namespace PT.Client.Services;

public class PTApiClient
{
    private readonly HttpClient _httpClient;

    public PTApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<GeneratedPlanResult?> GeneratePlanAsync(ClientProfile profile)
    {
        var response = await _httpClient.PostAsJsonAsync("api/autogen/generate-plan", profile);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<GeneratedPlanResult>();
    }

    public async Task<string> SaveIntakeAsync(ClientProfile profile)
    {
        var response = await _httpClient.PostAsJsonAsync("api/intake", profile);
        response.EnsureSuccessStatusCode();
        return "Saved Successfully";
    }

    public async Task<string> CloseDealAsync(CloseDealRequest request)
    {
        var response = await _httpClient.PostAsJsonAsync("api/deal/close", request);
        response.EnsureSuccessStatusCode();
        return "Deal Closed Successfully";
    }
}
