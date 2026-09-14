// Retablit les accents francais dans src/data/ohabolana.json. Le contenu avait
// ete saisi sans accents, ce qui passe mal sur un site lu en francais. Le
// malgache n'est pas touche, seuls les champs francais le sont.

import { readFile, writeFile } from "node:fs/promises";

const path = "src/data/ohabolana.json";
const data = JSON.parse(await readFile(path, "utf8"));

data.note =
  "Liste fermée. iMahay ne peut citer que ces proverbes et n'en écrit jamais de nouveau. Chaque entrée porte le recueil imprimé d'où elle vient, vérifiée via le Rakibolana (motmalgache.org) qui reproduit les numéros d'origine.";

const THEME_FR = {
  fihavanana: { fr: "Parenté et entraide", ask: "Il y a un conflit dans ma famille, comment devrais-je m'y prendre ?" },
  fahendrena: { fr: "Sagesse et décision", ask: "J'ai une décision difficile à prendre, que devrais-je peser ?" },
  fitondrantena: { fr: "Conduite et droiture", ask: "On me pousse à une chose que je crois malhonnête, comment me conduire ?" },
  asa: { fr: "Travail et effort", ask: "Je me décourage dans mon travail, je ne vois plus de résultat." },
  fianarana: { fr: "Apprendre et transmettre", ask: "Je veux transmettre les fomba à mes enfants, comment m'y prendre ?" },
  fanambadiana: { fr: "Couple et mariage", ask: "Je vais faire une demande en mariage, que dois-je préparer ?" },
  fahoriana: { fr: "Épreuve et deuil", ask: "J'ai perdu un proche, le coeur est trop lourd." },
  fomba: { fr: "Coutumes et rites", ask: "Je vais assister à un famadihana, comment dois-je me tenir ?" },
};

const PROMPTS_FR = {
  fihavanana: [
    "Il y a un conflit dans ma famille, comment devrais-je m'y prendre ?",
    "On ne se parle plus depuis le partage de l'héritage.",
    "Un voisin me demande de l'aide sans arrêt, je n'ose pas refuser.",
  ],
  fahendrena: [
    "J'ai une décision difficile à prendre, que devrais-je peser ?",
    "Deux choix s'offrent à moi, chacun a son bon et son mauvais côté.",
    "Je reçois trop de conseils contradictoires et je ne sais plus.",
  ],
  fitondrantena: [
    "On me pousse à une chose que je crois malhonnête, comment me conduire ?",
    "Quelqu'un m'a demandé de fermer les yeux, je ne sais pas quoi répondre.",
    "Ma réputation a été abîmée par des paroles, comment la relever ?",
  ],
  asa: [
    "Je me décourage dans mon travail, je ne vois plus de résultat.",
    "Je cherche un emploi depuis longtemps et personne ne répond.",
    "Je travaille trop, il ne reste plus de temps pour ma famille.",
  ],
  fianarana: [
    "Je veux transmettre les fomba à mes enfants, comment m'y prendre ?",
    "Mon aîné ne veut plus m'écouter.",
    "Je veux apprendre le kabary, par où commencer ?",
  ],
  fanambadiana: [
    "Je vais faire une demande en mariage, que dois-je préparer ?",
    "Avec mon conjoint, nous nous disputons souvent à cause de l'argent.",
    "Ma belle-famille ne m'accepte pas, c'est lourd à porter.",
  ],
  fahoriana: [
    "J'ai perdu un proche, le coeur est trop lourd.",
    "Je suis malade depuis longtemps et mon espérance s'use.",
    "La personne en qui j'avais confiance m'a laissé tomber.",
  ],
  fomba: [
    "Je vais assister à un famadihana, comment dois-je me tenir ?",
    "Je ne sais pas quoi dire en arrivant dans une maison en deuil.",
    "Quelles règles suivre quand un décès frappe le quartier ?",
  ],
};

for (const [key, theme] of Object.entries(data.themes)) {
  theme.fr = THEME_FR[key].fr;
  theme.ask_fr = THEME_FR[key].ask;
  theme.prompts_fr = PROMPTS_FR[key];
}

data.sources = [
  { label: "Houlder, Ohabolana ou proverbes malgaches", url: "https://motmalgache.org/bins/ohabolana/ifanakonana", note: "Recueil de référence, indexé mot par mot" },
  { label: "Cousins et Parrett, Ny ohabolan'ny Ntaolo", url: "https://motmalgache.org/bins/ohabolana/fanahy", note: "Collection ancienne des proverbes des anciens" },
  { label: "de Veyrières, Le livre de la sagesse malgache", url: "https://motmalgache.org/bins/ohabolana/hitsikitsika", note: "Proverbes numérotés, avec traduction française" },
  { label: "Nicol, Proverbes et locutions malgaches", url: "https://motmalgache.org/bins/ohabolana/tody", note: "Édition de 1935" },
  { label: "Rinarasoa, Ohabolana malagasy", url: "https://motmalgache.org/bins/ohabolana/tseroka", note: "Édition de 1974" },
  { label: "Rakibolana malagasy, Rajemisa-Raolison", url: "https://motmalgache.org/bins/ohabolana/ala", note: "Dictionnaire encyclopédique malgache" },
];

