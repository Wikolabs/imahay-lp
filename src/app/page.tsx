"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import culture from "@/data/culture.json";
import ohabolanaData from "@/data/ohabolana.json";
import Aloalo from "./Aloalo";
import { Flag, FlagRow, FlagRule } from "./Flag";

/* ────────────────────────────────────────────────────────────────────────────
   Donnees
   ──────────────────────────────────────────────────────────────────────────── */

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

const OHABOLANA = ohabolanaData.items as Ohabolana[];
const THEMES = ohabolanaData.themes as Record<string, ThemeEntry>;
const THEME_KEYS = Object.keys(THEMES);
const VIDEOS = culture.videos as Video[];
const CATEGORIES = culture.categories as Record<string, { mg: string; fr: string }>;

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

function videoFor(theme: string | null): Video | null {
  if (!theme) return null;
  const pool = VIDEOS.filter((v) => v.themes.includes(theme));
  return pool.length ? pool[DAY() % pool.length] : null;
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
    aloaloTitle: "Ny aloalo",
    aloaloLead:
      "Tsotra ny hazo, saingy misy sokitra mifanaraka eo aminy : lohan'omby sy tandrony, diamondra, boribory, efamira, tsipika. Isaky ny aloalo dia tantara iray naorina tamin'ireo endrika ireo.",
    talkTitle: "Miresaka amin'i iMahay",
    talkLead:
      "Tsy misy kaonty, tsy misy anarana angatahina. Ny resaka dia tsy voatahiry rehefa mikatona ny pejy.",
    chatName: "iMahay",
    chatStatus: "Maimaim-poana, misokatra andro aman'alina",
    placeholder: "Soraty eto izay entinao androany.",
    send: "Alefa",
    thinking: "Mieritreritra",
    welcome:
      "Tongasoa. Lazao amin'ny teninao izay entinao androany, na tsindrio ny toe-javatra manakaiky indrindra eto ambany.",
    pickTheme: "Safidio ny toe-javatra",
    pickPrompt: "Na alaivo ny iray amin'ireto fanontaniana ireto",
    attach: "Ny ohabolana mifanaraka amin'izany",
    example: "Ohatra",
    attachVideo: "Henoy",
    ohTitle: "Ny ohabolana voamarina",
    ohLead:
      "Tsy manoratra ohabolana i iMahay. Izao lisitra izao ihany no ampiasainy, ary voatondro ny loharano nakana azy.",
    cultureTitle: "Ny feo tokony ho henoina",
    cultureLead:
      "Kabary, ohabolana nohazavaina, fomba aman-panao, hira gasy. Tsindrio ny sary vao mihodina ny horonan-tsary, tsy alefa mialoha.",
    filterAll: "Izy rehetra",
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
    aloaloTitle: "L'aloalo",
    aloaloLead:
      "Le bois est nu, mais on y empile des formes : tete de zebu et cornes, losange, disque, carre, chevrons. Chaque poteau raconte une histoire construite avec ces formes.",
    talkTitle: "Parler avec iMahay",
    talkLead: "Aucun compte, aucun nom demande. La conversation n'est pas conservee quand la page se ferme.",
    chatName: "iMahay",
    chatStatus: "Gratuit, ouvert jour et nuit",
    placeholder: "Ecris ici ce que tu portes aujourd'hui.",
    send: "Envoyer",
    thinking: "Reflechit",
    welcome:
      "Bienvenue. Dis avec tes mots ce que tu portes aujourd'hui, ou touche la situation la plus proche ci-dessous.",
    pickTheme: "Choisis la situation",
    pickPrompt: "Ou prends l'une de ces questions",
    attach: "Le proverbe qui correspond",
    example: "Exemple",
    attachVideo: "A ecouter",
    ohTitle: "Les proverbes verifies",
    ohLead:
      "iMahay n'ecrit jamais un ohabolana. Il ne peut citer que cette liste, et chaque entree porte sa source.",
    cultureTitle: "Les voix a ecouter",
    cultureLead:
      "Kabary, proverbes expliques, fomba aman-panao, hira gasy. La video ne se charge qu'apres un clic sur la vignette.",
    filterAll: "Tout",
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
    aloaloTitle: "The aloalo",
    aloaloLead:
      "The wood is plain, but shapes are stacked on it: zebu head and horns, diamond, disc, square, chevrons. Each post tells a story built from those shapes.",
    talkTitle: "Talk with iMahay",
    talkLead: "No account, no name asked. The conversation is not kept once the page closes.",
    chatName: "iMahay",
    chatStatus: "Free, open day and night",
    placeholder: "Write here what you are carrying today.",
    send: "Send",
    thinking: "Thinking",
    welcome:
      "Welcome. Say in your own words what you carry today, or tap the closest situation below.",
    pickTheme: "Pick the situation",
    pickPrompt: "Or take one of these questions",
    attach: "The proverb that fits",
    example: "Example",
    attachVideo: "Listen",
    ohTitle: "The verified proverbs",
    ohLead:
      "iMahay never writes an ohabolana. It can only draw from this list, and every entry carries its source.",
    cultureTitle: "Voices worth hearing",
    cultureLead:
      "Kabary, explained proverbs, customs, hira gasy. A video loads only after you click its thumbnail.",
    filterAll: "All",
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

function Wordmark() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
      <Flag height={17} />
      <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>
        <span style={{ color: "var(--green)" }}>i</span>
        <span style={{ color: "var(--ink)" }}>Mahay</span>
        <span style={{ color: "var(--red)" }}>.</span>
      </span>
    </span>
  );
}

