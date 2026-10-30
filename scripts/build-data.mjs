/**
 * Builds compact free datasets for PT Desk from open sources:
 * - free-exercise-db (CC0 / public domain exercise JSON + images on GitHub)
 * - Curated VN/common foods with macros (USDA/FCT-style approx servings)
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

function mapMuscle(primary = []) {
  const m = primary[0];
  return MUSCLE_MAP[m] || "full";
}

function avoidJoints(primary = [], name = "") {
  const set = new Set();
  for (const p of primary) {
    if (p === "lowerBack") set.add("lower_back");
    if (p === "shoulders" || p === "neck") set.add("shoulder");
    if (
      ["quadriceps", "hamstrings", "calves", "abductors", "adductors"].includes(
        p,
      )
    )
      set.add("knee");
  }
  const n = name.toLowerCase();
  if (n.includes("squat") || n.includes("lunge") || n.includes("jump"))
    set.add("knee");
  if (n.includes("deadlift") || n.includes("good morning")) set.add("lower_back");
  if (n.includes("press") && n.includes("shoulder")) set.add("shoulder");
  if (n.includes("push-up") || n.includes("plank")) set.add("wrist");
  return [...set];
}

function eq(equipment) {
  if (!equipment || equipment === "body only") return "bodyweight";
  if (equipment.includes("dumbbell")) return "dumbbell";
  if (equipment.includes("barbell")) return "barbell";
  if (equipment.includes("machine") || equipment.includes("cable"))
    return "machine";
  if (equipment.includes("bands")) return "band";
  if (equipment.includes("kettlebell")) return "kettlebell";
  return "any";
}

const rawPath = path.join(dataDir, "exercises-raw.json");
const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
const list = Array.isArray(raw) ? raw : Object.values(raw);

const SKIP_CAT = new Set(["olympic weightlifting", "strongman"]);
const catalog = [];

for (const e of list) {
  if (!e?.name || !e?.images?.[0]) continue;
  if (SKIP_CAT.has(e.category)) continue;
  // Keep beginner + intermediate + expert for diversity (UI can filter)

  const muscle = mapMuscle(e.primaryMuscles);
  const imageUrl = `${FED}/${e.images[0]}`;
  const imageUrlAlt = e.images[1] ? `${FED}/${e.images[1]}` : undefined;
  const q = `${e.name} exercise proper form tutorial`;
  // YouTube search-as-playlist embed (free, no API key)
  const videoEmbedUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}`;
  const videoUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

  catalog.push({
    id: e.id || e.name.replace(/\W+/g, "_").toLowerCase(),
    name: e.name,
    muscle,
    primaryMuscles: e.primaryMuscles || [],
    secondaryMuscles: e.secondaryMuscles || [],
    equipment: eq(e.equipment),
    level: e.level || "beginner",
    category: e.category || "strength",
    force: e.force || null,
    mechanic: e.mechanic || null,
    jointFriendly: !/(jump|plyo|snatch|clean|kipping)/i.test(e.name),
    lowImpact: !/(jump|sprint|burpee|box jump)/i.test(e.name),
    avoidJoints: avoidJoints(e.primaryMuscles, e.name),
    cues: (e.instructions || []).slice(0, 5),
    imageUrl,
    imageUrlAlt,
    videoUrl,
    videoEmbedUrl,
  });
}

catalog.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(
  path.join(dataDir, "exercises-catalog.json"),
  JSON.stringify(catalog),
);

const foods = [
  // --- carbs ---
  { id: "com_trang", name: "Cơm trắng", nameEn: "White rice", group: "carb", servingG: 150, kcal: 195, protein: 4, carbs: 42, fat: 0.4, allergens: [], tags: ["vn", "bữa chính"] },
  { id: "com_lut", name: "Cơm gạo lứt", nameEn: "Brown rice", group: "carb", servingG: 150, kcal: 170, protein: 4, carbs: 35, fat: 1.5, allergens: [], tags: ["vn", "xơ"] },
  { id: "com_tim", name: "Cơm tím / gạo đỏ", nameEn: "Red rice", group: "carb", servingG: 150, kcal: 175, protein: 4, carbs: 36, fat: 1.2, allergens: [], tags: ["vn", "xơ"] },
  { id: "khoai_lang", name: "Khoai lang luộc", nameEn: "Sweet potato", group: "carb", servingG: 150, kcal: 130, protein: 2, carbs: 30, fat: 0.2, allergens: [], tags: ["vn"] },
  { id: "khoai_tay", name: "Khoai tây luộc", nameEn: "Potato boiled", group: "carb", servingG: 150, kcal: 130, protein: 3, carbs: 30, fat: 0.1, allergens: [], tags: [] },
  { id: "khoai_mon", name: "Khoai môn / sọ", nameEn: "Taro", group: "carb", servingG: 120, kcal: 110, protein: 1.5, carbs: 26, fat: 0.2, allergens: [], tags: ["vn"] },
  { id: "banh_mi", name: "Bánh mì (lát)", nameEn: "Bread slice", group: "carb", servingG: 50, kcal: 130, protein: 4, carbs: 24, fat: 1.5, allergens: ["gluten"], tags: ["vn"] },
  { id: "banh_mi_nguyen_cam", name: "Bánh mì nguyên cám", nameEn: "Whole wheat bread", group: "carb", servingG: 50, kcal: 120, protein: 5, carbs: 20, fat: 1.5, allergens: ["gluten"], tags: ["xơ"] },
  { id: "bun", name: "Bún tươi", nameEn: "Rice vermicelli", group: "carb", servingG: 150, kcal: 160, protein: 2.5, carbs: 36, fat: 0.3, allergens: [], tags: ["vn"] },
  { id: "mi_trung", name: "Mì trứng (nấu)", nameEn: "Egg noodles", group: "carb", servingG: 150, kcal: 200, protein: 7, carbs: 35, fat: 3, allergens: ["gluten", "trứng"], tags: ["vn"] },
  { id: "pho_banh", name: "Bánh phở", nameEn: "Pho noodles", group: "carb", servingG: 150, kcal: 165, protein: 3, carbs: 37, fat: 0.3, allergens: [], tags: ["vn"] },
  { id: "mien", name: "Miến dong", nameEn: "Glass noodles", group: "carb", servingG: 120, kcal: 140, protein: 0.5, carbs: 34, fat: 0, allergens: [], tags: ["vn"] },
  { id: "yen_mach", name: "Yến mạch nấu", nameEn: "Oatmeal", group: "carb", servingG: 200, kcal: 150, protein: 5, carbs: 27, fat: 3, allergens: ["gluten"], tags: ["sáng"] },
  { id: "ngu_coc", name: "Ngũ cốc ăn sáng", nameEn: "Breakfast cereal", group: "carb", servingG: 40, kcal: 150, protein: 3, carbs: 30, fat: 1.5, allergens: ["gluten"], tags: ["sáng"] },
  { id: "quinoa", name: "Quinoa nấu", nameEn: "Quinoa cooked", group: "carb", servingG: 150, kcal: 180, protein: 6, carbs: 32, fat: 3, allergens: [], tags: ["xơ"] },
  { id: "banh_gao", name: "Bánh gạo", nameEn: "Rice cake", group: "carb", servingG: 30, kcal: 110, protein: 2, carbs: 24, fat: 0.5, allergens: [], tags: ["snack"] },
  { id: "ngo", name: "Bắp luộc", nameEn: "Corn", group: "carb", servingG: 120, kcal: 115, protein: 3.5, carbs: 25, fat: 1.5, allergens: [], tags: ["vn"] },
  // --- protein ---
  { id: "uc_ga", name: "Ức gà nướng", nameEn: "Chicken breast", group: "protein", servingG: 120, kcal: 200, protein: 37, carbs: 0, fat: 4, allergens: [], tags: ["lean"] },
  { id: "dui_ga", name: "Đùi gà bỏ da", nameEn: "Chicken thigh", group: "protein", servingG: 120, kcal: 210, protein: 28, carbs: 0, fat: 10, allergens: [], tags: ["vn"] },
  { id: "thit_bo", name: "Thịt bò nạc", nameEn: "Lean beef", group: "protein", servingG: 100, kcal: 180, protein: 26, carbs: 0, fat: 8, allergens: [], tags: ["vn"] },
  { id: "thit_heo_nac", name: "Thịt heo nạc", nameEn: "Lean pork", group: "protein", servingG: 100, kcal: 165, protein: 27, carbs: 0, fat: 6, allergens: [], tags: ["vn"] },
  { id: "thit_bo_bam", name: "Thịt bò bằm nạc", nameEn: "Lean ground beef", group: "protein", servingG: 100, kcal: 170, protein: 25, carbs: 0, fat: 7, allergens: [], tags: [] },
  { id: "ca_basa", name: "Cá basa hấp", nameEn: "Pangasius", group: "protein", servingG: 120, kcal: 140, protein: 22, carbs: 0, fat: 5, allergens: ["cá"], tags: ["vn"] },
  { id: "ca_hoi", name: "Cá hồi", nameEn: "Salmon", group: "protein", servingG: 100, kcal: 208, protein: 20, carbs: 0, fat: 13, allergens: ["cá"], tags: ["omega3"] },
  { id: "ca_thu", name: "Cá thu", nameEn: "Mackerel", group: "protein", servingG: 100, kcal: 190, protein: 20, carbs: 0, fat: 12, allergens: ["cá"], tags: ["omega3", "vn"] },
  { id: "ca_chim", name: "Cá chim", nameEn: "Pomfret", group: "protein", servingG: 100, kcal: 150, protein: 22, carbs: 0, fat: 6, allergens: ["cá"], tags: ["vn"] },
  { id: "trung_ga", name: "Trứng gà luộc", nameEn: "Boiled egg", group: "protein", servingG: 50, kcal: 78, protein: 6.5, carbs: 0.5, fat: 5.3, allergens: ["trứng"], tags: ["rẻ", "sáng"] },
  { id: "trung_vit", name: "Trứng vịt", nameEn: "Duck egg", group: "protein", servingG: 70, kcal: 130, protein: 9, carbs: 1, fat: 10, allergens: ["trứng"], tags: ["vn"] },
  { id: "long_trang", name: "Lòng trắng trứng (3)", nameEn: "Egg whites", group: "protein", servingG: 100, kcal: 52, protein: 11, carbs: 0.7, fat: 0.2, allergens: ["trứng"], tags: ["lean"] },
  { id: "dau_phu", name: "Đậu phụ", nameEn: "Tofu firm", group: "protein", servingG: 120, kcal: 145, protein: 16, carbs: 3, fat: 8, allergens: ["đậu nành"], tags: ["chay"] },
  { id: "tempeh", name: "Tempeh", nameEn: "Tempeh", group: "protein", servingG: 100, kcal: 190, protein: 19, carbs: 9, fat: 11, allergens: ["đậu nành"], tags: ["chay"] },
  { id: "tom", name: "Tôm luộc", nameEn: "Shrimp", group: "protein", servingG: 100, kcal: 99, protein: 24, carbs: 0, fat: 0.3, allergens: ["giáp xác"], tags: ["vn"] },
  { id: "muc", name: "Mực hấp", nameEn: "Squid", group: "protein", servingG: 100, kcal: 92, protein: 16, carbs: 3, fat: 1.4, allergens: ["giáp xác"], tags: ["vn"] },
  { id: "sua_chua", name: "Sữa chua Hy Lạp", nameEn: "Greek yogurt", group: "protein", servingG: 150, kcal: 130, protein: 15, carbs: 6, fat: 4, allergens: ["sữa"], tags: ["snack"] },
  { id: "cottage", name: "Cottage cheese", nameEn: "Cottage cheese", group: "protein", servingG: 100, kcal: 98, protein: 11, carbs: 3, fat: 4, allergens: ["sữa"], tags: ["snack"] },
  { id: "sua_dau", name: "Sữa đậu nành", nameEn: "Soy milk", group: "protein", servingG: 250, kcal: 100, protein: 7, carbs: 8, fat: 4, allergens: ["đậu nành"], tags: ["vn", "chay"] },
  { id: "whey", name: "Whey protein (1 scoop)", nameEn: "Whey", group: "protein", servingG: 30, kcal: 120, protein: 24, carbs: 3, fat: 1.5, allergens: ["sữa"], tags: ["bổ sung"] },
  { id: "casein", name: "Casein (1 scoop)", nameEn: "Casein", group: "protein", servingG: 30, kcal: 110, protein: 24, carbs: 3, fat: 1, allergens: ["sữa"], tags: ["bổ sung"] },
  { id: "dau_den", name: "Đậu đen luộc", nameEn: "Black beans", group: "protein", servingG: 130, kcal: 140, protein: 9, carbs: 25, fat: 0.5, allergens: [], tags: ["chay", "xơ"] },
  { id: "dau_ha_lan", name: "Đậu Hà Lan", nameEn: "Peas", group: "protein", servingG: 100, kcal: 80, protein: 5, carbs: 14, fat: 0.4, allergens: [], tags: ["chay"] },
  { id: "ga_tay", name: "Ức gà tây", nameEn: "Turkey breast", group: "protein", servingG: 100, kcal: 135, protein: 29, carbs: 0, fat: 1.5, allergens: [], tags: ["lean"] },
  // --- veg ---
  { id: "rau_muong", name: "Rau muống xào", nameEn: "Morning glory", group: "veg", servingG: 150, kcal: 60, protein: 3, carbs: 6, fat: 3, allergens: [], tags: ["vn"] },
  { id: "rau_luoc", name: "Rau củ luộc hỗn hợp", nameEn: "Mixed veg", group: "veg", servingG: 200, kcal: 70, protein: 3, carbs: 12, fat: 0.5, allergens: [], tags: ["xơ"] },
  { id: "salad", name: "Salad xanh + dầu oliu", nameEn: "Green salad", group: "veg", servingG: 150, kcal: 90, protein: 2, carbs: 6, fat: 7, allergens: [], tags: [] },
  { id: "bong_cai", name: "Bông cải xanh hấp", nameEn: "Broccoli", group: "veg", servingG: 150, kcal: 50, protein: 4, carbs: 8, fat: 0.5, allergens: [], tags: ["xơ"] },
  { id: "cai_thia", name: "Cải thìa xào", nameEn: "Bok choy", group: "veg", servingG: 150, kcal: 45, protein: 2.5, carbs: 4, fat: 2, allergens: [], tags: ["vn"] },
  { id: "cai_xoong", name: "Cải xoong", nameEn: "Watercress", group: "veg", servingG: 100, kcal: 20, protein: 2, carbs: 1.5, fat: 0.2, allergens: [], tags: ["vn"] },
  { id: "ca_rot", name: "Cà rốt", nameEn: "Carrot", group: "veg", servingG: 100, kcal: 41, protein: 1, carbs: 10, fat: 0.2, allergens: [], tags: [] },
  { id: "dua_chuot", name: "Dưa chuột", nameEn: "Cucumber", group: "veg", servingG: 150, kcal: 20, protein: 1, carbs: 4, fat: 0.1, allergens: [], tags: [] },
  { id: "ca_chua", name: "Cà chua", nameEn: "Tomato", group: "veg", servingG: 150, kcal: 27, protein: 1.3, carbs: 6, fat: 0.3, allergens: [], tags: [] },
  { id: "nam", name: "Nấm xào", nameEn: "Mushrooms", group: "veg", servingG: 120, kcal: 55, protein: 4, carbs: 5, fat: 2, allergens: [], tags: ["chay"] },
  { id: "mang_tay", name: "Măng tây", nameEn: "Asparagus", group: "veg", servingG: 100, kcal: 20, protein: 2.2, carbs: 3.9, fat: 0.1, allergens: [], tags: [] },
  { id: "bi_do", name: "Bí đỏ hấp", nameEn: "Pumpkin", group: "veg", servingG: 150, kcal: 40, protein: 1.5, carbs: 10, fat: 0.1, allergens: [], tags: ["vn"] },
  // --- fruit ---
  { id: "chuoi", name: "Chuối", nameEn: "Banana", group: "fruit", servingG: 120, kcal: 105, protein: 1.3, carbs: 27, fat: 0.4, allergens: [], tags: ["tiện"] },
  { id: "tao", name: "Táo", nameEn: "Apple", group: "fruit", servingG: 150, kcal: 80, protein: 0.4, carbs: 21, fat: 0.3, allergens: [], tags: [] },
  { id: "du_du", name: "Đu đủ", nameEn: "Papaya", group: "fruit", servingG: 150, kcal: 60, protein: 0.7, carbs: 15, fat: 0.2, allergens: [], tags: ["vn"] },
  { id: "xoai", name: "Xoài", nameEn: "Mango", group: "fruit", servingG: 150, kcal: 90, protein: 1, carbs: 22, fat: 0.5, allergens: [], tags: ["vn"] },
  { id: "cam", name: "Cam", nameEn: "Orange", group: "fruit", servingG: 150, kcal: 70, protein: 1.2, carbs: 16, fat: 0.2, allergens: [], tags: [] },
  { id: "dua_hau", name: "Dưa hấu", nameEn: "Watermelon", group: "fruit", servingG: 200, kcal: 60, protein: 1, carbs: 15, fat: 0.3, allergens: [], tags: ["vn"] },
  { id: "berries", name: "Berries hỗn hợp", nameEn: "Mixed berries", group: "fruit", servingG: 100, kcal: 55, protein: 1, carbs: 12, fat: 0.4, allergens: [], tags: [] },
  { id: "oi", name: "Ổi", nameEn: "Guava", group: "fruit", servingG: 100, kcal: 68, protein: 2.5, carbs: 14, fat: 1, allergens: [], tags: ["vn", "xơ"] },
  { id: "buoi", name: "Bưởi", nameEn: "Pomelo", group: "fruit", servingG: 150, kcal: 55, protein: 1, carbs: 14, fat: 0.1, allergens: [], tags: ["vn"] },
  // --- fat ---
  { id: "bo_vn", name: "Bơ", nameEn: "Avocado", group: "fat", servingG: 70, kcal: 115, protein: 1.5, carbs: 6, fat: 10, allergens: [], tags: ["healthy fat"] },
  { id: "dau_phong", name: "Đậu phộng rang", nameEn: "Peanuts", group: "fat", servingG: 30, kcal: 170, protein: 7, carbs: 5, fat: 14, allergens: ["đậu phộng"], tags: ["snack"] },
  { id: "hanh_nhan", name: "Hạnh nhân", nameEn: "Almonds", group: "fat", servingG: 28, kcal: 160, protein: 6, carbs: 6, fat: 14, allergens: ["hạt"], tags: ["snack"] },
  { id: "hat_dieu", name: "Hạt điều", nameEn: "Cashews", group: "fat", servingG: 28, kcal: 155, protein: 5, carbs: 9, fat: 12, allergens: ["hạt"], tags: ["snack"] },
  { id: "hat_chia", name: "Hạt chia (1 tbsp)", nameEn: "Chia seeds", group: "fat", servingG: 12, kcal: 60, protein: 2, carbs: 5, fat: 4, allergens: [], tags: [] },
  { id: "dau_oliu", name: "Dầu oliu (1 tbsp)", nameEn: "Olive oil", group: "fat", servingG: 14, kcal: 120, protein: 0, carbs: 0, fat: 14, allergens: [], tags: [] },
  { id: "bo_thuc_vat", name: "Bơ thực vật", nameEn: "Butter / margarine", group: "fat", servingG: 10, kcal: 70, protein: 0, carbs: 0, fat: 8, allergens: [], tags: [] },
  // --- drink ---
  { id: "nuoc", name: "Nước lọc", nameEn: "Water", group: "drink", servingG: 250, kcal: 0, protein: 0, carbs: 0, fat: 0, allergens: [], tags: [] },
  { id: "ca_phe_den", name: "Cà phê đen", nameEn: "Black coffee", group: "drink", servingG: 150, kcal: 2, protein: 0, carbs: 0, fat: 0, allergens: [], tags: ["vn"] },
  { id: "tra_xanh", name: "Trà xanh", nameEn: "Green tea", group: "drink", servingG: 200, kcal: 2, protein: 0, carbs: 0, fat: 0, allergens: [], tags: [] },
  { id: "sua_tuoi", name: "Sữa tươi không đường", nameEn: "Milk low-fat", group: "drink", servingG: 250, kcal: 110, protein: 8, carbs: 12, fat: 2.5, allergens: ["sữa"], tags: [] },
  { id: "nuoc_dua", name: "Nước dừa", nameEn: "Coconut water", group: "drink", servingG: 250, kcal: 45, protein: 0.5, carbs: 9, fat: 0.5, allergens: [], tags: ["vn"] },
  { id: "nuoc_chanh", name: "Nước chanh không đường", nameEn: "Lemon water", group: "drink", servingG: 250, kcal: 10, protein: 0, carbs: 2, fat: 0, allergens: [], tags: [] },
  // --- ready meals VN ---
  { id: "canh_chua", name: "Canh chua (tô)", nameEn: "Sour soup", group: "meal", servingG: 350, kcal: 180, protein: 15, carbs: 12, fat: 6, allergens: ["cá"], tags: ["vn", "bữa"] },
  { id: "goi_ga", name: "Gỏi gà", nameEn: "Chicken salad VN", group: "meal", servingG: 250, kcal: 220, protein: 25, carbs: 10, fat: 8, allergens: [], tags: ["vn"] },
  { id: "com_ga", name: "Cơm gà (phần vừa)", nameEn: "Chicken rice", group: "meal", servingG: 400, kcal: 520, protein: 32, carbs: 55, fat: 16, allergens: [], tags: ["vn", "ngoài"] },
  { id: "com_tam", name: "Cơm tấm sườn", nameEn: "Broken rice pork", group: "meal", servingG: 450, kcal: 620, protein: 28, carbs: 70, fat: 22, allergens: [], tags: ["vn", "ngoài"] },
  { id: "banh_mi_thit", name: "Bánh mì thịt", nameEn: "Banh mi", group: "meal", servingG: 220, kcal: 420, protein: 18, carbs: 48, fat: 16, allergens: ["gluten"], tags: ["vn", "nhanh"] },
  { id: "pho_bo", name: "Phở bò (tô)", nameEn: "Pho beef", group: "meal", servingG: 550, kcal: 450, protein: 28, carbs: 50, fat: 12, allergens: [], tags: ["vn"] },
  { id: "pho_ga", name: "Phở gà (tô)", nameEn: "Pho chicken", group: "meal", servingG: 500, kcal: 400, protein: 26, carbs: 48, fat: 10, allergens: [], tags: ["vn"] },
  { id: "bun_cha", name: "Bún chả", nameEn: "Bun cha", group: "meal", servingG: 450, kcal: 550, protein: 30, carbs: 55, fat: 20, allergens: [], tags: ["vn"] },
  { id: "bun_bo", name: "Bún bò Huế", nameEn: "Bun bo Hue", group: "meal", servingG: 550, kcal: 520, protein: 28, carbs: 55, fat: 18, allergens: [], tags: ["vn"] },
  { id: "hu_tieu", name: "Hủ tiếu Nam Vang", nameEn: "Hu tieu", group: "meal", servingG: 500, kcal: 480, protein: 24, carbs: 55, fat: 15, allergens: [], tags: ["vn"] },
  { id: "com_chien", name: "Cơm chiên trứng", nameEn: "Egg fried rice", group: "meal", servingG: 350, kcal: 480, protein: 16, carbs: 55, fat: 20, allergens: ["trứng"], tags: ["vn"] },
  { id: "salad_ga", name: "Salad ức gà", nameEn: "Chicken salad bowl", group: "meal", servingG: 300, kcal: 320, protein: 35, carbs: 12, fat: 14, allergens: [], tags: ["lean"] },
  { id: "poke", name: "Poke bowl cá", nameEn: "Fish poke", group: "meal", servingG: 400, kcal: 450, protein: 30, carbs: 45, fat: 14, allergens: ["cá"], tags: [] },
  { id: "trung_sua_chua_chuoi", name: "Combo sáng: trứng + sữa chua + chuối", nameEn: "Breakfast combo", group: "meal", servingG: 320, kcal: 310, protein: 23, carbs: 35, fat: 10, allergens: ["trứng", "sữa"], tags: ["sáng"] },
  { id: "wrap_ga", name: "Wrap gà rau", nameEn: "Chicken wrap", group: "meal", servingG: 280, kcal: 380, protein: 28, carbs: 35, fat: 12, allergens: ["gluten"], tags: ["nhanh"] },
  { id: "smoothie_protein", name: "Smoothie protein chuối", nameEn: "Protein smoothie", group: "meal", servingG: 400, kcal: 320, protein: 30, carbs: 35, fat: 6, allergens: ["sữa"], tags: ["sáng", "snack"] },
];

fs.writeFileSync(
  path.join(dataDir, "foods-catalog.json"),
  JSON.stringify({
    source:
      "Curated VN/common foods for PT Desk planning; macros approximate public FCT/USDA-style values per serving. Not medical advice.",
    licenseNote:
      "Original Vietnamese FCT © NIN; this curated subset is approximate planning data.",
    foods,
  }),
);

console.log(`exercises: ${catalog.length}`);
console.log(`foods: ${foods.length}`);
