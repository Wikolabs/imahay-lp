// Revalide chaque video de src/data/culture.json contre l'endpoint oEmbed de
// YouTube. Une video retiree ou passee en prive renvoie 401 ou 404 : le script
// sort en erreur pour que la CI le signale avant qu'un visiteur ne tombe sur une
// vignette morte.
//
//   node scripts/check-videos.mjs          verifie les liens
//   node scripts/check-videos.mjs --sync   reecrit titres et chaines depuis YouTube

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = join(here, "..", "src", "data", "culture.json");
const sync = process.argv.includes("--sync");

const data = JSON.parse(await readFile(dataPath, "utf8"));

async function probe(id) {
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
  const r = await fetch(url, { headers: { "User-Agent": "imahay-link-check/1.0" } });
  if (!r.ok) return { ok: false, status: r.status };
  const j = await r.json();
  return { ok: true, title: j.title, channel: j.author_name };
}

const dead = [];
let drifted = 0;

for (const v of data.videos) {
  let res;
  try {
    res = await probe(v.id);
  } catch (e) {
    res = { ok: false, status: e.message };
  }

  if (!res.ok) {
    dead.push(`${v.id}  ${res.status}  ${v.title}`);
    console.log(`DEAD  ${v.id}  (${res.status})  ${v.title}`);
    continue;
  }

  const same = res.title === v.title && res.channel === v.channel;
  if (!same) {
    drifted += 1;
    console.log(`DRIFT ${v.id}`);
    console.log(`      local  ${v.title} | ${v.channel}`);
    console.log(`      remote ${res.title} | ${res.channel}`);
    if (sync) {
      v.title = res.title;
      v.channel = res.channel;
    }
  } else {
    console.log(`OK    ${v.id}  ${v.title}`);
  }
}

if (sync) {
  data.checked_at = new Date().toISOString().slice(0, 10);
  await writeFile(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`\nculture.json mis a jour, ${drifted} entree(s) corrigee(s).`);
}

console.log(`\n${data.videos.length} video(s), ${dead.length} morte(s), ${drifted} en derive.`);

if (dead.length) {
  console.error("\nLiens a remplacer :");
  for (const line of dead) console.error("  " + line);
  process.exit(1);
}