const FR = {
  oh01: {
    fr: "Un seul doigt n'attrape pas un pou.",
    meaning: "Seul, on ne vient pas à bout d'une tâche. C'est l'image la plus classique de l'entraide malgache.",
    source: "Houlder 238, Cousins et Parrett 3124",
  },
  oh02: {
    fr: "Un seul arbre ne fait pas la forêt.",
    meaning: "Un individu isolé ne pèse rien. C'est le groupe qui fait la force et la durée.",
    source: "Houlder 237, Cousins et Parrett 2260",
  },
  oh03: {
    fr: "Mieux vaut perdre les petits profits de l'argent que les petites attentions qui entretiennent la parenté.",
    meaning: "Quand l'argent et le lien humain s'opposent, on sacrifie l'argent.",
    source: "de Veyrières 4103",
  },
  oh04: {
    fr: "La crécerelle ne s'agite pas en vain, c'est qu'il y a quelque chose.",
    meaning: "Personne ne se démène sans raison. Lis l'intention avant de juger.",
    source: "de Veyrières 637",
  },
  oh05: {
    fr: "Les paroles sont comme des oeufs, une fois écloses elles ont des ailes.",
    meaning: "Une parole lâchée ne se rattrape plus, elle vole partout. Il faut la peser avant.",
    source: "de Veyrières 4794",
  },
  oh06: {
    fr: "C'est l'avis du grand nombre qui fait le royaume.",
    meaning: "Une décision ne tient que si elle a été délibérée collectivement.",
    source: "de Veyrières 301",
  },
  oh07: {
    fr: "L'avis du grand nombre porte loin.",
    meaning: "La réflexion collective voit plus loin que celle d'un seul. La forme vezo est au dictionnaire, la forme merina est d'usage courant.",
    source: "Dictionnaire vezo-français, forme merina d'usage courant",
  },
  oh08: {
    fr: "L'âme, c'est l'homme.",
    meaning: "Ce qui fait la valeur d'une personne n'est ni son rang ni ses biens, mais son caractère. Forme d'origine de l'actuel Ny fanahy no maha-olona.",
    source: "Cousins et Parrett 898, Nicol 320",
  },
  oh09: {
    fr: "Le bien que l'on fait est un trésor mis en réserve.",
    meaning: "La bienfaisance n'est jamais perdue, elle revient un jour à son auteur.",
    source: "de Veyrières 2969, Nicol 439",
  },
  oh10: {
    fr: "Il n'existe pas de vengeance, c'est ce que l'on fait qui revient sur soi.",
    meaning: "Nul besoin de rendre le mal, les actes retombent d'eux-mêmes sur celui qui les commet.",
    source: "Nicol 479, Houlder dans sa forme longue",
  },
  oh11: {
    fr: "Laver un tissu très encrassé, même redevenu propre il reste usé jusqu'à la trame.",
    meaning: "Certaines fautes se réparent mais laissent une marque. La réputation abîmée ne redevient jamais tout à fait intacte.",
    source: "Houlder 144, Rinarasoa 2039, Cousins et Parrett 1571",
  },
  oh12: {
    fr: "Travail de rizière, il ne s'achève que par l'entraide.",
    meaning: "Les grands ouvrages dépassent les forces d'un seul, seule la coopération les mène à terme.",
    source: "Houlder",
  },
  oh13: {
    fr: "L'affaire que l'on mène ensemble s'achève aisément, ce que l'on fait à plusieurs se termine vite.",
    meaning: "Partager la charge accélère le travail. Organiser l'effort commun vaut mieux que s'acharner seul.",
    source: "Rinarasoa",
  },
  oh14: {
    fr: "La paresse avance si lentement que la misère la rattrape vite.",
    meaning: "Remettre l'effort à plus tard, c'est laisser la pauvreté prendre de l'avance.",
    source: "Nicol 490",
  },
  oh15: {
    fr: "Si l'arbre est bon à faire une pirogue, c'est que la terre où il a poussé était bonne.",
    meaning: "La qualité d'une personne vient du milieu qui l'a formée : famille, éducation, transmission.",
    source: "Rakibolana malagasy, de Veyrières 2774 pour la variante",
  },
  oh16: {
    fr: "Le conseil est un voyageur, si on l'aime il passe la nuit chez vous, si on ne l'aime pas il s'en retourne.",
    meaning: "On ne force personne à recevoir un conseil, il ne reste que chez qui veut bien l'accueillir.",
    source: "Houlder",
  },
  oh17: {
    fr: "Faites du mariage comme du plumage de la poule, on ne s'en sépare qu'à la mort.",
    meaning: "Le mariage est un engagement que rien, hormis la mort, ne doit défaire.",
    source: "de Veyrières 1359",
  },
  oh18: {
    fr: "Époux qui se voient jusqu'au fond de la gorge.",
    meaning: "Entre mari et femme rien ne se cache. La transparence totale est la condition du couple.",
    source: "de Veyrières 1352",
  },
  oh19: {
    fr: "Le conjoint tient lieu de père et de mère.",
    meaning: "Une fois marié, c'est auprès de son conjoint que l'on trouve appui et protection, comme auprès des parents.",
    source: "de Veyrières 1227",
  },
  oh20: {
    fr: "C'est le malheur qui rend l'homme sage.",
    meaning: "L'épreuve enseigne ce que le confort n'apprend pas, elle est une école.",
    source: "de Veyrières 2644",
  },
  oh21: {
    fr: "La misère est un maître qui commande.",
    meaning: "Le dénuement force à agir et à se mettre en mouvement, il ne laisse pas le choix de l'inaction.",
    source: "Houlder 1469",
  },
};

const missing = [];
for (const item of data.items) {
  const fr = FR[item.id];
  if (!fr) {
    missing.push(item.id);
    continue;
  }
  item.fr = fr.fr;
  item.meaning_fr = fr.meaning;
  item.source = fr.source;
}

await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`${data.items.length} proverbes relus, ${missing.length ? "manquants : " + missing.join(", ") : "aucun manquant"}`);
