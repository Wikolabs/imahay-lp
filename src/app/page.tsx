"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import culture from "@/data/culture.json";
import ohabolanaData from "@/data/ohabolana.json";

/* ────────────────────────────────────────────────────────────────────────────
   Types et donnees
   ──────────────────────────────────────────────────────────────────────────── */

type Lang = "mg" | "fr" | "en";
type ThemeKey = keyof typeof ohabolanaData.themes;

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

const OHABOLANA = ohabolanaData.items as Ohabolana[];
const THEMES = ohabolanaData.themes as Record<
  string,
  { mg: string; fr: string; en: string; ask_mg: string; ask_fr: string; ask_en: string; fallback?: string }
>;
const THEME_KEYS = Object.keys(THEMES);
const VIDEOS = culture.videos as Video[];
const CATEGORIES = culture.categories as Record<string, { mg: string; fr: string }>;
const SEARCHES = culture.searches as Record<string, string>;

/* Un theme peut n'avoir aucun proverbe qui lui soit propre : fomba, par
   exemple, parle de rites et non de conduite. Il declare alors un theme de
   repli dans ohabolana.json plutot que de rester vide. */
function ohabolanaFor(theme: string | null): Ohabolana | null {
  if (!theme) return null;
  const pool = OHABOLANA.filter((o) => o.theme === theme);
  if (pool.length) return pool[Math.floor(Date.now() / 86400000) % pool.length];
  const fallback = THEMES[theme]?.fallback;
  if (!fallback) return null;
  const alt = OHABOLANA.filter((o) => o.theme === fallback);
  return alt.length ? alt[0] : null;
}

function videosFor(theme: string | null, limit = 2): Video[] {
  if (!theme) return [];
  return VIDEOS.filter((v) => v.themes.includes(theme)).slice(0, limit);
}

/* ────────────────────────────────────────────────────────────────────────────
   Textes d'interface
   ──────────────────────────────────────────────────────────────────────────── */

