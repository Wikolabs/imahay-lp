"use client";

import type { Conversation } from "./useConversations";

/* La colonne de gauche : une conversation par ligne, la plus recente en haut.
   Tout vit dans le navigateur de la personne. Sur telephone, elle se replie en
   tiroir derriere le bouton de l'en-tete. */

export type SidebarLabels = {
  newChat: string;
  history: string;
  empty: string;
  del: string;
  close: string;
};

export default function Sidebar({
  list,
  currentId,
  labels,
  links,
  open,
  onNew,
  onOpen,
  onRemove,
  onClose,
}: {
  list: Conversation[];
  currentId: string | null;
  labels: SidebarLabels;
  links: { href: string; label: string }[];
  open: boolean;
  onNew: () => void;
  onOpen: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      {open && <button className="scrim" aria-label={labels.close} onClick={onClose} />}
      <aside className="side" data-open={open ? "true" : "false"}>
        <div className="side-head">
          <button className="btn side-new" onClick={onNew}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {labels.newChat}
          </button>
          <p className="side-title">{labels.history}</p>
        </div>

        {list.length === 0 ? (
          <p className="side-empty">{labels.empty}</p>
        ) : (
          <div className="side-list">
            {list.map((c) => (
              <div key={c.id} className="side-item" aria-current={c.id === currentId ? "true" : undefined}>
                <button
                  onClick={() => onOpen(c.id)}
                  style={{ all: "unset", cursor: "pointer", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {c.title}
                </button>
                <button className="side-del" onClick={() => onRemove(c.id)} aria-label={`${labels.del} : ${c.title}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <nav className="side-foot">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={onClose}>
              {l.label}
            </a>
          ))}
        </nav>
      </aside>
    </>
  );
}
