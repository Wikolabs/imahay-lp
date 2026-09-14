// Ajoute a chaque situation trois phrases toutes faites, dans les trois
// langues. Elles s'affichent dans la fenetre de conversation : on clique, la
// question part. Personne n'a a trouver ses mots pour commencer.

import { readFile, writeFile } from "node:fs/promises";

const path = "src/data/ohabolana.json";
const data = JSON.parse(await readFile(path, "utf8"));

const PROMPTS = {
  fihavanana: {
    mg: [
      "Misy fifanolanana amin'ny havako, ahoana no tokony hataoko ?",
      "Tsy mifampiresaka intsony izahay mianakavy hatramin'ny nisaraka ny fananana.",
      "Angatahin'ny mpiara-monina foana aho hanampy, tsy sahy mandà.",
    ],
    fr: [
      "Il y a un conflit dans ma famille, comment devrais-je m'y prendre ?",
      "On ne se parle plus depuis le partage de l'heritage.",
      "Un voisin me demande de l'aide sans arret, je n'ose pas refuser.",
    ],
    en: [
      "There is a conflict in my family, how should I handle it?",
      "We stopped speaking after the inheritance was divided.",
      "A neighbour keeps asking me for help and I dare not refuse.",
    ],
  },
  fahendrena: {
    mg: [
      "Sarotra amiko ny manapa-kevitra, inona no tokony hodinihiko ?",
      "Misy safidy roa eo anoloako, samy manana ny tsara sy ny ratsy.",
      "Marobe ny torohevitra azoko, ka very hevitra aho.",
    ],
    fr: [
      "J'ai une decision difficile a prendre, que devrais-je peser ?",
      "Deux choix s'offrent a moi, chacun a son bon et son mauvais cote.",
      "Je recois trop de conseils contradictoires et je ne sais plus.",
    ],
    en: [
      "I have a hard decision to make, what should I weigh?",
      "Two options are in front of me, each with its good and bad side.",
      "I am getting too much conflicting advice and I am lost.",
    ],
  },
  fitondrantena: {
    mg: [
      "Misy fanararaotana eo amin'ny asako, ahoana no fitondran-tena mety ?",
      "Nisy nangataka ahy hanao zavatra tsy mahitsy, tsy hitako izay hovaliana.",
      "Simba ny lazako noho ny fitenenana, ahoana no hanarenana azy ?",
    ],
    fr: [
      "On me pousse a une chose que je crois malhonnete, comment me conduire ?",
      "Quelqu'un m'a demande de fermer les yeux, je ne sais pas quoi repondre.",
      "Ma reputation a ete abimee par des paroles, comment la relever ?",
    ],
    en: [
      "I am being pushed into something dishonest, how should I act?",
      "Someone asked me to look away and I do not know what to answer.",
      "Talk has damaged my name, how do I set it right?",
    ],
  },
  asa: {
    mg: [
      "Kivy aho amin'ny asako, tsy mahita vokatra intsony.",
      "Efa ela aho no mitady asa, tsy misy mamaly ny fangatahako.",
      "Be loatra ny asa ataoko, tsy misy fotoana ho an'ny fianakaviana.",
    ],
    fr: [
      "Je me decourage dans mon travail, je ne vois plus de resultat.",
      "Je cherche un emploi depuis longtemps et personne ne repond.",
      "Je travaille trop, il ne reste plus de temps pour ma famille.",
    ],
    en: [
      "I am losing heart at work, I no longer see any result.",
      "I have been job hunting for a long time and nobody answers.",
      "I work too much, there is no time left for my family.",
    ],
  },
  fianarana: {
    mg: [
      "Tiako ho hain'ny zanako ny fomba malagasy, ahoana no ampitako azy ?",
      "Tsy te hihaino ahy intsony ny zanako lahimatoa.",
      "Te hianatra kabary aho, aiza no atombohana ?",
    ],
    fr: [
      "Je veux transmettre les fomba a mes enfants, comment m'y prendre ?",
      "Mon aine ne veut plus m'ecouter.",
      "Je veux apprendre le kabary, par ou commencer ?",
    ],
    en: [
      "I want to pass the fomba on to my children, how do I go about it?",
      "My eldest will not listen to me any more.",
      "I want to learn kabary, where do I start?",
    ],
  },
  fanambadiana: {
    mg: [
      "Hangataka vady aho, inona no tokony homaniko ?",
      "Matetika izahay mivady no mifanditra noho ny vola.",
      "Tsy mankasitraka ahy ny rafozako, mavesatra izany.",
    ],
    fr: [
      "Je vais faire une demande en mariage, que dois-je preparer ?",
      "Avec mon conjoint, nous nous disputons souvent a cause de l'argent.",
      "Ma belle-famille ne m'accepte pas, c'est lourd a porter.",
    ],
    en: [
      "I am going to ask for a hand in marriage, what should I prepare?",
      "My partner and I argue about money again and again.",
      "My in-laws do not accept me and it weighs on me.",
    ],
  },
  fahoriana: {
    mg: [
      "Nodimandry ny havako, mavesatra loatra ny fo.",
      "Marary hatry ny ela aho, reraka ny fanantenako.",
      "Nafoin'ny olona nitokiako aho, tsy hitako izay hitsanganana.",
    ],
    fr: [
      "J'ai perdu un proche, le coeur est trop lourd.",
      "Je suis malade depuis longtemps et mon esperance s'use.",
      "La personne en qui j'avais confiance m'a laisse tomber.",
    ],
    en: [
      "I lost someone close, my heart is too heavy.",
      "I have been ill a long time and my hope is wearing thin.",
      "The person I trusted let me down and I cannot get up.",
    ],
  },
  fomba: {
    mg: [
      "Hanatrika famadihana aho, ahoana no fitondrako tena ?",
      "Tsy fantatro izay lazaina rehefa mitsidika ny ao am-pitaizana.",
      "Inona no fomba tokony harahina rehefa misy fisaonana ao an-tanana ?",
    ],
    fr: [
      "Je vais assister a un famadihana, comment dois-je me tenir ?",
      "Je ne sais pas quoi dire en arrivant dans une maison en deuil.",
      "Quelles regles suivre quand un deces frappe le quartier ?",
    ],
    en: [
      "I am attending a famadihana, how should I conduct myself?",
      "I do not know what to say when I enter a house in mourning.",
      "What customs apply when a death strikes the neighbourhood?",
    ],
  },
};

let n = 0;
for (const [key, byLang] of Object.entries(PROMPTS)) {
  const theme = data.themes[key];
  if (!theme) throw new Error(`situation inconnue dans ohabolana.json : ${key}`);
  theme.prompts_mg = byLang.mg;
  theme.prompts_fr = byLang.fr;
  theme.prompts_en = byLang.en;
  n += byLang.mg.length + byLang.fr.length + byLang.en.length;
}

const missing = Object.keys(data.themes).filter((k) => !PROMPTS[k]);
if (missing.length) throw new Error(`situations sans phrases : ${missing.join(", ")}`);

await writeFile(path, JSON.stringify(data, null, 2) + "\n", "utf8");
console.log(`${n} phrases ecrites sur ${Object.keys(PROMPTS).length} situations`);
