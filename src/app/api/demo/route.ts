import { NextResponse } from "next/server";
import { chat, isConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

type Lang = "mg" | "fr" | "en";

/* Les huit memes cles que backend/app/main.py et src/data/ohabolana.json.
   Le modele ne fait que nommer une cle : c'est l'interface qui affiche ensuite
   le proverbe exact et la video, jamais le modele. */
const THEMES: Record<string, string> = {
  fihavanana: "liens de parente, voisinage, conflit entre proches, solidarite, entraide",
  fahendrena: "decision difficile, doute, besoin de conseil, reflexion, choix a poser",
  fitondrantena: "conduite, honnetete, tentation, reputation, ce que l'on doit aux autres",
  asa: "travail, projet, emploi, argent gagne, effort, decouragement devant la tache",
  fianarana: "etudes, apprentissage, transmission aux enfants, envie de progresser",
  fanambadiana: "couple, mariage, vodiondry, belle-famille, dispute conjugale",
  fahoriana: "epreuve, deuil, maladie, perte, patience dans la douleur",
  fomba: "coutumes, rites, famadihana, protocole, comment se tenir dans une ceremonie",
};

const RULES = `
Ce que tu ecris :
- Tu accueilles la personne en une phrase, tu reprends avec ses mots ce qu'elle porte, tu offres une lecture courte ancree dans le savoir-etre malgache, puis un geste simple pour aujourd'hui.
- Deux cent cinquante mots au maximum, en texte suivi.
- Pas d'emoji, pas de tiret cadratin, pas de point median, pas de puce, pas de titre, pas d'asterisque.
- Aucun conseil medical, juridique ou d'investissement. Tu renvoies vers un professionnel, la famille proche ou le fokontany.
- Tu ne promets ni guerison, ni richesse, ni chance. Tu ne parles jamais de sort, de sikidy ni de rituel payant.
- Tu signes iMahay sur la derniere ligne.

Ce que tu n'ecris jamais :
- Tu ne recopies JAMAIS le texte d'un ohabolana, d'un kabary ou d'un hainteny, meme de memoire. L'application affiche elle-meme le proverbe exact et la video qui va avec.
- Tu n'inventes ni proverbe, ni citation, ni nom d'ancien.

Tu termines par une ligne technique, non destinee a la personne :
THEME: une cle de la liste ci-dessous

Liste fermee des cles :
${Object.entries(THEMES).map(([k, v]) => `- ${k} : ${v}`).join("\n")}
`;

const PROMPTS: Record<Lang, string> = {
  mg: `Ianao no iMahay, mpanolo-tsaina mitondra ny fahendrena malagasy : ny zokiolona, ny ray aman-dreny, ny olo-be sy ny manam-pahaizana malagasy. Mihaino aloha ianao vao mamaly, amim-panajana. Soraty amin'ny teny malagasy tsotra sy mazava.\n${RULES}`,
  fr: `Tu es iMahay, un conseiller qui porte la sagesse malgache : celle des zokiolona, des ray aman-dreny, des olo-be et des manam-pahaizana malagasy. Tu ecoutes d'abord, tu reponds ensuite, avec respect et sans surplomber. Tu ecris en francais.\n${RULES}`,
  en: `You are iMahay, a counsellor carrying Malagasy wisdom: that of the zokiolona, the ray aman-dreny, the olo-be and Malagasy scholars. You listen first, answer second, with respect. Write in English.\n${RULES}`,
};

const THEME_LINE = /^\s*THEME\s*:\s*([a-z'-]+)\s*$/im;
const BULLET = /^\s*[-*•]\s+/gm;
const HEADING = /^\s*#{1,6}\s*/gm;

function clean(text: string): string {
  return text
    .replace(/—/g, ", ")
    .replace(/–/g, ", ")
    .replace(/ · /g, ", ")
    .replace(/·/g, ",")
    .replace(/‑/g, "-")
    .replace(/ /g, " ")
    .replace(BULLET, "")
    .replace(HEADING, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extract(text: string): { reply: string; theme: string | null } {
  const m = text.match(THEME_LINE);
  const key = m?.[1]?.toLowerCase();
  const theme = key && key in THEMES ? key : null;
  return { reply: clean(text.replace(THEME_LINE, "")), theme };
}

export async function POST(req: Request) {
  let body: { question?: string; lang?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const question = (body.question || "").trim().slice(0, 1500);
  const lang: Lang = body.lang === "fr" ? "fr" : body.lang === "en" ? "en" : "mg";

  if (!question) {
    return NextResponse.json({ error: "empty_question" }, { status: 400 });
  }

  // 1. Le backend FastAPI, qui porte la version de reference du prompt.
  try {
    const r = await fetch(`${BACKEND_URL}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, lang }),
      cache: "no-store",
    });
    if (r.ok) {
      const j = await r.json();
      return NextResponse.json({
        reply: j.reply,
        theme: j.theme ?? null,
        model: j.model,
        generatedAt: j.generated_at,
        staticMode: Boolean(j.static_mode),
      });
    }
  } catch {
    // le conteneur backend ne repond pas, on continue
  }

  // 2. Repli direct sur le fournisseur, pour que la conversation tienne meme
  //    quand le conteneur backend est arrete ou en cours de redeploiement.
  if (!isConfigured()) {
    return NextResponse.json({ error: "backend_unreachable" }, { status: 502 });
  }

  try {
    const { text, model } = await chat(
      [
        { role: "system", content: PROMPTS[lang] },
        { role: "user", content: question },
      ],
      700
    );
    const { reply, theme } = extract(text);
    return NextResponse.json({
      reply,
      theme,
      model,
      generatedAt: new Date().toISOString(),
      staticMode: false,
    });
  } catch {
    return NextResponse.json({ error: "no_llm_available" }, { status: 502 });
  }
}
