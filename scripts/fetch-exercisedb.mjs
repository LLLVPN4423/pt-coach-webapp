/**
 * Paginate free ExerciseDB OSS API → src/data/exercisedb-raw.json (array)
 * Personal / non-commercial; attribute AscendAPI / ExerciseDB.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(__dirname, "..", "src", "data", "exercisedb-raw.json");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadExisting() {
  if (!fs.existsSync(out)) return [];
  const j = JSON.parse(fs.readFileSync(out, "utf8"));
  if (Array.isArray(j)) return j;
  if (Array.isArray(j?.data)) return j.data;
  return [];
}

const all = loadExisting();
const seen = new Set(all.map((e) => e.exerciseId));
let cursor = null;
let pages = 0;
let fails = 0;

console.log(`resume with ${all.length} cached`);

while (pages < 200) {
  const url = cursor
    ? `https://oss.exercisedb.dev/api/v1/exercises?limit=20&cursor=${encodeURIComponent(cursor)}`
    : `https://oss.exercisedb.dev/api/v1/exercises?limit=20`;
  let res;
  try {
    res = await fetch(url, {
      headers: {
        "User-Agent":
          "PT-Desk/1.0 (personal fitness coach; github.com/LLLVPN4423/pt-coach-webapp)",
        Accept: "application/json",
      },
    });
  } catch (e) {
    fails++;
    console.log("network error", e.message);
    await sleep(5000);
    if (fails > 15) break;
    continue;
  }
  if (res.status === 429) {
    fails++;
    const wait = Math.min(90000, 4000 * fails);
    console.log(`429 — wait ${wait}ms (have ${all.length})`);
    await sleep(wait);
    if (fails > 20) break;
    continue;
  }
  if (!res.ok) {
    console.log("HTTP", res.status);
    fails++;
    await sleep(5000);
    if (fails > 15) break;
    continue;
  }
  fails = 0;
  const json = await res.json();
  const batch = json.data || [];
  let added = 0;
  for (const e of batch) {
    if (!e?.exerciseId || seen.has(e.exerciseId)) continue;
    seen.add(e.exerciseId);
    all.push(e);
    added++;
  }
  pages++;
  fs.writeFileSync(out, JSON.stringify(all));
  console.log(
    `page ${pages}: +${added} (total ${all.length}/${json.meta?.total ?? "?"})`,
  );
  if (!json.meta?.hasNextPage || !json.meta?.nextCursor) break;
  // If we added 0, still advance cursor to avoid loop
  cursor = json.meta.nextCursor;
  await sleep(1200);
}

fs.writeFileSync(out, JSON.stringify(all));
console.log(`wrote ${all.length} exercises → ${out}`);
