// Reconstruit src/data/ohabolana.json a partir de la verification menee contre
// le Rakibolana (motmalgache.org), qui reproduit chaque proverbe avec le numero
// de sa collection imprimee : Houlder, Cousins et Parrett, de Veyrieres, Nicol,
// Rinarasoa. Trois proverbes presents jusqu'ici dans l'app n'existent dans
// aucune de ces collections : ils sont retires, pas reformules.

import { readFile, writeFile } from "node:fs/promises";

const path = "src/data/ohabolana.json";
const data = JSON.parse(await readFile(path, "utf8"));

data.note =
  "Liste fermee. iMahay ne peut citer que ces proverbes et n'en ecrit jamais de nouveau. Chaque entree porte le recueil imprime d'ou elle vient, verifiee via le Rakibolana (motmalgache.org) qui reproduit les numeros d'origine.";
data.checked_at = "2026-09-14";

data.themes.fomba.fallback = "fihavanana";

data.sources = [
  {
    label: "Houlder, Ohabolana ou proverbes malgaches",
    url: "https://motmalgache.org/bins/ohabolana/ifanakonana",
    note: "Recueil de reference, indexe mot par mot",
  },
  {
    label: "Cousins et Parrett, Ny ohabolan'ny Ntaolo",
    url: "https://motmalgache.org/bins/ohabolana/fanahy",
    note: "Collection ancienne des proverbes des anciens",
  },
  {
    label: "de Veyrieres, Le livre de la sagesse malgache",
    url: "https://motmalgache.org/bins/ohabolana/hitsikitsika",
    note: "Proverbes numerotes, avec traduction francaise",
  },
  {
    label: "Nicol, Proverbes et locutions malgaches",
    url: "https://motmalgache.org/bins/ohabolana/tody",
    note: "Edition de 1935",
  },
  {
    label: "Rinarasoa, Ohabolana malagasy",
    url: "https://motmalgache.org/bins/ohabolana/tseroka",
    note: "Edition de 1974",
  },
  {
    label: "Rakibolana malagasy, Rajemisa-Raolison",
    url: "https://motmalgache.org/bins/ohabolana/ala",
    note: "Dictionnaire encyclopedique malgache",
  },
];