function OhabolanaBlock({ o, lang, showSource = true }: { o: Ohabolana; lang: Lang; showSource?: boolean }) {
  const translation = lang === "en" ? o.en : o.fr;
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

type Msg = { role: "you"; text: string } | { role: "imahay"; text: string; theme: string | null };

export default function Home() {
  const [lang, setLang] = useState<Lang>("mg");
  const t = T[lang];

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<string>(THEME_KEYS[0]);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const daily = useMemo(() => OHABOLANA[DAY() % OHABOLANA.length], []);

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
        setMessages((m) => [...m, { role: "imahay", text: j.reply, theme: j.theme ?? null }]);
      } else {
        throw new Error("no_reply");
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "imahay",
          theme: null,
          text:
            lang === "mg"
              ? "Tsy tafita ny hafatra. Andramo indray afaka kelikely."
              : lang === "en"
              ? "The message did not go through. Please try again in a moment."
              : "Le message n'est pas parti. Reessaie dans un moment.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const [cat, setCat] = useState<string>("all");
  const shown = cat === "all" ? VIDEOS : VIDEOS.filter((v) => v.category === cat);

  const themeLabel = (k: string) => THEMES[k]?.[lang] ?? k;
  const prompts = THEMES[picked]?.[`prompts_${lang}` as "prompts_mg"] ?? [];
  const exampleOh = ohabolanaFor(picked);
  const exampleVideo = videoFor(picked);

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

      <main id="top">
        {/* 00 ─ Ouverture */}
        <section className="section" style={{ borderTop: "none", paddingTop: "clamp(38px, 6vh, 70px)" }}>
          <div className="wrap">
            <div
              className="hero-grid"
              style={{
                display: "grid",
                gap: "clamp(24px, 4vw, 56px)",
                gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr)",
                alignItems: "center",
              }}
            >
              <div className="rise">
                <p className="snum">
                  <FlagRow count={3} height={16} />
                  <b>{t.free}</b>
                </p>
                <h1 style={{ marginBottom: 20 }}>{t.heroTitle}</h1>
                <p className="lead" style={{ marginBottom: 28 }}>
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

              <aside className="panel rise" style={{ display: "flex", gap: 22, alignItems: "center" }}>
                <div style={{ flexShrink: 0 }}>
                  <Aloalo variant={0} height={190} shaft={58} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p className="snum" style={{ marginBottom: 14 }}>
                    <Flag height={15} />
                    <b>{t.ohOfDay}</b>
                  </p>
                  <OhabolanaBlock o={daily} lang={lang} />
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* 01 ─ Conversation, grande et centree */}
        <section className="section section-tint" id="miresaka">
          <div className="wrap">
            <div className="narrow" style={{ textAlign: "center", marginBottom: "clamp(26px, 4vh, 40px)" }}>
              <p className="snum" style={{ justifyContent: "center" }}>
                <span>01</span>
                <FlagRow count={5} height={16} />
              </p>
              <h2 style={{ marginBottom: 12 }}>{t.talkTitle}</h2>
              <p className="lead" style={{ margin: "0 auto" }}>
                {t.talkLead}
              </p>
            </div>

            <div className="chat">
              <div className="chat-head">
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  <Flag height={16} />
                  <b>{t.chatName}</b>
                </span>
                <span className="muted">{t.chatStatus}</span>
              </div>

              <div className="thread" ref={threadRef}>
                {messages.length === 0 ? (
                  <>
                    <div className="msg msg-ai">{t.welcome}</div>
                    {exampleOh && (
                      <div className="attach">
                        <div className="attach-head">
                          <Flag height={15} />
                          <span>
                            {t.example}, {themeLabel(picked)}
                          </span>
                        </div>
                        <div className="attach-body">
                          <OhabolanaBlock o={exampleOh} lang={lang} />
                          <p className="muted">
                            {lang === "mg" ? exampleOh.meaning_mg : lang === "en" ? exampleOh.meaning_en : exampleOh.meaning_fr}
                          </p>
                          {exampleVideo && (
                            <>
                              <p className="suggest-label" style={{ margin: 0 }}>
                                {t.attachVideo}
                              </p>
                              <VideoCard v={exampleVideo} lang={lang} />
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  messages.map((m, i) => {
                    if (m.role === "you") {
                      return (
                        <div key={i} className="msg msg-you">
                          {m.text}
                        </div>
                      );
                    }
                    const o = ohabolanaFor(m.theme);
                    const v = videoFor(m.theme);
                    return (
                      <div key={i} style={{ display: "contents" }}>
                        <div className="msg msg-ai">{m.text}</div>
                        {o && (
                          <div className="attach">
                            <div className="attach-head">
                              <Flag height={15} />
                              <span>
                                {t.attach}
                                {m.theme ? `, ${themeLabel(m.theme)}` : ""}
                              </span>
                            </div>
                            <div className="attach-body">
                              <OhabolanaBlock o={o} lang={lang} />
                              <p className="muted">
                                {lang === "mg" ? o.meaning_mg : lang === "en" ? o.meaning_en : o.meaning_fr}
                              </p>
                              {v && (
                                <>
                                  <p className="suggest-label" style={{ margin: 0 }}>
                                    {t.attachVideo}
                                  </p>
                                  <VideoCard v={v} lang={lang} />
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                {busy && (
                  <span className="typing">
                    {t.thinking}
                    <span aria-hidden="true">...</span>
                  </span>
                )}
              </div>

              <div className="suggest">
                <p className="suggest-label">{t.pickTheme}</p>
                <div className="chips">
                  {THEME_KEYS.map((k) => (
                    <button key={k} className="chip" aria-pressed={picked === k} onClick={() => setPicked(k)}>
                      {themeLabel(k)}
                    </button>
                  ))}
                </div>
                <p className="suggest-label" style={{ marginTop: 18 }}>
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
        </section>

        {/* 02 ─ Les aloalo */}
        <section className="section">
          <div className="wrap">
            <p className="snum">
              <span>02</span>
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

        {/* 03 ─ Ohabolana */}
        <section className="section section-tint" id="ohabolana">
          <div className="wrap">
            <p className="snum">
              <span>03</span>
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

        {/* 04 ─ Kolontsaina */}
        <section className="section" id="kolontsaina">
          <div className="wrap">
            <p className="snum">
              <span>04</span>
              <b>
                {VIDEOS.length} {lang === "mg" ? "horonan-tsary" : lang === "en" ? "videos" : "videos"}
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
              {shown.map((v) => (
                <VideoCard key={v.id} v={v} lang={lang} />
              ))}
            </div>
          </div>
        </section>

        {/* 05 ─ Ce qu'iMahay fait */}
        <section className="section section-tint" id="marina">
          <div className="wrap">
            <p className="snum">
              <span>05</span>
              <b>{t.navTruth}</b>
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

        {/* 06 ─ Sources */}
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
                  : "Chaque proverbe est verifie dans le Rakibolana, qui reprend le numero porte dans le recueil."}
              </p>
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
          .hero-grid { grid-template-columns: minmax(0, 1fr) !important; }
        }
      `}</style>
    </>
  );
}
