"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import culture from "@/data/culture.json";
import ohabolanaData from "@/data/ohabolana.json";
import contacts from "@/data/contacts.json";
import Aloalo from "./Aloalo";
import Logo from "./Logo";
import Sidebar from "./Sidebar";
import VideoCard from "./VideoCard";
import { Flag, FlagRow, FlagRule } from "./Flag";
import { useConversations, type Turn } from "./useConversations";

type Lang = "mg" | "fr" | "en";

type Ohabolana = {
  id: string;
  theme: string;
  mg: string;
  fr: string;
  en: string;
  meaning_mg: string;
  meaning_fr: string;
  meaning_en: string;
  source: string;
  source_url: string;
  confidence: string;
};

type Video = {
  id: string;
  title: string;
  channel: string;
  category: string;
  themes: string[];
  why: string;
};

type ThemeEntry = {
  mg: string;
  fr: string;
  en: string;
  fallback?: string;
  prompts_mg: string[];
  prompts_fr: string[];
  prompts_en: string[];
};

type Contact = {
  name: string;
  kind: string;
  city: string;
  url: string;
  phone: string;
  inChat?: boolean;
  note: { fr: string; mg: string; en: string };
};

const OHABOLANA = ohabolanaData.items as Ohabolana[];
const THEMES = ohabolanaData.themes as Record<string, ThemeEntry>;
const THEME_KEYS = Object.keys(THEMES);
const VIDEOS = culture.videos as Video[];
const CATEGORIES = culture.categories as Record<string, { mg: string; fr: string }>;
const PLACES = contacts.places as Contact[];
const IN_CHAT = PLACES.filter((p) => p.inChat);
const HELP = contacts.help as Contact[];
const CONTACTS = [...PLACES, ...HELP];

const DAY = () => Math.floor(Date.now() / 86400000);

function ohabolanaFor(theme: string | null): Ohabolana | null {
  if (!theme) return null;
  const pool = OHABOLANA.filter((o) => o.theme === theme);
  if (pool.length) return pool[DAY() % pool.length];
  const fallback = THEMES[theme]?.fallback;
  if (!fallback) return null;
  const alt = OHABOLANA.filter((o) => o.theme === fallback);
  return alt.length ? alt[0] : null;
}

/** Deux videos par situation, de categories differentes quand c'est possible. */
function videosFor(theme: string | null): Video[] {
  if (!theme) return [];
  const pool = VIDEOS.filter((v) => v.themes.includes(theme));
  if (pool.length <= 2) return pool;
  const start = DAY() % pool.length;
  const first = pool[start];
  const other = pool.find((v, i) => i !== start && v.category !== first.category) ?? pool[(start + 1) % pool.length];
  return [first, other];
}

/** Le domaine seul : une adresse complete deborde de l'ecran sur telephone. */
function domainOf(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
}

