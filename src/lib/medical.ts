import type { MedicalCondition, MedicalFlags, Profile } from "./types";
import { CONDITION_LABELS, JOINT_LABELS } from "./types";

export function emptyMedical(): MedicalFlags {
  return {
    conditions: [],
    jointZones: [],
    jointNotes: "",
    cardioNotes: "",
    medicationNotes: "",
    otherNotes: "",
    disclaimerAccepted: false,
    hasRedFlags: false,
    redFlagNotes: "",
    clinicianCleared: false,
  };
}

/** Normalize older localStorage shapes if any. */
export function normalizeMedical(raw: unknown): MedicalFlags {
  const base = emptyMedical();
  if (!raw || typeof raw !== "object") return base;
  const m = raw as Partial<MedicalFlags> & {
    jointIssues?: boolean;
    cardioIssues?: boolean;
  };
  return {
    ...base,
    ...m,
    conditions: Array.isArray(m.conditions) ? m.conditions : [],
    jointZones: Array.isArray(m.jointZones)
      ? m.jointZones
      : m.jointIssues
        ? (["knee"] as MedicalFlags["jointZones"])
        : [],
    disclaimerAccepted: Boolean(m.disclaimerAccepted),
    hasRedFlags: Boolean(m.hasRedFlags),
    clinicianCleared: Boolean(m.clinicianCleared),
    jointNotes: m.jointNotes ?? "",
    cardioNotes:
      m.cardioNotes ??
      (m.cardioIssues ? "Hạn chế tim mạch (từ phiên bản cũ)" : ""),
    medicationNotes: m.medicationNotes ?? "",
    otherNotes: m.otherNotes ?? "",
    redFlagNotes: m.redFlagNotes ?? "",
  };
}

export function requiresClinicianClearance(m: MedicalFlags): boolean {
  const high: MedicalCondition[] = [
    "heart_disease",
    "pregnancy",
    "recent_surgery",
    "herniated_disc",
    "dizziness",
    "eating_disorder_history",
  ];
  return (
    m.hasRedFlags ||
    m.conditions.some((c) => high.includes(c)) ||
    m.conditions.includes("hypertension") ||
    m.conditions.includes("osteoporosis")
  );
}

export function medicalPlanNotes(profile: Profile): string[] {
  const m = profile.medical;
  const notes: string[] = [
    "PT Desk không phải tư vấn y tế. Dừng ngay nếu đau nhói, tức ngực, khó thở bất thường.",
  ];

  if (m.hasRedFlags) {
    notes.push(
      `Cờ đỏ đã khai báo${m.redFlagNotes ? `: ${m.redFlagNotes}` : ""}. Ưu tiên khám trước khi tăng tải.`,
    );
  }

  for (const c of m.conditions) {
    switch (c) {
      case "hypertension":
        notes.push(
          "Cao huyết áp: tránh nín thở / Valsalva; cardio Zone 2; không max effort.",
        );
        break;
      case "heart_disease":
        notes.push(
          "Bệnh tim: chỉ tập theo chỉ định bác sĩ; cường độ nhẹ–vừa.",
        );
        break;
      case "diabetes":
        notes.push(
          "Tiểu đường: mang nguồn đường nhanh khi tập; theo dõi đường huyết quanh buổi tập.",
        );
        break;
      case "asthma":
        notes.push(
          "Hen: khởi động dài hơn; có thuốc cắt cơn trong tầm tay; tránh không khí lạnh khô nếu kích thích.",
        );
        break;
      case "pregnancy":
        notes.push(
          "Mang thai/sau sinh: tránh nằm ngửa lâu (tam cá nguyệt 2–3), không bài va đập/valsalva; cần clearance sản khoa.",
        );
        break;
      case "herniated_disc":
        notes.push(
          "Thoát vị: ưu tiên hinge có kiểm soát, tránh cúi xoắn có tải; dừng nếu lan chân.",
        );
        break;
      case "osteoporosis":
        notes.push(
          "Loãng xương: tránh gập/xoắn cột sống có tải nặng; ưu tiên đứng vững và máy có dẫn hướng.",
        );
        break;
      case "recent_surgery":
        notes.push(
          "Phẫu thuật gần đây: chỉ ROM và tải được bác sĩ/PT cho phép.",
        );
        break;
      case "dizziness":
        notes.push(
          "Chóng mặt khi gắng sức: tránh HIIT/đảo ngược đầu; ngồi nghỉ nếu hoa mắt.",
        );
        break;
      case "eating_disorder_history":
        notes.push(
          "Tiền sử rối loạn ăn uống: không cắt calo gắt; tập trung sức khỏe và thói quen, không theo dõi ám ảnh cân.",
        );
        break;
    }
  }

  if (m.jointZones.length) {
    notes.push(
      `Khớp cần bảo vệ: ${m.jointZones.map((j) => JOINT_LABELS[j]).join(", ")}. Đã lọc bài dễ kích thích.`,
    );
  }
  if (m.jointNotes.trim()) notes.push(`Ghi chú khớp: ${m.jointNotes.trim()}`);
  if (m.cardioNotes.trim()) notes.push(`Ghi chú tim mạch: ${m.cardioNotes.trim()}`);
  if (m.medicationNotes.trim())
    notes.push(`Thuốc đang dùng (tự khai): ${m.medicationNotes.trim()}`);
  if (m.otherNotes.trim()) notes.push(m.otherNotes.trim());

  if (requiresClinicianClearance(m) && !m.clinicianCleared) {
    notes.unshift(
      "⚠ Chưa xác nhận đã được bác sĩ/PT cho phép tập với các điều kiện đã chọn — giữ volume thấp.",
    );
  }

  return notes;
}

export function medicalSummaryChips(m: MedicalFlags): string[] {
  const chips = m.conditions.map((c) => CONDITION_LABELS[c]);
  chips.push(...m.jointZones.map((j) => `Khớp: ${JOINT_LABELS[j]}`));
  if (m.hasRedFlags) chips.unshift("Cờ đỏ");
  return chips;
}
