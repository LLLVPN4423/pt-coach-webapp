namespace PT.Shared.Models.AutoGen;

public class NutritionPlan
{
    public int DailyCalories { get; set; }
    public int ProteinGrams { get; set; }
    public int CarbsGrams { get; set; }
    public int FatGrams { get; set; }
    public string WaterIntake { get; set; } = string.Empty;
    public List<Meal> Meals { get; set; } = new();
}

public class Meal
{
    public string Name { get; set; } = string.Empty;
    public List<string> Items { get; set; } = new();
}
