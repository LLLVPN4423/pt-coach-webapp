/**
 * Builds compact free datasets for PT Desk from open sources:
 * - free-exercise-db (CC0 / public domain exercise JSON + images on GitHub)
 * - Curated VN/common foods with macros (USDA-style per 100g / typical servings)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dataDir = path.join(root, "src", "data");
const FED =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

const MUSCLE_MAP = {
  abdominals: "core",
  abductors: "legs",
  adductors: "legs",
  biceps: "arms",
  calves: "legs",
  chest: "chest",
  forearms: "arms",
  glutes: "posterior",
  hamstrings: "posterior",
  lats: "back",
  lowerBack: "posterior",
  middleBack: "back",
  neck: "shoulders",
  quadriceps: "legs",
  shoulders: "shoulders",
  traps: "back",
  triceps: "arms",
};

const JOINT_RISK = {
  knees: ["knee"],
  legs: ["knee"],
  lowerBack: ["lower_back"],
  shoulders: ["shoulder"],
  neck: ["neck"],
  wrists: ["wrist"],
};

function mapMuscle(primary = []) {
  const m = primary[0];
  return MUSCLE_MAP[m] || "full";
}

function avoidJoints(primary = [], name = "") {
  const set = new Set();
  for (const p of primary) {
    if (p === "lowerBack") set.add("lower_back");
    if (p === "shoulders" || p === "neck") set.add("shoulder");
    if (["quadriceps", "hamstrings", "calves", "abductors", "adductors"].includes(p))
      set.add("knee");
  }
  const n = name.toLowerCase();
  if (n.includes("squat") || n.includes("lunge") || n.includes("jump")) set.add("knee");
  if (n.includes("deadlift") || n.includes("good morning")) set.add("lower_back");
  if (n.includes("press") && n.includes("shoulder")) set.add("shoulder");
  if (n.includes("push-up") || n.includes("plank")) set.add("wrist");
  return [...set];
}

function eq(equipment) {
  if (!equipment || equipment === "body only") return "bodyweight";
  if (equipment.includes("dumbbell")) return "dumbbell";
  if (equipment.includes("barbell")) return "barbell";
  if (equipment.includes("machine") || equipment.includes("cable")) return "machine";
  if (equipment.includes("bands")) return "band";
  return "any";
}

const rawPath = path.join(dataDir, "exercises-raw.json");
const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
const list = Array.isArray(raw) ? raw : Object.values(raw);

const catalog = [];
for (const e of list) {
  if (!e?.name || !e?.images?.[0]) continue;
  if (e.category === "olympic weightlifting" || e.category === "strongman") continue;
  if (e.level === "expert") continue;

  const muscle = mapMuscle(e.primaryMuscles);
  const imageUrl = `${FED}/${e.images[0]}`;
  const videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${e.name} proper form tutorial`,
  )}`;

  catalog.push({
    id: e.id || e.name.replace(/\W+/g, "_").toLowerCase(),
    name: e.name,
    muscle,
    primaryMuscles: e.primaryMuscles || [],
    secondaryMuscles: e.secondaryMuscles || [],
    equipment: eq(e.equipment),
    level: e.level === "intermediate" ? "intermediate" : "beginner",
    category: e.category || "strength",
    force: e.force || null,
    mechanic: e.mechanic || null,
    jointFriendly: !/(jump|plyo|snatch|clean|kipping)/i.test(e.name),
    lowImpact: !/(jump|sprint|burpee|box jump)/i.test(e.name),
    avoidJoints: avoidJoints(e.primaryMuscles, e.name),
    cues: (e.instructions || []).slice(0, 4),
    imageUrl,
    videoUrl,
  });
}

catalog.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(
  path.join(dataDir, "exercises-catalog.json"),
  JSON.stringify(catalog),
);

// --- Foods: curated VN + common pantry (per typical serving + per100g) ---
// Values approximate public FCT/USDA references for planning — not lab-certified.
const foods = [
  { id: "com_trang", name: "Cơm trắng", nameEn: "White rice cooked", group: "carb", servingG: 150, kcal: 195, protein: 4, carbs: 42, fat: 0.4, allergens: [], tags: ["vn", "bữa chính"] },
  { id: "com_lut", name: "Cơm gạo lứt", nameEn: "Brown rice", group: "carb", servingG: 150, kcal: 170, protein: 4, carbs: 35, fat: 1.5, allergens: [], tags: ["vn", "xơ"] },
  { id: "khoai_lang", name: "Khoai lang luộc", nameEn: "Boiled sweet potato", group: "carb", servingG: 150, kcal: 130, protein: 2, carbs: 30, fat: 0.2, allergens: [], tags: ["vn"] },
  { id: "banh_mi", name: "Bánh mì (lát)", nameEn: "Bread slice", group: "carb", servingG: 50, kcal: 130, protein: 4, carbs: 24, fat: 1.5, allergens: ["gluten"], tags: ["vn"] },
  { id: "bun", name: "Bún tươi", nameEn: "Rice vermicelli", group: "carb", servingG: 150, kcal: 160, protein: 2.5, carbs: 36, fat: 0.3, allergens: [], tags: ["vn"] },
  { id: "pho_banh", name: "Bánh phở", nameEn: "Pho noodles", group: "carb", servingG: 150, kcal: 165, protein: 3, carbs: 37, fat: 0.3, allergens: [], tags: ["vn"] },
  { id: "yen_mach", name: "Yến mạch nấu", nameEn: "Oatmeal cooked", group: "carb", servingG: 200, kcal: 150, protein: 5, carbs: 27, fat: 3, allergens: ["gluten"], tags: ["sáng"] },
  { id: "uc_ga", name: "Ức gà nướng", nameEn: "Chicken breast", group: "protein", servingG: 120, kcal: 200, protein: 37, carbs: 0, fat: 4, allergens: [], tags: ["lean"] },
  { id: "thit_bo", name: "Thịt bò nạc", nameEn: "Lean beef", group: "protein", servingG: 100, kcal: 180, protein: 26, carbs: 0, fat: 8, allergens: [], tags: ["vn"] },
  { id: "ca_basa", name: "Cá basa hấp", nameEn: "Pangasius steamed", group: "protein", servingG: 120, kcal: 140, protein: 22, carbs: 0, fat: 5, allergens: ["cá"], tags: ["vn"] },
  { id: "ca_hoi", name: "Cá hồi", nameEn: "Salmon", group: "protein", servingG: 100, kcal: 208, protein: 20, carbs: 0, fat: 13, allergens: ["cá"], tags: ["omega3"] },
  { id: "trung_ga", name: "Trứng gà luộc", nameEn: "Boiled egg", group: "protein", servingG: 50, kcal: 78, protein: 6.5, carbs: 0.5, fat: 5.3, allergens: ["trứng"], tags: ["rẻ"] },
  { id: "dau_phu", name: "Đậu phụ", nameEn: "Tofu firm", group: "protein", servingG: 120, kcal: 145, protein: 16, carbs: 3, fat: 8, allergens: ["đậu nành"], tags: ["chay"] },
  { id: "tom", name: "Tôm luộc", nameEn: "Shrimp", group: "protein", servingG: 100, kcal: 99, protein: 24, carbs: 0, fat: 0.3, allergens: ["giáp xác"], tags: ["vn"] },
  { id: "sua_chua", name: "Sữa chua Hy Lạp", nameEn: "Greek yogurt", group: "protein", servingG: 150, kcal: 130, protein: 15, carbs: 6, fat: 4, allergens: ["sữa"], tags: ["snack"] },
  { id: "sua_dau", name: "Sữa đậu nành", nameEn: "Soy milk", group: "protein", servingG: 250, kcal: 100, protein: 7, carbs: 8, fat: 4, allergens: ["đậu nành"], tags: ["vn", "chay"] },
  { id: "whey", name: "Whey protein (1 scoop)", nameEn: "Whey scoop", group: "protein", servingG: 30, kcal: 120, protein: 24, carbs: 3, fat: 1.5, allergens: ["sữa"], tags: ["bổ sung"] },
  { id: "rau_muong", name: "Rau muống xào", nameEn: "Morning glory", group: "veg", servingG: 150, kcal: 60, protein: 3, carbs: 6, fat: 3, allergens: [], tags: ["vn"] },
  { id: "rau_luoc", name: "Rau củ luộc hỗn hợp", nameEn: "Mixed boiled veg", group: "veg", servingG: 200, kcal: 70, protein: 3, carbs: 12, fat: 0.5, allergens: [], tags: ["xơ"] },
  { id: "salad", name: "Salad xanh + dầu oliu", nameEn: "Green salad", group: "veg", servingG: 150, kcal: 90, protein: 2, carbs: 6, fat: 7, allergens: [], tags: [] },
  { id: "chuoi", name: "Chuối", nameEn: "Banana", group: "fruit", servingG: 120, kcal: 105, protein: 1.3, carbs: 27, fat: 0.4, allergens: [], tags: ["tiện"] },
  { id: "tao", name: "Táo", nameEn: "Apple", group: "fruit", servingG: 150, kcal: 80, protein: 0.4, carbs: 21, fat: 0.3, allergens: [], tags: [] },
  { id: "du_du", name: "Đu đủ", nameEn: "Papaya", group: "fruit", servingG: 150, kcal: 60, protein: 0.7, carbs: 15, fat: 0.2, allergens: [], tags: ["vn"] },
  { id: "bo_vn", name: "Bơ", nameEn: "Avocado", group: "fat", servingG: 70, kcal: 115, protein: 1.5, carbs: 6, fat: 10, allergens: [], tags: ["healthy fat"] },
  { id: "dau_phong", name: "Đậu phộng rang", nameEn: "Peanuts", group: "fat", servingG: 30, kcal: 170, protein: 7, carbs: 5, fat: 14, allergens: ["đậu phộng"], tags: ["snack"] },
  { id: "dau_oli u", name: "Dầu oliu (1 tbsp)", nameEn: "Olive oil", group: "fat", servingG: 14, kcal: 120, protein: 0, carbs: 0, fat: 14, allergens: [], tags: [] },
  { id: "nuoc", name: "Nước lọc", nameEn: "Water", group: "drink", servingG: 250, kcal: 0, protein: 0, carbs: 0, fat: 0, allergens: [], tags: [] },
  { id: "ca_phe_den", name: "Cà phê đen", nameEn: "Black coffee", group: "drink", servingG: 150, kcal: 2, protein: 0, carbs: 0, fat: 0, allergens: [], tags: ["vn"] },
  { id: "sua_tuoi", name: "Sữa tươi không đường", nameEn: "Milk low-fat", group: "drink", servingG: 250, kcal: 110, protein: 8, carbs: 12, fat: 2.5, allergens: ["sữa"], tags: [] },
  { id: "canh_chua", name: "Canh chua (tô)", nameEn: "Sour soup bowl", group: "meal", servingG: 350, kcal: 180, protein: 15, carbs: 12, fat: 6, allergens: ["cá"], tags: ["vn", "bữa"] },
  { id: "goi_ga", name: "Gỏi gà", nameEn: "Chicken salad VN", group: "meal", servingG: 250, kcal: 220, protein: 25, carbs: 10, fat: 8, allergens: [], tags: ["vn"] },
  { id: "com_ga", name: "Cơm gà (phần vừa)", nameEn: "Chicken rice", group: "meal", servingG: 400, kcal: 520, protein: 32, carbs: 55, fat: 16, allergens: [], tags: ["vn", "ngoài"] },
  { id: "banh_mi_thit", name: "Bánh mì thịt", nameEn: "Banh mi", group: "meal", servingG: 220, kcal: 420, protein: 18, carbs: 48, fat: 16, allergens: ["gluten"], tags: ["vn", "nhanh"] },
  { id: "pho_bo", name: "Phở bò (tô)", nameEn: "Pho beef", group: "meal", servingG: 550, kcal: 450, protein: 28, carbs: 50, fat: 12, allergens: [], tags: ["vn"] },
  { id: "bun_cha", name: "Bún chả", nameEn: "Bun cha", group: "meal", servingG: 450, kcal: 550, protein: 30, carbs: 55, fat: 20, allergens: [], tags: ["vn"] },
  { id: "trung_sua_chua_chuoi", name: "Combo sáng: trứng + sữa chua + chuối", nameEn: "Breakfast combo", group: "meal", servingG: 320, kcal: 310, protein: 23, carbs: 35, fat: 10, allergens: ["trứng", "sữa"], tags: ["sáng"] },
];

// fix typo key
const foodsClean = foods.map((f) =>
  f.id === "dau_oli u" ? { ...f, id: "dau_oliu" } : f,
);

fs.writeFileSync(
  path.join(dataDir, "foods-catalog.json"),
  JSON.stringify({
    source:
      "Curated VN/common foods for PT Desk planning; macros approximate public FCT/USDA-style values per serving. Not medical advice.",
    licenseNote: "Original Vietnamese FCT © NIN; this curated subset is approximate planning data.",
    foods: foodsClean,
  }),
);

console.log(`exercises: ${catalog.length}`);
console.log(`foods: ${foodsClean.length}`);