const T: Record<Lang, Record<string, string>> = {
  mg: {
    navTalk: "Miresaka",
    navOhabolana: "Ohabolana",
    navCulture: "Kolontsaina",
    navTruth: "Ny marina",
    heroTitle: "Ny fahendrena malagasy, valiana ny fanontanianao.",
    heroLead:
      "Apetraho ny olanao amin'ny teny malagasy. Mihaino i iMahay, mamaly amim-panajana, dia atolony anao ny ohabolana marina mifanaraka amin'izay entinao, sy ny horonan-tsary manazava azy.",
    heroCta: "Apetraho ny fanontanianao",
    heroCta2: "Jereo ny horonan-tsary",
    ohOfDay: "Ohabolana androany",
    talkTitle: "Miresaka amin'i iMahay",
    talkLead:
      "Tsy misy kaonty, tsy misy anarana angatahina. Ny resaka dia tsy voatahiry rehefa mikatona ny pejy.",
    placeholder: "Soraty eto izay entinao androany.",
    send: "Alefa",
    thinking: "Mieritreritra",
    pickTheme: "Na safidio ny toe-javatra manakaiky indrindra",
    asideEmpty:
      "Rehefa mamaly i iMahay, hiseho eto ny ohabolana marina sy ny horonan-tsary mifandraika amin'ny resaka.",
    asideTheme: "Toe-javatra",
    asideExample: "Ohatra",
    asideOh: "Ny ohabolana",
    asideVideo: "Henoy",
    ohTitle: "Ny ohabolana voamarina",
    ohLead:
      "Tsy manoratra ohabolana i iMahay. Izao lisitra izao ihany no ampiasainy, ary voatondro ny loharano nakana azy.",
    cultureTitle: "Ny feo tokony ho henoina",
    cultureLead:
      "Kabary, ohabolana nohazavaina, fomba aman-panao, hira gasy. Tsindrio ny sary vao mihodina ny horonan-tsary, tsy alefa mialoha.",
    filterAll: "Izy rehetra",
    searchMore: "Tadiavo hafa amin'ny YouTube",
    truthTitle: "Izay ataon'i iMahay, sy izay tsy ataony",
    truthDo: "Izay ataony",
    truthDont: "Izay tsy ataony",
    srcTitle: "Ny loharano",
    srcLead: "Ny ohabolana rehetra dia avy amin'ireto loharano ireto. Ny horonan-tsary dia an'ny tompony.",
    footNote:
      "Tsy dokotera, tsy mpisolovava, tsy mpanolo-tsaina ara-bola i iMahay. Raha misy loza mananontanona, antsoy ny fianakaviana na ny fokontany.",
    free: "Maimaim-poana, tsy mitaky anarana",
  },
  fr: {
    navTalk: "Parler",
    navOhabolana: "Proverbes",
    navCulture: "Culture",
    navTruth: "Ce qu'il fait",
    heroTitle: "La sagesse malgache repond a ta question.",
    heroLead:
      "Pose ce que tu portes, en malgache ou en francais. iMahay ecoute, repond avec respect, puis te donne le proverbe exact qui correspond et la video qui l'explique.",
    heroCta: "Pose ta question",
    heroCta2: "Voir les videos",
    ohOfDay: "Proverbe du jour",
    talkTitle: "Parler avec iMahay",
    talkLead: "Aucun compte, aucun nom demande. La conversation n'est pas conservee quand la page se ferme.",
    placeholder: "Ecris ici ce que tu portes aujourd'hui.",
    send: "Envoyer",
    thinking: "Reflechit",
    pickTheme: "Ou choisis la situation la plus proche",
    asideEmpty:
      "Des qu'iMahay repond, le proverbe exact et la video correspondante apparaissent ici.",
    asideTheme: "Situation",
    asideExample: "Exemple",
    asideOh: "Le proverbe",
    asideVideo: "A ecouter",
    ohTitle: "Les proverbes verifies",
    ohLead:
      "iMahay n'ecrit jamais un ohabolana. Il ne peut citer que cette liste, et chaque entree porte sa source.",
    cultureTitle: "Les voix a ecouter",
    cultureLead:
      "Kabary, proverbes expliques, fomba aman-panao, hira gasy. La video ne se charge qu'apres un clic sur la vignette.",
    filterAll: "Tout",
    searchMore: "Chercher d'autres videos sur YouTube",
    truthTitle: "Ce qu'iMahay fait, et ce qu'il ne fait pas",
    truthDo: "Ce qu'il fait",
    truthDont: "Ce qu'il ne fait pas",
    srcTitle: "Les sources",
    srcLead: "Les proverbes viennent de ces recueils. Les videos restent la propriete de leurs auteurs.",
    footNote:
      "iMahay n'est ni medecin, ni avocat, ni conseiller financier. En cas de danger, appelle ta famille ou le fokontany.",
    free: "Gratuit, sans nom demande",
  },
  en: {
    navTalk: "Talk",
    navOhabolana: "Proverbs",
    navCulture: "Culture",
    navTruth: "What it does",
    heroTitle: "Malagasy wisdom answers your question.",
    heroLead:
      "Say what you carry, in Malagasy, French or English. iMahay listens, answers with respect, then hands you the exact proverb that fits and the video that explains it.",
    heroCta: "Ask your question",
    heroCta2: "Watch the videos",
    ohOfDay: "Proverb of the day",
    talkTitle: "Talk with iMahay",
    talkLead: "No account, no name asked. The conversation is not kept once the page closes.",
    placeholder: "Write here what you are carrying today.",
    send: "Send",
    thinking: "Thinking",
    pickTheme: "Or pick the closest situation",
    asideEmpty: "As soon as iMahay answers, the exact proverb and the matching video appear here.",
    asideTheme: "Situation",
    asideExample: "Example",
    asideOh: "The proverb",
    asideVideo: "Listen",
    ohTitle: "The verified proverbs",
    ohLead:
      "iMahay never writes an ohabolana. It can only draw from this list, and every entry carries its source.",
    cultureTitle: "Voices worth hearing",
    cultureLead:
      "Kabary, explained proverbs, customs, hira gasy. A video loads only after you click its thumbnail.",
    filterAll: "All",
    searchMore: "Search YouTube for more",
    truthTitle: "What iMahay does, and what it does not",
    truthDo: "What it does",
    truthDont: "What it does not do",
    srcTitle: "Sources",
    srcLead: "Proverbs come from these collections. Videos remain the property of their authors.",
    footNote:
      "iMahay is not a doctor, a lawyer or a financial adviser. If you are in danger, call your family or the fokontany.",
    free: "Free, no name asked",
  },
};

