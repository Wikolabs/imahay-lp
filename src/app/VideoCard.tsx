"use client";

import { useState } from "react";

/* Une vignette YouTube brute est rarement lisible : cadrage au hasard, texte
   incruste, luminosite variable. On la cache donc derriere deux pans de couleur
   qui portent le titre et la chaine. Les pans s'ecartent au survol et au
   clavier, et la video ne se charge qu'au clic, sur youtube-nocookie. */

export type Video = {
  id: string;
  title: string;
  channel: string;
  why?: string;
};

export default function VideoCard({
  v,
  play,
  showMeta = true,
}: {
  v: Video;
  play: string;
  showMeta?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <article className="video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`}
          title={v.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
        {showMeta && (
          <div className="video-meta">
            <b>{v.title}</b>
            <span>{v.channel}</span>
            {v.why && <p>{v.why}</p>}
          </div>
        )}
      </article>
    );
  }

  return (
    <article className="video">
      <button className="video-thumb" onClick={() => setOpen(true)} aria-label={`${play} : ${v.title}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" />
        <span className="curtain" aria-hidden="true">
          <i />
          <i />
        </span>
        <span className="curtain-txt" aria-hidden="true">
          <b>{v.title}</b>
          <em>{v.channel}</em>
        </span>
        <span className="curtain-play" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.2v13.6a.7.7 0 0 0 1.07.6l10.5-6.8a.7.7 0 0 0 0-1.2L9.07 4.6A.7.7 0 0 0 8 5.2Z" />
          </svg>
        </span>
      </button>
      {showMeta && v.why && (
        <div className="video-meta">
          <p style={{ marginTop: 0 }}>{v.why}</p>
        </div>
      )}
    </article>
  );
}
