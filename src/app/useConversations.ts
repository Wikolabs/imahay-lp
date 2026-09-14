"use client";

/* L'historique des conversations, garde dans le navigateur de la personne et
   nulle part ailleurs. Rien ne part sur un serveur, rien n'est rattache a un
   compte, et vider les donnees du site efface tout. C'est ce qui permet la
   colonne de gauche sans demander la moindre inscription. */

import { useCallback, useEffect, useRef, useState } from "react";

export type Turn = {
  role: "you" | "bot";
  text: string;
  theme?: string | null;
  ref?: string | null;
};

export type Conversation = {
  id: string;
  title: string;
  at: number;
  turns: Turn[];
};

const MAX_CONVERSATIONS = 40;

function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function titleFrom(text: string) {
  const one = text.replace(/\s+/g, " ").trim();
  return one.length > 52 ? one.slice(0, 52).trimEnd() + "..." : one;
}

function read(key: string): Conversation[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (c): c is Conversation =>
        !!c && typeof c.id === "string" && Array.isArray(c.turns) && typeof c.at === "number"
    );
  } catch {
    // Navigation privee, stockage bloque, donnees abimees : on repart a vide.
    return [];
  }
}

function write(key: string, list: Conversation[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(list.slice(0, MAX_CONVERSATIONS)));
  } catch {
    // Quota plein ou stockage refuse : la conversation en cours continue
    // de vivre en memoire, seule la reprise plus tard est perdue.
  }
}

export function useConversations(storageKey: string) {
  const [list, setList] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const keyRef = useRef(storageKey);

  useEffect(() => {
    const stored = read(keyRef.current);
    setList(stored);
    setReady(true);
  }, []);

  const persist = useCallback((next: Conversation[]) => {
    setList(next);
    write(keyRef.current, next);
  }, []);

  const current = currentId ? list.find((c) => c.id === currentId) ?? null : null;
  const turns = current?.turns ?? [];

  /* L'identifiant courant est aussi garde dans une reference. Sans cela, la
     reponse du modele, qui arrive apres un await, travaillait encore avec la
     valeur capturee avant l'envoi : elle ouvrait une seconde conversation au
     lieu de se poser dans la premiere. */
  const currentIdRef = useRef<string | null>(null);
  currentIdRef.current = currentId;

  /** Ajoute un tour. Cree la conversation au premier message de la personne. */
  const append = useCallback(
    (turn: Turn) => {
      setList((prev) => {
        let id = currentIdRef.current;
        let next: Conversation[];

        if (!id || !prev.some((c) => c.id === id)) {
          id = newId();
          const created: Conversation = {
            id,
            title: turn.role === "you" ? titleFrom(turn.text) : "...",
            at: Date.now(),
            turns: [turn],
          };
          next = [created, ...prev];
          currentIdRef.current = id;
          setCurrentId(id);
        } else {
          next = prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  at: Date.now(),
                  title: c.title === "..." && turn.role === "you" ? titleFrom(turn.text) : c.title,
                  turns: [...c.turns, turn],
                }
              : c
          );
        }

        const sorted = [...next].sort((a, b) => b.at - a.at).slice(0, MAX_CONVERSATIONS);
        write(keyRef.current, sorted);
        return sorted;
      });
    },
    []
  );

  const start = useCallback(() => {
    currentIdRef.current = null;
    setCurrentId(null);
  }, []);
  const open = useCallback((id: string) => {
    currentIdRef.current = id;
    setCurrentId(id);
  }, []);

  const remove = useCallback(
    (id: string) => {
      setList((prev) => {
        const next = prev.filter((c) => c.id !== id);
        write(keyRef.current, next);
        return next;
      });
      setCurrentId((prev) => {
        if (prev === id) currentIdRef.current = null;
        return prev === id ? null : prev;
      });
    },
    []
  );

  return { ready, list, current, currentId, turns, append, start, open, remove };
}