const DOES: Record<Lang, string[]> = {
  mg: [
    "Mihaino ny olanao, amin'ny teny malagasy, frantsay na anglisy.",
    "Manondro ohabolana marina, nalaina tamin'ny boky voatondro.",
    "Manolotra horonan-tsary kabary na hira gasy mifandraika amin'ny resaka.",
    "Manoro dingana tsotra azo atao androany.",
  ],
  fr: [
    "Ecoute ce que tu portes, en malgache, en francais ou en anglais.",
    "Designe un proverbe exact, pris dans un recueil identifie.",
    "Propose un kabary ou un hira gasy en rapport avec la conversation.",
    "Indique un pas simple, faisable aujourd'hui.",
  ],
  en: [
    "Listens to what you carry, in Malagasy, French or English.",
    "Points to an exact proverb, taken from a named collection.",
    "Offers a kabary or hira gasy video tied to the conversation.",
    "Names one simple step you can take today.",
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
    "N'ecrit jamais un proverbe nouveau, n'invente pas une parole des razana.",
    "Ne fait pas de sikidy, ne promet ni chance ni guerison.",
    "Ne demande jamais d'argent ni de sacrifice.",
    "Ne donne aucun conseil medical, juridique ou d'investissement.",
  ],
  en: [
    "Never writes a new proverb, never invents words of the razana.",
    "Does no sikidy, promises neither luck nor healing.",
    "Never asks for money or sacrifice.",
    "Gives no medical, legal or investment advice.",
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
   Pieces
   ──────────────────────────────────────────────────────────────────────────── */

/* Aloalo : le poteau sculpte qui marque une memoire. Tete de zebu, losange,
   figure, medaillon, fut. Dessine, jamais un emoji. */
function Aloalo({ height = 168, color = "var(--line-strong)" }: { height?: number; color?: string }) {
  return (
    <svg width={height / 2.4} height={height} viewBox="0 0 80 192" fill="none" aria-hidden="true">
      <path d="M32 26 C 16 26, 8 14, 16 4" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M48 26 C 64 26, 72 14, 64 4" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="40" cy="28" r="9" stroke={color} strokeWidth="1.6" />
      <circle cx="40" cy="28" r="1.8" fill={color} />
      <path d="M40 37 L 52 50 L 40 62 L 28 50 Z" stroke={color} strokeWidth="1.4" />
      <path d="M40 43 L 40 56 M34 50 L 46 50" stroke={color} strokeWidth="1.2" />
      <circle cx="40" cy="72" r="5" stroke={color} strokeWidth="1.4" />
      <path d="M40 77 L 40 95 M 32 84 L 48 84 M 36 95 L 32 110 M 44 95 L 48 110" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="40" cy="120" r="8" stroke={color} strokeWidth="1.4" />
      <path d="M32 120 L 48 120 M 40 112 L 40 128" stroke={color} strokeWidth="1.2" />
      <rect x="36" y="130" width="8" height="58" stroke={color} strokeWidth="1.4" />
      <path d="M36 145 L 32 148 L 36 151 Z M44 145 L 48 148 L 44 151 Z M36 162 L 32 165 L 36 168 Z M44 162 L 48 165 L 44 168 Z" fill={color} />
      <path d="M26 190 H 54" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Wordmark() {
  return (
    <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
      <span style={{ color: "var(--green-deep)" }}>i</span>
      <span style={{ color: "var(--ink)" }}>Mahay</span>
      <span style={{ color: "var(--red)" }}>.</span>
    </span>
  );
}

function OhabolanaBlock({ o, lang, showSource = true }: { o: Ohabolana; lang: Lang; showSource?: boolean }) {
  const translation = lang === "mg" ? o.fr : lang === "en" ? o.en : o.fr;
  return (
    <div className="oh">
      <p className="oh-mg">{o.mg}</p>
      <p className="oh-fr">{translation}</p>
      {showSource && (
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
      )}
    </div>
  );
}

function VideoCard({ v, lang }: { v: Video; lang: Lang }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="video">
      {open ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
          title={v.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <button className="video-thumb" onClick={() => setOpen(true)} aria-label={v.title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" />
          <span>{lang === "mg" ? "Alefa" : lang === "en" ? "Play" : "Lire"}</span>
        </button>
      )}
      <div className="video-meta">
        <b>{v.title}</b>
        <span>{v.channel}</span>
        <p>{v.why}</p>
      </div>
    </article>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────────────────────── */

type Msg = { role: "you" | "imahay"; text: string };

export default function Home() {
  const [lang, setLang] = useState<Lang>("mg");
  const t = T[lang];

  /* Conversation */
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [theme, setTheme] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  /* Proverbe du jour, stable sur la journee, identique pour tout le monde. */
  const daily = useMemo(() => {
    const day = Math.floor(Date.now() / 86400000);
    return OHABOLANA[day % OHABOLANA.length];
  }, []);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    setMessages((m) => [...m, { role: "you", text }]);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, lang }),
      });
      const j = await r.json();
      if (j.reply) {
        setMessages((m) => [...m, { role: "imahay", text: j.reply }]);
        if (j.theme) setTheme(j.theme);
      } else {
        setMessages((m) => [
          ...m,
          {
            role: "imahay",
            text:
              lang === "mg"
                ? "Misy olana amin'ny fifandraisana izao. Andramo indray afaka kelikely."
                : lang === "en"
                ? "The connection failed just now. Please try again in a moment."
                : "La connexion a echoue a l'instant. Reessaie dans un moment.",
          },
        ]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "imahay",
          text:
            lang === "mg"
              ? "Tsy tafita ny hafatra. Andramo indray."
              : lang === "en"
              ? "The message did not go through. Please try again."
              : "Le message n'est pas parti. Reessaie.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  /* Avant la premiere reponse, le volet montre deja un cas reel, marque comme
     exemple : on voit a quoi sert le volet sans avoir a ecrire quoi que ce soit. */
  const asideTheme = theme ?? daily.theme;
  const isExample = theme === null;
  const asideOh = ohabolanaFor(asideTheme);
  const asideVideos = videosFor(asideTheme, 1);

  /* Videos */
  const [cat, setCat] = useState<string>("all");
  const shown = cat === "all" ? VIDEOS : VIDEOS.filter((v) => v.category === cat);

  const themeLabel = (k: string) => THEMES[k]?.[lang] ?? k;
  const themeAsk = (k: string) => THEMES[k]?.[`ask_${lang}` as "ask_mg"] ?? "";

  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <a href="#top" aria-label="iMahay">
            <Wordmark />
          </a>
          <nav className="nav-links">
            <a href="#miresaka">{t.navTalk}</a>
            <a href="#ohabolana">{t.navOhabolana}</a>
            <a href="#kolontsaina">{t.navCulture}</a>
            <a href="#marina">{t.navTruth}</a>
            <div className="langs">
              {(["mg", "fr", "en"] as Lang[]).map((l) => (
                <button key={l} aria-pressed={lang === l} onClick={() => setLang(l)}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </nav>
          <div className="langs" style={{ display: "none" }} />
        </div>
      </header>

      <main id="top">
        {/* 00 ─ Ouverture */}
        <section className="section" style={{ borderTop: "none", paddingTop: "clamp(40px, 7vh, 76px)" }}>
          <div className="wrap">
            <div
              style={{
                display: "grid",
                gap: "clamp(24px, 4vw, 56px)",
                gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr)",
                alignItems: "start",
              }}
              className="hero-grid"
            >
              <div className="rise">
                <p className="snum">
                  <span>00</span>
                  <b>{t.free}</b>
                </p>
                <h1 style={{ marginBottom: 20 }}>{t.heroTitle}</h1>
                <p className="lead" style={{ marginBottom: 26 }}>
                  {t.heroLead}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  <a className="btn" href="#miresaka">
                    {t.heroCta}
                  </a>
                  <a className="btn btn-soft" href="#kolontsaina">
                    {t.heroCta2}
                  </a>
                </div>
              </div>

              <aside className="panel rise" style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, paddingTop: 4 }}>
                  <Aloalo height={150} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p className="snum" style={{ marginBottom: 14 }}>
                    <b>{t.ohOfDay}</b>
                  </p>
                  <OhabolanaBlock o={daily} lang={lang} />
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* 01 ─ Conversation */}
        <section className="section section-tint" id="miresaka">
          <div className="wrap">
            <p className="snum">
              <span>01</span>
              <b>{t.navTalk}</b>
            </p>
            <h2 style={{ marginBottom: 12 }}>{t.talkTitle}</h2>
            <p className="lead" style={{ marginBottom: 28 }}>
              {t.talkLead}
            </p>

            <div
              style={{
                display: "grid",
                gap: "clamp(14px, 2vw, 20px)",
                gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)",
                alignItems: "stretch",
              }}
              className="chat-grid"
            >
              <div className="panel" style={{ display: "flex", flexDirection: "column" }}>
                <div className="thread" ref={threadRef} style={{ minHeight: 220, flex: 1 }}>
                  {messages.length === 0 ? (
                    <p className="muted" style={{ padding: "18px 0" }}>
                      {t.pickTheme}
                    </p>
                  ) : (
                    messages.map((m, i) => (
                      <div key={i} className={m.role === "you" ? "msg msg-you" : "msg msg-ai"}>
                        {m.text}
                      </div>
                    ))
                  )}
                  {busy && (
                    <span className="typing">
                      {t.thinking}
                      <span aria-hidden="true">...</span>
                    </span>
                  )}
                </div>

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
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        ask(input);
                      }
                    }}
                  />
                  <button className="btn" type="submit" disabled={busy || !input.trim()}>
                    {t.send}
                  </button>
                </form>

                <div className="chips">
                  {THEME_KEYS.map((k) => (
                    <button
                      key={k}
                      className="chip"
                      aria-pressed={theme === k}
                      onClick={() => ask(themeAsk(k))}
                    >
                      {themeLabel(k)}
                    </button>
                  ))}
                </div>
              </div>

              <aside className="panel panel-tint">
                {asideOh ? (
                  <>
                    <p className="snum" style={{ marginBottom: 12 }}>
                      <span>{isExample ? t.asideExample : t.asideTheme}</span>
                      <b>{themeLabel(asideTheme)}</b>
                    </p>
                    {isExample && (
                      <p className="muted" style={{ marginBottom: 16 }}>
                        {t.asideEmpty}
                      </p>
                    )}
                    <p className="snum" style={{ marginBottom: 10 }}>
                      <b>{t.asideOh}</b>
                    </p>
                    <OhabolanaBlock o={asideOh} lang={lang} />
                    <p className="muted" style={{ marginTop: 14 }}>
                      {lang === "mg" ? asideOh.meaning_mg : lang === "en" ? asideOh.meaning_en : asideOh.meaning_fr}
                    </p>
                    {asideVideos.length > 0 && (
                      <>
                        <hr className="rule" />
                        <p className="snum" style={{ marginBottom: 12 }}>
                          <b>{t.asideVideo}</b>
                        </p>
                        <div className="videos" style={{ gridTemplateColumns: "1fr" }}>
                          {asideVideos.map((v) => (
                            <VideoCard key={v.id} v={v} lang={lang} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <p className="muted">{t.asideEmpty}</p>
                )}
              </aside>
            </div>
          </div>
        </section>

        {/* 02 ─ Ohabolana */}
        <section className="section" id="ohabolana">
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
                    <th style={{ width: "18%" }}>{lang === "mg" ? "Toe-javatra" : lang === "en" ? "Situation" : "Situation"}</th>
                    <th style={{ width: "16%" }}>{lang === "mg" ? "Loharano" : lang === "en" ? "Source" : "Source"}</th>
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
                        <span style={{ color: "var(--ink-2)", fontSize: ".9rem" }}>
                          {lang === "en" ? o.en : o.fr}
                        </span>
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

        {/* 03 ─ Kolontsaina */}
        <section className="section section-tint" id="kolontsaina">
          <div className="wrap">
            <p className="snum">
              <span>03</span>
              <b>
                {VIDEOS.length} {lang === "mg" ? "horonan-tsary" : lang === "en" ? "videos" : "videos"}
              </b>
            </p>
            <h2 style={{ marginBottom: 12 }}>{t.cultureTitle}</h2>
            <p className="lead" style={{ marginBottom: 22 }}>
              {t.cultureLead}
            </p>

            <div className="chips" style={{ marginBottom: 24 }}>
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
              {shown.map((v) => (
                <VideoCard key={v.id} v={v} lang={lang} />
              ))}
            </div>
          </div>
        </section>

        {/* 04 ─ Ce qu'iMahay fait */}
        <section className="section" id="marina">
          <div className="wrap">
            <p className="snum">
              <span>04</span>
              <b>{t.navTruth}</b>
            </p>
            <h2 style={{ marginBottom: 30 }}>{t.truthTitle}</h2>

            <div className="grid grid-2">
              <div className="panel">
                <h3 style={{ marginBottom: 16, color: "var(--green-deep)" }}>{t.truthDo}</h3>
                {DOES[lang].map((line, i) => (
                  <p key={i} style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: ".95rem", color: "var(--ink-2)" }}>
                    <span style={{ width: 10, height: 10, background: "var(--green)", flexShrink: 0, marginTop: 7 }} aria-hidden="true" />
                    <span>{line}</span>
                  </p>
                ))}
              </div>
              <div className="panel">
                <h3 style={{ marginBottom: 16, color: "var(--red-deep)" }}>{t.truthDont}</h3>
                {DONTS[lang].map((line, i) => (
                  <p key={i} style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: ".95rem", color: "var(--ink-2)" }}>
                    <span style={{ width: 10, height: 10, border: "2px solid var(--line-strong)", flexShrink: 0, marginTop: 7 }} aria-hidden="true" />
                    <span>{line}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 05 ─ Sources */}
        <section className="section section-ink">
          <div className="wrap">
            <p className="snum">
              <span>05</span>
              <b>{t.srcTitle}</b>
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
                    border: "1px solid rgba(250,248,241,.26)",
                    padding: "18px 20px",
                    display: "block",
                    color: "var(--paper)",
                  }}
                >
                  <b style={{ display: "block", fontSize: ".97rem", marginBottom: 6 }}>{s.label}</b>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: ".76rem", color: "rgba(250,248,241,.62)" }}>{s.note}</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <div className="foot-grid">
            <div>
              <h4>iMahay</h4>
              <p>{t.footNote}</p>
            </div>
            <div>
              <h4>{t.navCulture}</h4>
              <p>
                {lang === "mg"
                  ? "Ny horonan-tsary rehetra dia an'ny mpamorona azy, ary alefa avy amin'ny YouTube."
                  : lang === "en"
                  ? "Every video belongs to its author and plays from YouTube."
                  : "Chaque video appartient a son auteur et se lit depuis YouTube."}
              </p>
              <p style={{ marginTop: 8 }}>
                <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(SEARCHES.fomba)}`} target="_blank" rel="noreferrer noopener">
                  {t.searchMore}
                </a>
              </p>
            </div>
            <div>
              <h4>Wikolabs</h4>
              <p>
                <a href="https://wikolabs.com" target="_blank" rel="noreferrer noopener">
                  wikolabs.com
                </a>
              </p>
              <p>
                <a href="mailto:team@wikolabs.com">team@wikolabs.com</a>
              </p>
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: ".74rem" }}>
            {lang === "mg"
              ? `Ohabolana ${OHABOLANA.length}, horonan-tsary ${VIDEOS.length}, nohamarinina ny ${culture.checked_at}.`
              : lang === "en"
              ? `${OHABOLANA.length} proverbs, ${VIDEOS.length} videos, links checked on ${culture.checked_at}.`
              : `${OHABOLANA.length} proverbes, ${VIDEOS.length} videos, liens verifies le ${culture.checked_at}.`}
          </p>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid, .chat-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