const T: Record<Lang, Record<string, string>> = {
  mg: {
    navCulture: "Kolontsaina",
    navOhabolana: "Ohabolana",
    navTalk: "Olona hiresahana",
    heroTitle: "Ny fahendrena malagasy, valiana ny fanontanianao.",
    heroLead:
      "Apetraho ny olanao amin'ny teny malagasy. Mihaino i iMahay, mamaly amim-panajana, dia atolony anao ny ohabolana marina, ny horonan-tsary manazava azy, ary ny toerana ahitana olona hiresahana.",
    ohOfDay: "Ohabolana androany",
    newChat: "Resaka vaovao",
    history: "Ny resakao",
    sideEmpty: "Mijanona eto ny resakao, amin'ity fitaovana ity ihany. Tsy misy alefa na aiza na aiza.",
    del: "Fafao",
    close: "Hidio",
    menu: "Resaka",
    welcome: "Tongasoa. Lazao amin'ny teninao izay entinao androany, na tsindrio ny toe-javatra manakaiky indrindra.",
    placeholder: "Soraty eto izay entinao androany.",
    send: "Alefa",
    thinking: "Mieritreritra",
    pickTheme: "Safidio ny toe-javatra",
    pickPrompt: "Na alaivo ny iray amin'ireto fanontaniana ireto",
    attach: "Ny ohabolana mifanaraka amin'izany",
    attachVideo: "Henoy",
    attachTalk: "Olona azo resahina",
    example: "Ohatra",
    aloaloTitle: "Ny aloalo",
    aloaloLead:
      "Tsotra ny hazo, saingy misy sokitra mifanaraka eo aminy : lohan'omby sy tandrony, diamondra, boribory, efamira, tsipika. Isaky ny aloalo dia tantara iray naorina tamin'ireo endrika ireo.",
    ohTitle: "Ny ohabolana voamarina",
    ohLead:
      "Tsy manoratra ohabolana i iMahay. Izao lisitra izao ihany no ampiasainy, ary voatondro ny loharano nakana azy.",
    cultureTitle: "Ny feo tokony ho henoina",
    cultureLead:
      "Kabary, ohabolana nohazavaina, fomba aman-panao, hira gasy. Tsindrio ny sary vao mihodina ny horonan-tsary, tsy alefa mialoha.",
    filterAll: "Izy rehetra",
    talkTitle: "Aiza no misy olona hiresahana",
    talkLead: "Toerana mamoaka ny antsipirihany momba azy ireo ihany. Tsy manao fotoana ho anao i iMahay, ary tsy mampita na inona na inona.",
    truthTitle: "Izay ataon'i iMahay, sy izay tsy ataony",
    truthDo: "Izay ataony",
    truthDont: "Izay tsy ataony",
    srcTitle: "Ny loharano",
    srcLead: "Ny ohabolana rehetra dia avy amin'ireto loharano ireto. Ny horonan-tsary dia an'ny tompony.",
    footNote:
      "Tsy dokotera, tsy mpisolovava, tsy mpanolo-tsaina ara-bola i iMahay. Raha misy loza mananontanona, antsoy ny fianakaviana na ny fokontany.",
    free: "Maimaim-poana, tsy mitaky anarana",
    fail: "Tsy tafita ny hafatra. Andramo indray afaka kelikely.",
  },
  fr: {
    navCulture: "Culture",
    navOhabolana: "Proverbes",
    navTalk: "Où parler",
    heroTitle: "La sagesse malgache répond à ta question.",
    heroLead:
      "Pose ce que tu portes, en malgache ou en français. iMahay écoute, répond avec respect, puis te donne le proverbe exact, la vidéo qui l'explique, et les lieux où trouver quelqu'un à qui parler.",
    ohOfDay: "Proverbe du jour",
    newChat: "Nouvelle conversation",
    history: "Tes conversations",
    sideEmpty: "Tes conversations resteront ici, sur cet appareil seulement. Rien n'est envoyé nulle part.",
    del: "Supprimer",
    close: "Fermer",
    menu: "Conversations",
    welcome: "Bienvenue. Dis avec tes mots ce que tu portes aujourd'hui, ou touche la situation la plus proche.",
    placeholder: "Écris ici ce que tu portes aujourd'hui.",
    send: "Envoyer",
    thinking: "Réfléchit",
    pickTheme: "Choisis la situation",
    pickPrompt: "Ou prends l'une de ces questions",
    attach: "Le proverbe qui correspond",
    attachVideo: "À écouter",
    attachTalk: "Quelqu'un à qui parler",
    example: "Exemple",
    aloaloTitle: "L'aloalo",
    aloaloLead:
      "Le bois est nu, mais on y empile des formes : tête de zébu et cornes, losange, disque, carré, chevrons. Chaque poteau raconte une histoire construite avec ces formes.",
    ohTitle: "Les proverbes vérifiés",
    ohLead:
      "iMahay n'écrit jamais un ohabolana. Il ne peut citer que cette liste, et chaque entrée porte sa source.",
    cultureTitle: "Les voix à écouter",
    cultureLead:
      "Kabary, proverbes expliqués, fomba aman-panao, hira gasy. La vidéo ne se charge qu'après un clic sur la vignette.",
    filterAll: "Tout",
    talkTitle: "Où trouver quelqu'un à qui parler",
    talkLead: "Des lieux qui publient eux-mêmes leurs coordonnées. iMahay ne prend aucun rendez-vous à ta place et ne transmet rien.",
    truthTitle: "Ce qu'iMahay fait, et ce qu'il ne fait pas",
    truthDo: "Ce qu'il fait",
    truthDont: "Ce qu'il ne fait pas",
    srcTitle: "Les sources",
    srcLead: "Les proverbes viennent de ces recueils. Les vidéos restent la propriété de leurs auteurs.",
    footNote:
      "iMahay n'est ni médecin, ni avocat, ni conseiller financier. En cas de danger, appelle ta famille ou le fokontany.",
    free: "Gratuit, sans nom demandé",
    fail: "Le message n'est pas parti. Réessaie dans un moment.",
  },
  en: {
    navCulture: "Culture",
    navOhabolana: "Proverbs",
    navTalk: "Where to talk",
    heroTitle: "Malagasy wisdom answers your question.",
    heroLead:
      "Say what you carry, in Malagasy, French or English. iMahay listens, answers with respect, then hands you the exact proverb, the video that explains it, and places where you can find someone to talk to.",
    ohOfDay: "Proverb of the day",
    newChat: "New conversation",
    history: "Your conversations",
    sideEmpty: "Your conversations stay here, on this device only. Nothing is sent anywhere.",
    del: "Delete",
    close: "Close",
    menu: "Conversations",
    welcome: "Welcome. Say in your own words what you carry today, or tap the closest situation.",
    placeholder: "Write here what you are carrying today.",
    send: "Send",
    thinking: "Thinking",
    pickTheme: "Pick the situation",
    pickPrompt: "Or take one of these questions",
    attach: "The proverb that fits",
    attachVideo: "Listen",
    attachTalk: "Someone to talk to",
    example: "Example",
    aloaloTitle: "The aloalo",
    aloaloLead:
      "The wood is plain, but shapes are stacked on it: zebu head and horns, diamond, disc, square, chevrons. Each post tells a story built from those shapes.",
    ohTitle: "The verified proverbs",
    ohLead:
      "iMahay never writes an ohabolana. It can only draw from this list, and every entry carries its source.",
    cultureTitle: "Voices worth hearing",
    cultureLead:
      "Kabary, explained proverbs, customs, hira gasy. A video loads only after you click its thumbnail.",
    filterAll: "All",
    talkTitle: "Where to find someone to talk to",
    talkLead: "Places that publish their own contact details. iMahay books nothing for you and passes nothing on.",
    truthTitle: "What iMahay does, and what it does not",
    truthDo: "What it does",
    truthDont: "What it does not do",
    srcTitle: "Sources",
    srcLead: "Proverbs come from these collections. Videos remain the property of their authors.",
    footNote:
      "iMahay is not a doctor, a lawyer or a financial adviser. If you are in danger, call your family or the fokontany.",
    free: "Free, no name asked",
    fail: "The message did not go through. Please try again.",
  },
};

