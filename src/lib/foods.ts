import foodsData from "@/data/foods-catalog.json";
import type { MealItem, Profile } from "./types";

export interface FoodItem {
  id: string;
  name: string;
  nameEn: string;
  group: string;
  servingG: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  allergens: string[];
  tags: string[];
}

export const FOODS = foodsData.foods as FoodItem[];

export function getFood(id: string): FoodItem | undefined {
  return FOODS.find((f) => f.id === id);
}

export function foodsByGroup(group: string): FoodItem[] {
  return FOODS.filter((f) => f.group === group);
}

function pickFood(
  group: string,
  avoidAllergens: string[],
  preferTags: string[] = [],
  seed = 0,
): FoodItem {
  let pool = FOODS.filter(
    (f) =>
      f.group === group &&
      !f.allergens.some((a) => avoidAllergens.includes(a)),
  );
  if (preferTags.length) {
    const tagged = pool.filter((f) =>
      preferTags.some((t) => f.tags.includes(t)),
    );
    if (tagged.length) pool = tagged;
  }
  if (!pool.length) pool = FOODS.filter((f) => f.group === group);
  const idx = Math.abs(seed) % Math.max(pool.length, 1);
  return pool[idx] || FOODS[0];
}

/** Build meal plan from foods catalog targeting daily macros. */
export function buildMealsFromFoods(
  calories: number,
  proteinG: number,
  profile: Profile,
): MealItem[] {
  const avoid: string[] = [];
  const medical = profile.medical;
  const conditions = medical?.conditions ?? [];
  // Soft allergen avoid from notes
  const notes = (
    (medical?.otherNotes ?? "") +
    " " +
    (medical?.medicationNotes ?? "")
  ).toLowerCase();
  if (notes.includes("sữa") || notes.includes("lactose")) avoid.push("sữa");
  if (notes.includes("gluten") || notes.includes("celiac")) avoid.push("gluten");
  if (notes.includes("đậu phộng") || notes.includes("peanut"))
    avoid.push("đậu phộng");

  const pregnancy = conditions.includes("pregnancy");
  const diabetes = conditions.includes("diabetes");
  const edHistory = conditions.includes("eating_disorder_history");
  const life = profile.life;
  const diet = life?.dietPattern || "none";
  if (diet === "lactose_free") avoid.push("sữa");
  if (diet === "gluten_free") avoid.push("gluten");
  if (diet === "vegan" || diet === "vegetarian") {
    /* soft: prefer plant tags below */
  }
  const budgetTags =
    life?.foodBudget === "low" ? ["rẻ", "vn"] : life?.foodBudget === "flexible" ? [] : ["vn"];
  const plant =
    diet === "vegan" || diet === "vegetarian" ? ["chay"] : [];
  const seed =
    (profile.name?.length || 1) * 17 +
    (profile.daysPerWeek || 3) * 3 +
    (profile.sessionMinutes || 45);

  const breakfastP = pickFood(
    "protein",
    avoid,
    [...plant, "sáng", ...budgetTags],
    seed + 1,
  );
  const breakfastC = pickFood("carb", avoid, ["sáng", ...budgetTags], seed + 2);
  const breakfastF = pickFood("fruit", avoid, [], seed + 3);

  const lunchP = pickFood(
    "protein",
    avoid,
    plant.length ? plant : pregnancy ? ["vn"] : ["lean", ...budgetTags],
    seed + 4,
  );
  const lunchC = pickFood(
    "carb",
    avoid,
    diabetes ? ["xơ"] : ["vn", ...budgetTags],
    seed + 5,
  );
  const lunchV = pickFood("veg", avoid, ["vn", "xơ"], seed + 6);

  const snack = pickFood("protein", avoid, ["snack", ...plant], seed + 7);
  const snackF = pickFood("fruit", avoid, ["tiện"], seed + 8);

  const dinnerP = pickFood(
    "protein",
    avoid,
    [...plant, "vn", ...budgetTags],
    seed + 9,
  );
  const dinnerV = pickFood("veg", avoid, ["xơ"], seed + 10);
  const dinnerC = pickFood("carb", avoid, budgetTags, seed + 11);
  const readyMeal = pickFood("meal", avoid, [...budgetTags, "vn"], seed + 12);

  function line(f: FoodItem): string {
    return `${f.name} (~${f.servingG}g · ${f.kcal} kcal · P${f.protein}g)`;
  }

  function sum(fs: FoodItem[]) {
    return fs.reduce(
      (a, f) => ({
        kcal: a.kcal + f.kcal,
        protein: a.protein + f.protein,
      }),
      { kcal: 0, protein: 0 },
    );
  }

  const bFoods = [breakfastP, breakfastC, breakfastF];
  const lFoods = [lunchP, lunchC, lunchV];
  const sFoods = [snack, snackF];
  const dFoods = [dinnerP, dinnerV, dinnerC];
  const skipBreakfast = life?.eatingWindow === "skip_breakfast";

  const meals: MealItem[] = [];
  if (!skipBreakfast) {
    meals.push({
      name: "Bữa sáng",
      emoji: "🌅",
      items: bFoods.map(line),
      approxKcal: sum(bFoods).kcal,
      tags: ["foods-catalog", ...breakfastP.tags.slice(0, 2)],
      allergens: [...new Set(bFoods.flatMap((f) => f.allergens))],
      swaps: FOODS.filter((f) => f.group === "protein" && f.id !== breakfastP.id)
        .slice(0, 2)
        .map((f) => f.name),
      tip: diabetes
        ? "Ưu tiên carb chậm + chất xơ."
        : `Mục tiêu ~${proteinG}g protein / ${calories} kcal.`,
    });
  }
  meals.push(
    {
      name: "Bữa trưa",
      emoji: "🍱",
      items: lFoods.map(line),
      approxKcal: sum(lFoods).kcal,
      tags: ["macro chính", "vn"],
      allergens: [...new Set(lFoods.flatMap((f) => f.allergens))],
      swaps: [readyMeal.name, "Cơm gà vừa", "Gỏi gà"],
      tip: pregnancy
        ? "Ưu tiên đồ chín kỹ."
        : edHistory
          ? "Không siết calo gắt."
          : undefined,
    },
    {
      name: "Bữa phụ",
      emoji: "🍎",
      items: sFoods.map(line),
      approxKcal: sum(sFoods).kcal,
      tags: ["nhanh"],
      allergens: [...new Set(sFoods.flatMap((f) => f.allergens))],
      swaps: ["Whey / sữa đậu", "Đậu phộng rang"],
    },
    {
      name: "Bữa tối",
      emoji: "🍲",
      items: dFoods.map(line),
      approxKcal: sum(dFoods).kcal,
      tags: ["nhẹ bụng"],
      allergens: [...new Set(dFoods.flatMap((f) => f.allergens))],
      swaps: ["Canh chua", "Đậu phụ + rau"],
      tip: "Cách giờ ngủ 2–3 giờ nếu dễ trào ngược.",
    },
    {
      name: "Món VN sẵn (tuỳ chọn)",
      emoji: "🍜",
      items: [line(readyMeal)],
      approxKcal: readyMeal.kcal,
      tags: ["meal", ...readyMeal.tags.slice(0, 2)],
      allergens: [...readyMeal.allergens],
      swaps: FOODS.filter((f) => f.group === "meal")
        .slice(0, 3)
        .map((f) => f.name),
      tip: "Đổi cho bữa trưa/tối khi bận.",
    },
  );
  return meals;
}

/** Client-side Open Food Facts product lookup (free API, 1 call per scan). */
export async function fetchOffProduct(barcode: string): Promise<{
  name: string;
  kcal?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  image?: string;
} | null> {
  const code = barcode.replace(/\D/g, "");
  if (code.length < 8) return null;
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${code}.json`,
    {
      headers: {
        "User-Agent": "PT-Desk/1.0 (personal fitness coach; github.com/LLLVPN4423/pt-coach-webapp)",
      },
    },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    status?: number;
    product?: {
      product_name?: string;
      image_front_small_url?: string;
      nutriments?: Record<string, number>;
    };
  };
  if (data.status !== 1 || !data.product) return null;
  const n = data.product.nutriments || {};
  return {
    name: data.product.product_name || `OFF ${code}`,
    kcal: n["energy-kcal_100g"] ?? n["energy-kcal"],
    protein: n.proteins_100g,
    carbs: n.carbohydrates_100g,
    fat: n.fat_100g,
    image: data.product.image_front_small_url,
  };
}
