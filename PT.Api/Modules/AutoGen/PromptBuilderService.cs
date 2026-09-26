using PT.Shared.Models.Intake;
using System.Text;

namespace PT.Api.Modules.AutoGen;

public class PromptBuilderService
{
    public string BuildSystemPrompt(ClientProfile client)
    {
        var sb = new StringBuilder();

        sb.AppendLine("You are an Elite Personal Trainer and Nutritionist. Your task is to generate a structured JSON object containing a WorkoutPlan and a NutritionPlan for the client.");
        sb.AppendLine("STRICT REQUIREMENT: You must respond ONLY with raw, valid JSON. Do not include markdown formatting like ```json or ```. Do not include any conversational text.");

        sb.AppendLine("\n### CLIENT PROFILE ###");
        sb.AppendLine($"- Name: {client.Name}");
        sb.AppendLine($"- Age: {client.Age}");
        sb.AppendLine($"- Available Days: {string.Join(", ", client.AvailableDays)}");
        sb.AppendLine($"- Training History: {client.TrainingHistory}");
        sb.AppendLine($"- Primary Goal: {client.Goals.PrimaryGoal}");
        sb.AppendLine($"- Target Physique: {client.Goals.TargetPhysique}");

        sb.AppendLine("\n### INBODY METRICS ###");
        sb.AppendLine($"- Weight: {client.Metrics.WeightKg} kg");
        sb.AppendLine($"- Height: {client.Metrics.HeightCm} cm");
        sb.AppendLine($"- Body Fat: {client.Metrics.BodyFatPercentage}%");
        sb.AppendLine($"- Skeletal Muscle: {client.Metrics.SkeletalMuscleKg} kg");

        sb.AppendLine("\n### MEDICAL CONSTRAINTS (CRITICAL) ###");
        if (client.Medical.HasJointIssues) sb.AppendLine($"- JOINT ISSUES: {client.Medical.JointIssueDetails}. STRICTLY AVOID EXERCISES THAT AGGRAVATE THIS.");
        if (client.Medical.HasCardioIssues) sb.AppendLine($"- CARDIO ISSUES: {client.Medical.CardioIssueDetails}. ADJUST INTENSITY ACCORDINGLY.");
        if (client.Medical.OtherInjuries.Any()) sb.AppendLine($"- OTHER INJURIES: {string.Join(", ", client.Medical.OtherInjuries)}.");

        sb.AppendLine("\n### WORKOUT LOGIC CONSTRAINTS ###");
        sb.AppendLine("- Utilize high-volume bodybuilding principles.");
        sb.AppendLine("- Include antagonistic supersets for muscle pump.");
        sb.AppendLine("- Optimize rest times to trigger 'Flow State' (e.g., 45-60s for hypertrophy, shorter for supersets).");

        sb.AppendLine("\n### NUTRITION LOGIC CONSTRAINTS ###");
        sb.AppendLine("- Create a highly restricted, realistic meal plan.");
        sb.AppendLine("- Permitted main protein sources: beef, boiled eggs, chicken breast, soy milk.");
        sb.AppendLine("- Ensure exact micro-nutrient tracking is considered implicitly via whole foods.");
        sb.AppendLine("- Strict water intake rule: 3.5 - 4L/day.");

        sb.AppendLine("\n### JSON OUTPUT FORMAT EXPECTED ###");
        sb.AppendLine(@"{
  ""Workout"": {
    ""Days"": [
      {
        ""DayName"": ""Monday"",
        ""FocusArea"": ""Chest & Back"",
        ""Exercises"": [
          { ""Name"": ""Bench Press"", ""Sets"": 4, ""Reps"": ""10-12"", ""RestTime"": ""60s"", ""Notes"": ""Focus on eccentric"" }
        ]
      }
    ]
  },
  ""Nutrition"": {
    ""DailyCalories"": 2500,
    ""ProteinGrams"": 200,
    ""CarbsGrams"": 250,
    ""FatGrams"": 70,
    ""WaterIntake"": ""4L"",
    ""Meals"": [
      { ""Name"": ""Breakfast"", ""Items"": [""4 Boiled Eggs"", ""1 cup Soy Milk""] }
    ]
  }
}");

        return sb.ToString();
    }
}
