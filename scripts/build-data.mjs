/**
 * Builds PT Desk catalogs from:
 * - hasaneyldrm/exercises-dataset (1324 × 3D Gym Visual GIFs) — personal/educational;
 *   media © Gym visual — keep attribution. See NOTICE-exercises.md
 * - Curated VN foods
 *
 * Run: node scripts/build-data.mjs
 * (expects src/data/gymvisual-exercises.json — download via scripts/fetch-gymvisual.mjs)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "src", "data");
const CDN = "https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main";

const BODY_TO_MUSCLE = {
  chest: "chest",
  back: "back",
  shoulders: "shoulders",
  "upper arms": "arms",
  "lower arms": "arms",
  waist: "core",
  "upper legs": "legs",
  "lower legs": "legs",
  cardio: "cardio",
  neck: "shoulders",
};

const TARGET_TO_MUSCLE = {
  abs: "core",
  abdominals: "core",
  obliques: "core",
  "erector spinae": "posterior",
  glutes: "posterior",
  hamstrings: "posterior",
  quads: "legs",
  quadriceps: "legs",
  calves: "legs",
  adductors: "legs",
  abductors: "legs",
  pectorals: "chest",
  chest: "chest",
  lats: "back",
  "latissimus dorsi": "back",
  "upper back": "back",
  traps: "back",
  delts: "shoulders",
  deltoids: "shoulders",
  biceps: "arms",
  triceps: "arms",
  forearms: "arms",
  cardiovascular: "cardio",
  "cardiovascular system": "cardio",
};

function eq(equipment) {
  const e = (equipment || "body weight").toLowerCase();
  if (e.includes("body") || e === "assisted") return "bodyweight";
  if (e.includes("dumbbell")) return "dumbbell";
  if (e.includes("barbell")) return "barbell";
  if (e.includes("cable") || e.includes("machine") || e.includes("leverage") || e.includes("smith"))
    return "machine";
  if (e.includes("band")) return "band";
  if (e.includes("kettlebell")) return "kettlebell";
  return "any";
}

function mapMuscle(bodyPart, target, muscleGroup) {
  const t = (target || "").toLowerCase();
  if (TARGET_TO_MUSCLE[t]) return TARGET_TO_MUSCLE[t];
  const b = (bodyPart || "").toLowerCase();
  if (BODY_TO_MUSCLE[b]) return BODY_TO_MUSCLE[b];
  const g = (muscleGroup || "").toLowerCase();
  for (const [k, v] of Object.entries(TARGET_TO_MUSCLE)) {
    if (g.includes(k)) return v;
  }
  return "full";
}

function avoidJoints(name, bodyPart) {
  const set = new Set();
  const n = (name || "").toLowerCase();
  const b = (bodyPart || "").toLowerCase();
  if (/squat|lunge|jump|leg press/.test(n) || b.includes("legs")) set.add("knee");
  if (/deadlift|good morning|hyperextension/.test(n)) set.add("lower_back");
  if (/shoulder|press|upright|lateral raise/.test(n) || b === "shoulders") set.add("shoulder");
  if (/push-up|plank|handstand/.test(n)) set.add("wrist");
  return [...set];
}

function mediaUrl(rel) {
  if (!rel) return "";
  if (/^https?:/i.test(rel)) return rel;
  return `${CDN}/${rel.replace(/^\//, "")}`;
}

const srcPath = path.join(dataDir, "gymvisual-exercises.json");
if (!fs.existsSync(srcPath)) {
  console.error("Missing gymvisual-exercises.json — run scripts/fetch-gymvisual.mjs");
  process.exit(1);
}

const list = JSON.parse(fs.readFileSync(srcPath, "utf8"));
const catalog = [];

for (const e of list) {
  const name = e.name;
  const gifRel = e.gif_url;
  if (!name || !gifRel) continue;
  const gifUrl = mediaUrl(gifRel);
  const imageUrl = mediaUrl(e.image) || gifUrl;
  const bodyPart = e.body_part || e.category || "";
  const target = e.target || "";
  const secondary = Array.isArray(e.secondary_muscles)
    ? e.secondary_muscles
    : typeof e.secondary_muscles === "string"
      ? e.secondary_muscles.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
  const steps = e.instruction_steps || {};
  const cuesEn = Array.isArray(steps.en)
    ? steps.en
    : Array.isArray(e.instructions?.en)
      ? e.instructions.en
      : typeof e.instructions === "string"
        ? [e.instructions]
        : [];

  catalog.push({
    id: String(e.media_id || e.id || name.replace(/\W+/g, "_")),
    name,
    muscle: mapMuscle(bodyPart, target, e.muscle_group),
    primaryMuscles: target ? [target] : [],
    secondaryMuscles: secondary,
    bodyParts: bodyPart ? [bodyPart] : [],
    equipment: eq(e.equipment),
    equipmentRaw: e.equipment || "body weight",
    level: "intermediate",
    category: bodyPart === "cardio" ? "cardio" : "strength",
    jointFriendly: !/(jump|burpee|snatch|clean|kipping)/i.test(name),
    lowImpact: !/(jump|sprint|burpee|box jump|plyo)/i.test(name),
    avoidJoints: avoidJoints(name, bodyPart),
    cues: cuesEn.slice(0, 5).map(String),
    imageUrl,
    gifUrl,
    attribution: e.attribution || "© Gym visual — https://gymvisual.com/",
  });
}

catalog.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(path.join(dataDir, "exercises-catalog.json"), JSON.stringify(catalog));

const foodsPath = path.join(dataDir, "foods-catalog.json");
const foodsDoc = JSON.parse(fs.readFileSync(foodsPath, "utf8"));
console.log(`exercises(3D GIF): ${catalog.length}`);
console.log(`foods: ${foodsDoc.foods?.length ?? 0}`);
