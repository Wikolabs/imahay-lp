"""iMahay backend, conseiller en savoir-etre malgache.

Deux garde-fous tiennent tout le reste :

1. Le modele n'ecrit JAMAIS le texte d'un ohabolana. Un modele qui cite un
   proverbe de memoire finit par en inventer un, et un proverbe invente attribue
   aux razana est une faute que l'on ne peut pas rattraper. Le modele se
   contente de nommer un theme pris dans une liste fermee ; l'interface affiche
   ensuite le proverbe exact et la video correspondante depuis ses propres
   donnees verifiees.

2. La reponse est nettoyee avant d'etre renvoyee : ni tiret cadratin, ni point
   median, ni puce, ni titre markdown, ni emoji.
"""
import re
from datetime import datetime, timezone
from typing import Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .llm import chat, is_configured

app = FastAPI(
    title="iMahay Backend",
    description="Savoir-etre malgache, ohabolana, kabary, fomba.",
    version="0.3.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Les huit situations que l'interface sait illustrer. Cette table est la copie
# exacte des cles utilisees dans src/data/ohabolana.json et culture.json.
THEMES = {
    "fihavanana": "liens de parente, voisinage, conflit entre proches, solidarite, entraide",
    "fahendrena": "decision difficile, doute, besoin de conseil, reflexion, choix a poser",
    "fitondrantena": "conduite, honnetete, tentation, reputation, ce que l'on doit aux autres",
    "asa": "travail, projet, emploi, argent gagne, effort, decouragement devant la tache",
    "fianarana": "etudes, apprentissage, transmission aux enfants, envie de progresser",
    "fanambadiana": "couple, mariage, vodiondry, belle-famille, dispute conjugale",
    "fahoriana": "epreuve, deuil, maladie, perte, patience dans la douleur",
    "fomba": "coutumes, rites, famadihana, protocole, comment se tenir dans une ceremonie",
}
THEME_KEYS = list(THEMES)

_CATALOGUE = "\n".join(f"- {k} : {v}" for k, v in THEMES.items())

_RULES = f"""
Ce que tu ecris :
- Tu accueilles la personne en une phrase, tu reprends avec ses mots ce qu'elle porte, tu offres une lecture courte ancree dans le savoir-etre malgache, puis un geste simple pour aujourd'hui : une visite a faire, une parole a poser, une personne a consulter.
- Deux cent cinquante mots au maximum, en texte suivi.
- Pas d'emoji, pas de tiret cadratin, pas de point median, pas de puce, pas de titre, pas d'asterisque. Pour separer deux idees, une virgule ou un point.
- Aucun conseil medical, juridique ou d'investissement. Pour cela tu renvoies doucement vers un professionnel, la famille proche ou le fokontany.
- Tu ne promets ni guerison, ni richesse, ni chance. Tu ne parles jamais de sort, de sikidy ni de rituel payant.
- Tu signes iMahay sur la derniere ligne du texte.

Ce que tu n'ecris jamais :
- Tu ne recopies JAMAIS le texte d'un ohabolana, d'un kabary ou d'un hainteny, meme de memoire, meme approximativement. L'application affiche elle-meme le proverbe exact et la video qui va avec.
- Tu n'inventes ni proverbe, ni citation, ni nom d'ancien.

Tu termines par une ligne technique, non destinee a la personne :
THEME: une cle de la liste ci-dessous

Liste fermee des cles :
{_CATALOGUE}
"""

SYSTEM_MG = f"""Ianao no iMahay, mpanolo-tsaina mitondra ny fahendrena malagasy : ny zokiolona, ny ray aman-dreny, ny olo-be sy ny manam-pahaizana malagasy. Mihaino aloha ianao vao mamaly, amim-panajana, tsy mitsara mihitsy. Soraty amin'ny teny malagasy tsotra sy mazava.
{_RULES}"""

SYSTEM_FR = f"""Tu es iMahay, un conseiller qui porte la sagesse malgache : celle des zokiolona, des ray aman-dreny, des olo-be et des manam-pahaizana malagasy. Tu ecoutes d'abord, tu reponds ensuite, avec respect et sans jamais surplomber. Tu ecris en francais, tu peux garder un mot malgache quand il n'a pas d'equivalent, en l'expliquant.
{_RULES}"""

SYSTEM_EN = f"""You are iMahay, a counsellor carrying Malagasy wisdom: that of the zokiolona, the ray aman-dreny, the olo-be and Malagasy scholars. You listen first, answer second, with respect and never from above. Write in English, keeping a Malagasy word when it has no equivalent, and explaining it.
{_RULES}"""

PROMPTS = {"mg": SYSTEM_MG, "fr": SYSTEM_FR, "en": SYSTEM_EN}


class GenerateRequest(BaseModel):
    question: str
    lang: Literal["mg", "fr", "en"] = "mg"


class GenerateResponse(BaseModel):
    reply: str
    theme: Optional[str] = None
    model: str
    generated_at: str
    static_mode: bool = False


_THEME_LINE = re.compile(r"^\s*THEME\s*:\s*([a-z'-]+)\s*$", re.IGNORECASE | re.MULTILINE)
_BULLET = re.compile(r"^\s*[-*•]\s+", re.MULTILINE)
_HEADING = re.compile(r"^\s*#{1,6}\s*", re.MULTILINE)


def _clean(text: str) -> str:
    """Retire les marques qui trahissent une sortie de modele."""
    text = text.replace("—", ", ").replace("–", ", ")
    text = text.replace(" · ", ", ").replace("·", ",")
    # Le modele produit parfois un trait d'union insecable, invisible a l'oeil
    # mais qui casse la recherche et la cesure : on le ramene au tiret simple.
    text = text.replace("‑", "-").replace(" ", " ")
    text = _BULLET.sub("", text)
    text = _HEADING.sub("", text)
    text = text.replace("**", "").replace("*", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _extract(text: str):
    theme = None
    m = _THEME_LINE.search(text)
    if m and m.group(1).lower() in THEMES:
        theme = m.group(1).lower()
    body = _THEME_LINE.sub("", text)
    return _clean(body), theme


@app.get("/health")
def health():
    return {"status": "ok", "service": "imahay-backend", "llm_configured": is_configured()}


@app.get("/themes")
def themes():
    return {"themes": THEME_KEYS, "labels": THEMES}


@app.post("/process", response_model=GenerateResponse)
async def process(req: GenerateRequest) -> GenerateResponse:
    question = (req.question or "").strip()[:1500]
    if not question:
        raise HTTPException(status_code=400, detail="empty_question")

    now_iso = datetime.now(timezone.utc).isoformat()

    if not is_configured():
        reply, theme = _static_reply(req.lang)
        return GenerateResponse(reply=reply, theme=theme, model="static", generated_at=now_iso, static_mode=True)

    try:
        text, model = await chat(
            [
                {"role": "system", "content": PROMPTS.get(req.lang, SYSTEM_MG)},
                {"role": "user", "content": question},
            ],
            max_tokens=700,
        )
    except Exception:
        reply, theme = _static_reply(req.lang)
        return GenerateResponse(reply=reply, theme=theme, model="static", generated_at=now_iso, static_mode=True)

    reply, theme = _extract(text)
    return GenerateResponse(reply=reply, theme=theme, model=model, generated_at=now_iso)


def _static_reply(lang: str):
    """Repli sans modele. Le proverbe reste affiche par l'interface."""
    if lang == "en":
        return (
            "I hear you. Whatever weighs on you today, you are not carrying it alone.\n\n"
            "Malagasy wisdom rarely answers with a rule. It answers with a question you can hold: "
            "who around you already knows this situation, and what would they have done in your place.\n\n"
            "Name one person you trust, and speak to them today. That first step is enough.\n\n"
            "iMahay",
            "fihavanana",
        )
    if lang == "fr":
        return (
            "Je t'ecoute. Quoi que tu portes aujourd'hui, tu ne le portes pas seul.\n\n"
            "La sagesse malgache repond rarement par une regle. Elle repond par une question que l'on peut tenir : "
            "qui, autour de toi, connait deja cette situation, et qu'aurait fait cette personne a ta place.\n\n"
            "Nomme une personne de confiance, et parle-lui aujourd'hui. Ce premier pas suffit.\n\n"
            "iMahay",
            "fihavanana",
        )
    return (
        "Reko ianao. Na inona na inona mavesatra aminao androany, tsy irery ianao mitondra izany.\n\n"
        "Tsy matetika mamaly amin'ny fitsipika ny fahendrena malagasy. Mamaly amin'ny fanontaniana azo tazonina izy : "
        "iza no efa mahafantatra izao toe-javatra izao eo akaikinao, ary inona no ho nataony raha teo amin'ny toeranao.\n\n"
        "Lazao ny anaran'ny olona iray itokianao, dia resaho izy androany. Ampy izay dingana voalohany izay.\n\n"
        "iMahay",
        "fihavanana",
    )