const items = [
  // ── Fihavanana ──────────────────────────────────────────────────────────
  {
    theme: "fihavanana",
    mg: "Tondro tokana tsy mahazo hao.",
    fr: "Un seul doigt n'attrape pas un pou.",
    en: "One finger alone cannot catch a louse.",
    meaning_mg: "Tsy vitan'ny irery ny asa, ny firaisankina no hery.",
    meaning_fr: "Seul, on ne vient pas a bout d'une tache. C'est l'image la plus classique de l'entraide malgache.",
    meaning_en: "Alone you finish nothing. The oldest Malagasy image of mutual help.",
    source: "Houlder 238, Cousins et Parrett 3124",
    source_url: "https://motmalgache.org/bins/ohabolana/tokana",
    confidence: "attested",
  },
  {
    theme: "fihavanana",
    mg: "Ny hazo tokana tsy mba ala.",
    fr: "Un seul arbre ne fait pas la foret.",
    en: "A single tree is not a forest.",
    meaning_mg: "Tsy misy lanjany ny olona mitokana, ny vondrona no maharitra.",
    meaning_fr: "Un individu isole ne pese rien. C'est le groupe qui fait la force et la duree.",
    meaning_en: "One person alone weighs nothing. The group carries both strength and time.",
    source: "Houlder 237, Cousins et Parrett 2260",
    source_url: "https://motmalgache.org/bins/ohabolana/ala",
    confidence: "attested",
  },
  {
    theme: "fihavanana",
    mg: "Aleo very tsikalakalam-bola toy izay very tsikalakalam-pihavanana.",
    fr: "Mieux vaut perdre les petits profits de l'argent que les petites attentions qui entretiennent la parente.",
    en: "Better to lose a little money than to lose a little of the kinship that binds.",
    meaning_mg: "Raha mifanandrina ny vola sy ny fihavanana, ny vola no afoy.",
    meaning_fr: "Quand l'argent et le lien humain s'opposent, on sacrifie l'argent.",
    meaning_en: "When money and the human bond collide, the money is what you give up.",
    source: "de Veyrieres 4103",
    source_url: "https://motmalgache.org/bins/ohabolana/tsikalakala",
    confidence: "attested",
  },

  // ── Fahendrena ──────────────────────────────────────────────────────────
  {
    theme: "fahendrena",
    mg: "Hitsikitsika tsy mandihy foana fa ao raha.",
    fr: "La crecerelle ne s'agite pas en vain, c'est qu'il y a quelque chose.",
    en: "The kestrel does not hover for nothing, something is there.",
    meaning_mg: "Misy antony foana ny fihetsika, vakio ny fikasana alohan'ny hitsara.",
    meaning_fr: "Personne ne se demene sans raison. Lis l'intention avant de juger.",
    meaning_en: "Nobody stirs without a reason. Read the intent before you judge.",
    source: "de Veyrieres 637",
    source_url: "https://motmalgache.org/bins/ohabolana/hitsikitsika",
    confidence: "attested",
  },
  {
    theme: "fahendrena",
    mg: "Ny teny toy ny atody, ka raha foy manana elatra.",
    fr: "Les paroles sont comme des oeufs, une fois ecloses elles ont des ailes.",
    en: "Words are like eggs, once hatched they have wings.",
    meaning_mg: "Tsy azo averina intsony ny teny efa nivoaka, lanjao aloha vao lazaina.",
    meaning_fr: "Une parole lachee ne se rattrape plus, elle vole partout. Il faut la peser avant.",
    meaning_en: "A word let go is never taken back, it flies everywhere. Weigh it first.",
    source: "de Veyrieres 4794",
    source_url: "https://motmalgache.org/bins/ohabolana/atody",
    confidence: "attested",
  },
  {
    theme: "fahendrena",
    mg: "Ny hevitry ny maro no fanjakana.",
    fr: "C'est l'avis du grand nombre qui fait le royaume.",
    en: "It is the counsel of the many that makes the kingdom.",
    meaning_mg: "Tsy maharitra ny fanapahan-kevitra raha tsy niaraha-nodinihina.",
    meaning_fr: "Une decision ne tient que si elle a ete deliberee collectivement.",
    meaning_en: "A decision only holds when it was deliberated together.",
    source: "de Veyrieres 301",
    source_url: "https://motmalgache.org/bins/ohabolana/maro",
    confidence: "attested",
  },
  {
    theme: "fahendrena",
    mg: "Ny hevitry ny maro mahataka-davitra.",
    fr: "L'avis du grand nombre porte loin.",
    en: "The counsel of the many reaches far.",
    meaning_mg: "Mahita lavitra kokoa noho ny an'ny tokana ny fiaraha-misaina.",
    meaning_fr: "La reflexion collective voit plus loin que celle d'un seul. La forme vezo est au dictionnaire, la forme merina est d'usage courant.",
    meaning_en: "Thinking together sees further than thinking alone. The Vezo form is in the dictionary, the Merina form is in common use.",
    source: "Dictionnaire vezo-francais, forme merina d'usage courant",
    source_url: "https://motmalgache.org/bins/ohabolana/maro",
    confidence: "widely-cited",
  },

  // ── Fitondran-tena ──────────────────────────────────────────────────────
  {
    theme: "fitondrantena",
    mg: "Fanahy no olona.",
    fr: "L'ame, c'est l'homme.",
    en: "The spirit is what makes a person.",
    meaning_mg: "Tsy ny laharana na ny fananana no mampiavaka olona fa ny toetrany.",
    meaning_fr: "Ce qui fait la valeur d'une personne n'est ni son rang ni ses biens, mais son caractere. Forme d'origine de l'actuel Ny fanahy no maha-olona.",
    meaning_en: "A person's worth is neither rank nor property but character. The original form of today's Ny fanahy no maha-olona.",
    source: "Cousins et Parrett 898, Nicol 320",
    source_url: "https://motmalgache.org/bins/ohabolana/fanahy",
    confidence: "attested",
  },
  {
    theme: "fitondrantena",
    mg: "Ny soa atao levenam-bola.",
    fr: "Le bien que l'on fait est un tresor mis en reserve.",
    en: "The good you do is treasure put by.",
    meaning_mg: "Tsy very mihitsy ny soa natao, miverina amin'ny tena ihany indray andro any.",
    meaning_fr: "La bienfaisance n'est jamais perdue, elle revient un jour a son auteur.",
    meaning_en: "Kindness is never lost, one day it comes back to the one who gave it.",
    source: "de Veyrieres 2969, Nicol 439",
    source_url: "https://motmalgache.org/bins/ohabolana/soa",
    confidence: "attested",
  },
  {
    theme: "fitondrantena",
    mg: "Ny tody tsy misy fa ny atao no miverina.",
    fr: "Il n'existe pas de vengeance, c'est ce que l'on fait qui revient sur soi.",
    en: "There is no revenge, what you do is what comes back.",
    meaning_mg: "Tsy ilaina ny mamaly ratsy, miverina ho azy amin'ny mpanao ny ataony.",
    meaning_fr: "Nul besoin de rendre le mal, les actes retombent d'eux-memes sur celui qui les commet.",
    meaning_en: "No need to return harm, acts fall back on their author by themselves.",
    source: "Nicol 479, Houlder dans sa forme longue",
    source_url: "https://motmalgache.org/bins/ohabolana/tody",
    confidence: "attested",
  },
  {
    theme: "fitondrantena",
    mg: "Manasa lamba be tseroka, ka na madio aza mangarahara.",
    fr: "Laver un tissu tres encrasse, meme redevenu propre il reste use jusqu'a la trame.",
    en: "Washing a filthy cloth, even clean again it stays worn through.",
    meaning_mg: "Misy hadisoana voavaha nefa mbola mamela dian-tsoratra eo amin'ny laza.",
    meaning_fr: "Certaines fautes se reparent mais laissent une marque. La reputation abimee ne redevient jamais tout a fait intacte.",
    meaning_en: "Some faults can be repaired yet leave a mark. A damaged name never returns fully intact.",
    source: "Houlder 144, Rinarasoa 2039, Cousins et Parrett 1571",
    source_url: "https://motmalgache.org/bins/ohabolana/tseroka",
    confidence: "attested",
  },

  // ── Asa ─────────────────────────────────────────────────────────────────
  {
    theme: "asa",
    mg: "Asa vadi-drano, ka tsy vita tsy ifanakonana.",
    fr: "Travail de riziere, il ne s'acheve que par l'entraide.",
    en: "Paddy work is finished only by helping one another.",
    meaning_mg: "Mihoatra ny herin'ny tokana ny asa lehibe, ny fiaraha-miasa no mahavita azy.",
    meaning_fr: "Les grands ouvrages depassent les forces d'un seul, seule la cooperation les mene a terme.",
    meaning_en: "Big works exceed one person's strength, only cooperation carries them through.",
    source: "Houlder",
    source_url: "https://motmalgache.org/bins/ohabolana/ifanakonana",
    confidence: "attested",
  },
  {
    theme: "asa",
    mg: "Ny raharaha ifanakonana mora efa, izay iaraha-manao, vita haingana.",
    fr: "L'affaire que l'on mene ensemble s'acheve aisement, ce que l'on fait a plusieurs se termine vite.",
    en: "Work led together finishes easily, what is done by many is done fast.",
    meaning_mg: "Mampihena ny enta-mavesatra ny fizarana azy, aleo mandamina noho ny miari-tena irery.",
    meaning_fr: "Partager la charge accelere le travail. Organiser l'effort commun vaut mieux que s'acharner seul.",
    meaning_en: "Sharing the load speeds the work. Organising the common effort beats struggling alone.",
    source: "Rinarasoa",
    source_url: "https://motmalgache.org/bins/ohabolana/ifanakonana",
    confidence: "attested",
  },
  {
    theme: "asa",
    mg: "Miadam-pandeha ny fahalainana, ka mora tratry ny fahoriana.",
    fr: "La paresse avance si lentement que la misere la rattrape vite.",
    en: "Idleness walks so slowly that hardship soon overtakes it.",
    meaning_mg: "Ny fanemorana ny ezaka dia fanomezana lalana ny fahantrana.",
    meaning_fr: "Remettre l'effort a plus tard, c'est laisser la pauvrete prendre de l'avance.",
    meaning_en: "Putting the effort off is letting poverty get ahead of you.",
    source: "Nicol 490",
    source_url: "https://motmalgache.org/bins/ohabolana/fahoriana",
    confidence: "attested",
  },

  // ── Fianarana ───────────────────────────────────────────────────────────
  {
    theme: "fianarana",
    mg: "Ny hazo no vanon-ko lakana : ny tany naniriany no tsara.",
    fr: "Si l'arbre est bon a faire une pirogue, c'est que la terre ou il a pousse etait bonne.",
    en: "If the tree makes a good canoe, the soil it grew in was good.",
    meaning_mg: "Avy amin'ny tontolo nanabe azy ny hatsaran'ny olona : fianakaviana, fanabeazana, fampitana.",
    meaning_fr: "La qualite d'une personne vient du milieu qui l'a formee : famille, education, transmission.",
    meaning_en: "A person's quality comes from what raised them: family, upbringing, transmission.",
    source: "Rakibolana malagasy, de Veyrieres 2774 pour la variante",
    source_url: "https://motmalgache.org/bins/ohabolana/ala",
    confidence: "attested",
  },
  {
    theme: "fianarana",
    mg: "Ny anatra, vahiny : tiana, mody mandry ; tsy tiana, mitampody.",
    fr: "Le conseil est un voyageur, si on l'aime il passe la nuit chez vous, si on ne l'aime pas il s'en retourne.",
    en: "Counsel is a traveller, welcomed it stays the night, unwelcomed it turns back.",
    meaning_mg: "Tsy azo terena handray anatra ny olona, mijanona any amin'izay mandray azy ihany izy.",
    meaning_fr: "On ne force personne a recevoir un conseil, il ne reste que chez qui veut bien l'accueillir.",
    meaning_en: "Nobody can be forced to take advice, it stays only where it is welcomed.",
    source: "Houlder",
    source_url: "https://motmalgache.org/bins/ohabolana/anatra",
    confidence: "attested",
  },

  // ── Fanambadiana ────────────────────────────────────────────────────────
  {
    theme: "fanambadiana",
    mg: "Ataovy toy ny lamban'akoho ny fanambadiana : faty no isarahana.",
    fr: "Faites du mariage comme du plumage de la poule, on ne s'en separe qu'a la mort.",
    en: "Make marriage like a hen's plumage, only death parts you from it.",
    meaning_mg: "Fanekena tsy tokony horavan'inona na inona afa-tsy ny fahafatesana ny fanambadiana.",
    meaning_fr: "Le mariage est un engagement que rien, hormis la mort, ne doit defaire.",
    meaning_en: "Marriage is a commitment nothing but death should undo.",
    source: "de Veyrieres 1359",
    source_url: "https://motmalgache.org/bins/ohabolana/akoho",
    confidence: "attested",
  },
  {
    theme: "fanambadiana",
    mg: "Vady mifankahita tenda.",
    fr: "Epoux qui se voient jusqu'au fond de la gorge.",
    en: "Spouses who see each other down to the throat.",
    meaning_mg: "Tsy misy afenina eo amin'ny mpivady, ny fangaraharana no fototry ny tokantrano.",
    meaning_fr: "Entre mari et femme rien ne se cache. La transparence totale est la condition du couple.",
    meaning_en: "Between husband and wife nothing is hidden. Full transparency is the condition of the couple.",
    source: "de Veyrieres 1352",
    source_url: "https://motmalgache.org/bins/ohabolana/vady",
    confidence: "attested",
  },
  {
    theme: "fanambadiana",
    mg: "Ny vady no ray aman-dreny.",
    fr: "Le conjoint tient lieu de pere et de mere.",
    en: "Your spouse stands in the place of father and mother.",
    meaning_mg: "Rehefa manambady, ny vady no fiankinana sy fiarovana toy ny ray aman-dreny.",
    meaning_fr: "Une fois marie, c'est aupres de son conjoint que l'on trouve appui et protection, comme aupres des parents.",
    meaning_en: "Once married, support and shelter come from your spouse, as they did from your parents.",
    source: "de Veyrieres 1227",
    source_url: "https://motmalgache.org/bins/ohabolana/vady",
    confidence: "attested",
  },

  // ── Fahoriana ───────────────────────────────────────────────────────────
  {
    theme: "fahoriana",
    mg: "Ny fahoriana no mampahahendry ny olona.",
    fr: "C'est le malheur qui rend l'homme sage.",
    en: "It is hardship that makes a person wise.",
    meaning_mg: "Mampianatra izay tsy ampianarin'ny fiadanana ny fizahan-toetra.",
    meaning_fr: "L'epreuve enseigne ce que le confort n'apprend pas, elle est une ecole.",
    meaning_en: "Trial teaches what comfort never does, it is a school.",
    source: "de Veyrieres 2644",
    source_url: "https://motmalgache.org/bins/ohabolana/fahoriana",
    confidence: "attested",
  },
  {
    theme: "fahoriana",
    mg: "Ny fahoriana mahazaka maniraka.",
    fr: "La misere est un maitre qui commande.",
    en: "Hardship is a master that gives orders.",
    meaning_mg: "Manery hihetsika ny fahantrana, tsy avelany hipetraka fotsiny ny olona.",
    meaning_fr: "Le denuement force a agir et a se mettre en mouvement, il ne laisse pas le choix de l'inaction.",
    meaning_en: "Want forces you to move, it leaves no room for standing still.",
    source: "Houlder 1469",
    source_url: "https://motmalgache.org/bins/ohabolana/fahoriana",
    confidence: "attested",
  },
];

data.items = items.map((o, i) => ({ id: `oh${String(i + 1).padStart(2, "0")}`, ...o }));

await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf8");

const byTheme = {};
for (const o of data.items) byTheme[o.theme] = (byTheme[o.theme] || 0) + 1;
console.log(`${data.items.length} ohabolana ecrits`);
console.log(byTheme);
const missing = Object.keys(data.themes).filter((k) => !byTheme[k]);
console.log("themes sans proverbe propre:", missing.length ? missing.join(", ") : "aucun");
