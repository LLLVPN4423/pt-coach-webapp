namespace PT.Shared.Models.AutoGen;

public class WorkoutPlan
{
    public List<WorkoutDay> Days { get; set; } = new();
}

public class WorkoutDay
{
    public string DayName { get; set; } = string.Empty;
    public string FocusArea { get; set; } = string.Empty;
    public List<Exercise> Exercises { get; set; } = new();
}

public class Exercise
{
    public string Name { get; set; } = string.Empty;
    public int Sets { get; set; }
    public string Reps { get; set; } = string.Empty;
    public string RestTime { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}
