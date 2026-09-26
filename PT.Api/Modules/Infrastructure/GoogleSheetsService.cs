using Google.Apis.Auth.OAuth2;
using Google.Apis.Services;
using Google.Apis.Sheets.v4;
using Google.Apis.Sheets.v4.Data;
using Microsoft.Extensions.Configuration;
using PT.Shared.Models.Intake;
using PT.Shared.Models.AutoGen;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace PT.Api.Modules.Infrastructure;

public class GoogleSheetsService : IGoogleSheetsService
{
    private readonly IConfiguration _configuration;
    private readonly string[] _scopes = { SheetsService.Scope.Spreadsheets };

    public GoogleSheetsService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    private async Task<SheetsService> GetSheetsServiceAsync()
    {
        GoogleCredential credential;
        var credPath = _configuration["Google:CredentialsPath"];

        if (!string.IsNullOrEmpty(credPath) && File.Exists(credPath))
        {
            using (var stream = new FileStream(credPath, FileMode.Open, FileAccess.Read))
            {
                credential = GoogleCredential.FromStream(stream).CreateScoped(_scopes);
            }
        }
        else
        {
            credential = await GoogleCredential.GetApplicationDefaultAsync();
            if (credential.IsCreateScopedRequired)
            {
                credential = credential.CreateScoped(_scopes);
            }
        }

        return new SheetsService(new BaseClientService.Initializer
        {
            HttpClientInitializer = credential,
            ApplicationName = "PTManagement System"
        });
    }

    public async Task AppendClientAsync(ClientProfile client)
    {
        var spreadsheetId = _configuration["Google:SpreadsheetId"];
        var range = "Clients!A:L";

        var service = await GetSheetsServiceAsync();

        var valueRange = new ValueRange();
        var oblist = new List<object>
        {
            client.Id.ToString(),
            client.Name,
            client.Age,
            client.Budget,
            string.Join(", ", client.AvailableDays),
            client.TrainingHistory,
            client.Metrics.WeightKg,
            client.Metrics.HeightCm,
            client.Metrics.BodyFatPercentage,
            client.Metrics.SkeletalMuscleKg,
            client.Medical.HasJointIssues ? "Yes" : "No",
            client.Goals.PrimaryGoal
        };
        valueRange.Values = new List<IList<object>> { oblist };

        var appendRequest = service.Spreadsheets.Values.Append(valueRange, spreadsheetId, range);
        appendRequest.ValueInputOption = SpreadsheetsResource.ValuesResource.AppendRequest.ValueInputOptionEnum.USERENTERED;

        await appendRequest.ExecuteAsync();
    }

    public async Task AppendDealAsync(ClientProfile client, GeneratedPlanResult plan)
    {
        var spreadsheetId = _configuration["Google:SpreadsheetId"];
        var service = await GetSheetsServiceAsync();

        // 1. Append Nutrition Summary
        var nutritionRange = "Nutrition!A:E";
        var nutritionValues = new ValueRange();
        nutritionValues.Values = new List<IList<object>>
        {
            new List<object> {
                client.Id.ToString(),
                plan.Nutrition.DailyCalories,
                plan.Nutrition.ProteinGrams,
                plan.Nutrition.CarbsGrams,
                plan.Nutrition.FatGrams
            }
        };
        var appendNutrition = service.Spreadsheets.Values.Append(nutritionValues, spreadsheetId, nutritionRange);
        appendNutrition.ValueInputOption = SpreadsheetsResource.ValuesResource.AppendRequest.ValueInputOptionEnum.USERENTERED;
        await appendNutrition.ExecuteAsync();

        // 2. Append Workout Summary (Flattened for simplicity in MVP)
        var workoutRange = "Workouts!A:C";
        var workoutValues = new ValueRange();
        foreach (var day in plan.Workout.Days)
        {
            foreach (var ex in day.Exercises)
            {
                workoutValues.Values = workoutValues.Values ?? new List<IList<object>>();
                workoutValues.Values.Add(new List<object> {
                    client.Id.ToString(),
                    day.DayName,
                    $"{ex.Name} ({ex.Sets}x{ex.Reps})"
                });
            }
        }

        if (workoutValues.Values != null && workoutValues.Values.Count > 0)
        {
            var appendWorkout = service.Spreadsheets.Values.Append(workoutValues, spreadsheetId, workoutRange);
            appendWorkout.ValueInputOption = SpreadsheetsResource.ValuesResource.AppendRequest.ValueInputOptionEnum.USERENTERED;
            await appendWorkout.ExecuteAsync();
        }
    }
}