const DOES: Record<Lang, string[]> = {
  mg: [
    "Mihaino ny olanao, amin'ny teny malagasy, frantsay na anglisy.",
    "Manondro ohabolana marina, nalaina tamin'ny boky voatondro.",
    "Manolotra horonan-tsary kabary na hira gasy mifandraika amin'ny resaka.",
    "Manoro toerana misy olona azo resahina, sy dingana tsotra azo atao androany.",
  ],
  fr: [
    "Écoute ce que tu portes, en malgache, en français ou en anglais.",
    "Désigne un proverbe exact, pris dans un recueil identifié.",
    "Propose un kabary ou un hira gasy en rapport avec la conversation.",
    "Indique un lieu où parler à quelqu'un, et un pas simple faisable aujourd'hui.",
  ],
  en: [
    "Listens to what you carry, in Malagasy, French or English.",
    "Points to an exact proverb, taken from a named collection.",
    "Offers a kabary or hira gasy video tied to the conversation.",
    "Names a place where you can talk to someone, and one step for today.",
  ],
};

const DONTS: Record<Lang, string[]> = {
  mg: [
    "Tsy manoratra ohabolana vaovao, tsy mamorona teny nataon'ny razana.",
    "Tsy manao sikidy, tsy mampanantena vintana na fanasitranana.",
    "Tsy mangataka vola na sorona, na oviana na oviana.",
    "Tsy manome toro-hevitra ara-pitsaboana, ara-dalana na ara-bola.",
  ],
  fr: [
    "N'écrit jamais un proverbe nouveau, n'invente pas une parole des razana.",
    "Ne fait pas de sikidy, ne promet ni chance ni guérison.",
    "Ne demande jamais d'argent ni de sacrifice.",
    "Ne donne aucun conseil médical, juridique ou d'investissement.",
  ],
  en: [
    "Never writes a new proverb, never invents words of the razana.",
    "Does no sikidy, promises neither luck nor healing.",
    "Never asks for money or sacrifice.",
    "Gives no medical, legal or investment advice.",
  ],
};

