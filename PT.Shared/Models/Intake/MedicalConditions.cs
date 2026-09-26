namespace PT.Shared.Models.Intake;

public class MedicalConditions
{
    public bool HasJointIssues { get; set; }
    public string JointIssueDetails { get; set; } = string.Empty;
    public bool HasCardioIssues { get; set; }
    public string CardioIssueDetails { get; set; } = string.Empty;
    public List<string> OtherInjuries { get; set; } = new();
}
