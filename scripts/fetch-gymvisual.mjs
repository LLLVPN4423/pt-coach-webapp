/** Download hasaneyldrm/exercises-dataset JSON (Gym Visual 3D GIFs). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "src", "data", "gymvisual-exercises.json");
const url =
  "https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json";

const res = await fetch(url);
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();
fs.writeFileSync(out, JSON.stringify(data));
console.log(`wrote ${data.length} → ${out}`);