function OhabolanaBlock({ o, lang }: { o: Ohabolana; lang: Lang }) {
  return (
    <div className="oh">
      <p className="oh-mg">{o.mg}</p>
      <p className="oh-fr">{lang === "en" ? o.en : o.fr}</p>
      <p className="oh-src">
        {o.source}
        {o.source_url ? (
          <>
            {", "}
            <a href={o.source_url} target="_blank" rel="noreferrer noopener" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
              {lang === "mg" ? "jereo" : lang === "en" ? "see" : "voir"}
            </a>
          </>
        ) : null}
      </p>
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("mg");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<string>(THEME_KEYS[0]);
  const [drawer, setDrawer] = useState(false);
  const [cat, setCat] = useState<string>("all");
  const threadRef = useRef<HTMLDivElement>(null);
  const t = T[lang];

  const convo = useConversations("imahay.conversations.v1");
  const turns = convo.turns;

  const daily = useMemo(() => OHABOLANA[DAY() % OHABOLANA.length], []);

  useEffect(() => {
    if (turns.length === 0) return;
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [turns.length, busy]);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;

    const history = turns.map((x) => ({ role: x.role === "you" ? "user" : "assistant", content: x.text }));

    convo.append({ role: "you", text });
    setInput("");
    setBusy(true);
    setDrawer(false);
    try {
      const r = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, lang, history }),
      });
      const j = await r.json();
      if (!j.reply) throw new Error("no_reply");
      convo.append({ role: "bot", text: j.reply, theme: j.theme ?? null });
      if (j.theme) setPicked(j.theme);
    } catch {
      convo.append({ role: "bot", text: t.fail, theme: null });
    } finally {
      setBusy(false);
    }
  }

  const themeLabel = (k: string) => THEMES[k]?.[lang] ?? k;
  const prompts = THEMES[picked]?.[`prompts_${lang}` as "prompts_mg"] ?? [];
  const shownVideos = cat === "all" ? VIDEOS : VIDEOS.filter((v) => v.category === cat);

  function Attach({ themeKey, label }: { themeKey: string; label: string }) {
    const o = ohabolanaFor(themeKey);
    if (!o) return null;
    const vids = videosFor(themeKey);
    /* Un lieu ou l'on peut se presenter, et un service d'ecoute. Ils tournent
       d'un jour a l'autre pour ne pas toujours envoyer au meme endroit. */
    const places = [IN_CHAT[DAY() % IN_CHAT.length], HELP[DAY() % HELP.length]].filter(Boolean);
    return (
      <div className="attach">
        <div className="attach-head">
          <Flag height={14} />
          <span>
            {label}, {themeLabel(themeKey)}
          </span>
        </div>
        <div className="attach-body">
          <OhabolanaBlock o={o} lang={lang} />
          <p className="muted" style={{ marginTop: -4 }}>
            {lang === "mg" ? o.meaning_mg : lang === "en" ? o.meaning_en : o.meaning_fr}
          </p>

          {vids.length > 0 && (
            <div>
              <p className="suggest-label">{t.attachVideo}</p>
              <div className="videos" style={{ gridTemplateColumns: "1fr" }}>
                {vids.map((v) => (
                  <VideoCard key={v.id} v={v} play={lang === "mg" ? "Alefa" : lang === "en" ? "Play" : "Lire"} />
                ))}
              </div>
            </div>
          )}

          {places.length > 0 && (
            <>
              <hr className="attach-sep" />
              <div>
                <p className="suggest-label">{t.attachTalk}</p>
                <div className="talk">
                  {places.map((c) => (
                    <div className="talk-item" key={c.url}>
                      <b>{c.name}</b>
                      <span>
                        {c.kind}, {c.city}
                        {c.phone ? `, ${c.phone}` : ""}
                      </span>
                      <span style={{ fontSize: ".88rem", color: "var(--ink-2)" }}>{c.note[lang]}</span>
                      <a href={c.url} target="_blank" rel="noreferrer noopener">
                        {domainOf(c.url)}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const play = lang === "mg" ? "Alefa" : lang === "en" ? "Play" : "Lire";

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
            <button
              className="btn btn-soft btn-sm side-toggle"
              onClick={() => setDrawer((v) => !v)}
              aria-label={t.menu}
              aria-expanded={drawer}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <a href="#top" aria-label="iMahay" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <Logo size={32} />
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
                <span style={{ color: "var(--green)" }}>i</span>
                <span style={{ color: "var(--ink)" }}>Mahay</span>
                <span style={{ color: "var(--red)" }}>.</span>
              </span>
            </a>
          </span>
          <nav className="nav-links">
            <a href="#ohabolana">{t.navOhabolana}</a>
            <a href="#kolontsaina">{t.navCulture}</a>
            <a href="#miresaka-olona">{t.navTalk}</a>
          </nav>
          <div className="langs">
            {(["mg", "fr", "en"] as Lang[]).map((l) => (
              <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </header>
      <FlagRule thickness={4} />

      <div className="app" id="top">
        <Sidebar
          list={convo.list}
          currentId={convo.currentId}
          open={drawer}
          onClose={() => setDrawer(false)}
          onNew={() => {
            convo.start();
            setDrawer(false);
          }}
          onOpen={(id) => {
            convo.open(id);
            setDrawer(false);
          }}
          onRemove={convo.remove}
          labels={{ newChat: t.newChat, history: t.history, empty: t.sideEmpty, del: t.del, close: t.close }}
          links={[
            { href: "#ohabolana", label: t.navOhabolana },
            { href: "#kolontsaina", label: t.navCulture },
            { href: "#miresaka-olona", label: t.navTalk },
          ]}
        />

        <div className="pane">
          <div className="thread" ref={threadRef}>
            <div className="thread-in">
              {turns.length === 0 ? (
                <>
                  <div className="intro">
                    <p className="snum">
                      <FlagRow count={3} height={16} />
                      <b>{t.free}</b>
                    </p>
                    <h1>{t.heroTitle}</h1>
                    <p className="lead">{t.heroLead}</p>
                    <div className="intro-card">
                      <Aloalo variant={0} height={132} shaft={44} />
                      <div style={{ minWidth: 0 }}>
                        <p className="snum" style={{ marginBottom: 12 }}>
                          <Flag height={14} />
                          <b>{t.ohOfDay}</b>
                        </p>
                        <OhabolanaBlock o={daily} lang={lang} />
                      </div>
                    </div>
                  </div>
                  <div className="msg msg-ai">{t.welcome}</div>
                  <Attach themeKey={picked} label={t.example} />
                </>
              ) : (
                turns.map((m: Turn, i: number) =>
                  m.role === "you" ? (
                    <div key={i} className="msg msg-you">
                      {m.text}
                    </div>
                  ) : (
                    <div key={i} style={{ display: "contents" }}>
                      <div className="msg msg-ai">{m.text}</div>
                      {m.theme && <Attach themeKey={m.theme} label={t.attach} />}
                    </div>
                  )
                )
              )}
              {busy && (
                <span className="typing">
                  {t.thinking}
                  <span aria-hidden="true">...</span>
                </span>
              )}
            </div>
          </div>

          <div className="suggest">
            <div className="suggest-in">
              <p className="suggest-label">{t.pickTheme}</p>
              <div className="chips">
                {THEME_KEYS.map((k) => (
                  <button key={k} className="chip" aria-pressed={picked === k} onClick={() => setPicked(k)}>
                    {themeLabel(k)}
                  </button>
                ))}
              </div>
              <p className="suggest-label" style={{ marginTop: 16 }}>
                {t.pickPrompt}
              </p>
              <div className="prompts">
                {prompts.map((p) => (
                  <button key={p} className="prompt" onClick={() => ask(p)} disabled={busy}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="chat-foot">
            <form
              className="chat-form"
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.placeholder}
                rows={2}
                maxLength={1500}
                aria-label={t.placeholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    ask(input);
                  }
                }}
              />
              <button className="btn send" type="submit" disabled={busy || !input.trim()} aria-label={t.send}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 19V5" />
                  <path d="m5 12 7-7 7 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      <main>
        <section className="section" style={{ borderTop: "none" }}>
          <div className="wrap">
            <p className="snum">
              <span>01</span>
              <b>{t.aloaloTitle}</b>
            </p>
            <h2 style={{ marginBottom: 12 }}>{t.aloaloTitle}</h2>
            <p className="lead" style={{ marginBottom: 34 }}>
              {t.aloaloLead}
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "clamp(18px, 4vw, 46px)",
                alignItems: "flex-end",
                justifyContent: "space-between",
                padding: "clamp(20px, 3vw, 34px)",
                background: "var(--paper-2)",
                borderRadius: "var(--r-xl)",
              }}
            >
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <Aloalo key={i} variant={i} height={210} shaft={62} />
              ))}
            </div>
          </div>
        </section>

        <section className="section section-tint" id="ohabolana">
          <div className="wrap">
            <p className="snum">
              <span>02</span>
              <b>
                {OHABOLANA.length} {lang === "mg" ? "ohabolana" : lang === "en" ? "proverbs" : "proverbes"}
              </b>
            </p>
            <h2 style={{ marginBottom: 12 }}>{t.ohTitle}</h2>
            <p className="lead" style={{ marginBottom: 30 }}>
              {t.ohLead}
            </p>

            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: "1%" }}>#</th>
                    <th>{lang === "mg" ? "Ohabolana" : lang === "en" ? "Proverb" : "Proverbe"}</th>
                    <th>{lang === "mg" ? "Hevitra" : lang === "en" ? "Meaning" : "Sens"}</th>
                    <th style={{ width: "17%" }}>{lang === "mg" ? "Toe-javatra" : "Situation"}</th>
                    <th style={{ width: "16%" }}>{lang === "mg" ? "Loharano" : "Source"}</th>
                  </tr>
                </thead>
                <tbody>
                  {OHABOLANA.map((o, i) => (
                    <tr key={o.id}>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: ".8rem", color: "var(--ink-3)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td>
                        <span className="mg" style={{ fontSize: "1.06rem" }}>
                          {o.mg}
                        </span>
                        <br />
                        <span style={{ color: "var(--ink-2)", fontSize: ".9rem" }}>{lang === "en" ? o.en : o.fr}</span>
                      </td>
                      <td style={{ color: "var(--ink-2)", fontSize: ".9rem" }}>
                        {lang === "mg" ? o.meaning_mg : lang === "en" ? o.meaning_en : o.meaning_fr}
                      </td>
                      <td style={{ fontSize: ".88rem" }}>{themeLabel(o.theme)}</td>
                      <td style={{ fontSize: ".82rem", color: "var(--ink-3)" }}>
                        {o.source_url ? (
                          <a href={o.source_url} target="_blank" rel="noreferrer noopener" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>
                            {o.source}
                          </a>
                        ) : (
                          o.source
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="section" id="kolontsaina">
          <div className="wrap">
            <p className="snum">
              <span>03</span>
              <b>
                {VIDEOS.length} {lang === "mg" ? "horonan-tsary" : lang === "en" ? "videos" : "vidéos"}
              </b>
            </p>
            <h2 style={{ marginBottom: 12 }}>{t.cultureTitle}</h2>
            <p className="lead" style={{ marginBottom: 22 }}>
              {t.cultureLead}
            </p>

            <div className="chips" style={{ marginBottom: 26 }}>
              <button className="chip" aria-pressed={cat === "all"} onClick={() => setCat("all")}>
                {t.filterAll}
              </button>
              {Object.entries(CATEGORIES).map(([k, v]) => (
                <button key={k} className="chip" aria-pressed={cat === k} onClick={() => setCat(k)}>
                  {lang === "mg" ? v.mg : v.fr}
                </button>
              ))}
            </div>

            <div className="videos">
              {shownVideos.map((v) => (
                <VideoCard key={v.id} v={v} play={play} />
              ))}
            </div>
          </div>
        </section>

        {CONTACTS.length > 0 && (
          <section className="section section-tint" id="miresaka-olona">
            <div className="wrap">
              <p className="snum">
                <span>04</span>
                <b>{CONTACTS.length}</b>
              </p>
              <h2 style={{ marginBottom: 12 }}>{t.talkTitle}</h2>
              <p className="lead" style={{ marginBottom: 30 }}>
                {t.talkLead}
              </p>
              <div className="grid grid-2">
                {CONTACTS.map((c) => (
                  <div className="panel" key={c.url}>
                    <h3 style={{ marginBottom: 8 }}>{c.name}</h3>
                    <p className="muted" style={{ marginBottom: 10 }}>
                      {c.kind}, {c.city}
                      {c.phone ? `, ${c.phone}` : ""}
                    </p>
                    <p style={{ fontSize: ".93rem", marginBottom: 14 }}>{c.note[lang]}</p>
                    <a className="btn btn-sm" href={c.url} target="_blank" rel="noreferrer noopener" style={{ maxWidth: "100%" }}>
                      {domainOf(c.url)}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section" id="marina">
          <div className="wrap">
            <p className="snum">
              <span>05</span>
              <b>{t.truthTitle}</b>
            </p>
            <h2 style={{ marginBottom: 30 }}>{t.truthTitle}</h2>
            <div className="grid grid-2">
              <div className="panel">
                <h3 style={{ marginBottom: 16, color: "var(--green)" }}>{t.truthDo}</h3>
                {DOES[lang].map((line, i) => (
                  <p key={i} style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: ".95rem", color: "var(--ink-2)" }}>
                    <span style={{ width: 10, height: 10, background: "var(--green)", borderRadius: "var(--r-full)", flexShrink: 0, marginTop: 7 }} aria-hidden="true" />
                    <span>{line}</span>
                  </p>
                ))}
              </div>
              <div className="panel">
                <h3 style={{ marginBottom: 16, color: "var(--red-deep)" }}>{t.truthDont}</h3>
                {DONTS[lang].map((line, i) => (
                  <p key={i} style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: ".95rem", color: "var(--ink-2)" }}>
                    <span style={{ width: 10, height: 10, border: "2px solid var(--red)", borderRadius: "var(--r-full)", flexShrink: 0, marginTop: 7 }} aria-hidden="true" />
                    <span>{line}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section section-ink">
          <div className="wrap">
            <p className="snum">
              <span>06</span>
              <FlagRow count={5} height={16} />
            </p>
            <h2 style={{ marginBottom: 12 }}>{t.srcTitle}</h2>
            <p className="lead" style={{ marginBottom: 28 }}>
              {t.srcLead}
            </p>
            <div className="grid grid-3">
              {ohabolanaData.sources.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{
                    border: "1px solid rgba(255,255,255,.28)",
                    borderRadius: "var(--r-lg)",
                    padding: "20px 22px",
                    display: "block",
                    color: "#FFFFFF",
                  }}
                >
                  <b style={{ display: "block", fontSize: ".97rem", marginBottom: 6 }}>{s.label}</b>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: ".76rem", color: "rgba(255,255,255,.68)" }}>{s.note}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <FlagRule thickness={4} />
      <footer className="foot">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <h4>iMahay</h4>
              <p>{t.footNote}</p>
            </div>
            <div>
              <h4>{t.navOhabolana}</h4>
              <p>
                {lang === "mg"
                  ? "Ny ohabolana rehetra dia voamarina tamin'ny Rakibolana, izay mamerina ny laharana ao amin'ny boky."
                  : lang === "en"
                  ? "Every proverb is checked against the Rakibolana, which reprints the number it carries in the collection."
                  : "Chaque proverbe est vérifié dans le Rakibolana, qui reprend le numéro porté dans le recueil."}
              </p>
            </div>
            <div>
              <h4>{t.navCulture}</h4>
              <p>
                {lang === "mg"
                  ? "Ny horonan-tsary rehetra dia an'ny mpamorona azy, ary alefa avy amin'ny YouTube."
                  : lang === "en"
                  ? "Every video belongs to its author and plays from YouTube."
                  : "Chaque vidéo appartient à son auteur et se lit depuis YouTube."}
              </p>
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: ".74rem" }}>
            {lang === "mg"
              ? `Ohabolana ${OHABOLANA.length}, horonan-tsary ${VIDEOS.length}, nohamarinina ny ${culture.checked_at}.`
              : lang === "en"
              ? `${OHABOLANA.length} proverbs, ${VIDEOS.length} videos, links checked on ${culture.checked_at}.`
              : `${OHABOLANA.length} proverbes, ${VIDEOS.length} vidéos, liens vérifiés le ${culture.checked_at}.`}
          </p>
        </div>
      </footer>
    </>
  );
}
