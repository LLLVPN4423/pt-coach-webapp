namespace PT.Shared.Models.Intake;

public class ClientProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public int Age { get; set; }
    public decimal Budget { get; set; }
    public List<string> AvailableDays { get; set; } = new();
    public string TrainingHistory { get; set; } = string.Empty;

    public InbodyMetrics Metrics { get; set; } = new();
    public MedicalConditions Medical { get; set; } = new();
    public FitnessGoals Goals { get; set; } = new();
}
