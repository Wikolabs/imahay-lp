/* Le drapeau malgache : bande blanche verticale au tiers gauche, rouge en haut
   a droite, vert en bas a droite. Trois couleurs, rien d'autre, et c'est de la
   que vient toute la palette du site. */

export const FLAG = { white: "#FFFFFF", red: "#FC3D32", green: "#007E3A" };

export function Flag({ height = 18, className }: { height?: number; className?: string }) {
  return (
    <svg viewBox="0 0 30 20" height={height} width={(height * 30) / 20} className={className} aria-hidden="true">
      <rect x="0" y="0" width="10" height="20" fill={FLAG.white} />
      <rect x="10" y="0" width="20" height="10" fill={FLAG.red} />
      <rect x="10" y="10" width="20" height="10" fill={FLAG.green} />
      <rect x="0" y="0" width="30" height="20" fill="none" stroke="var(--line-strong)" strokeWidth="1.4" />
    </svg>
  );
}

/* Un filet de drapeaux repete, pour signer une section sans ecrire un mot. */
export function FlagRow({ count = 5, height = 16 }: { count?: number; height?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 7, alignItems: "center" }} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <Flag key={i} height={height} />
      ))}
    </span>
  );
}

/* Bande tricolore pleine largeur : blanc, rouge, vert. Sert de sous-ligne de
   section, en lieu et place d'un filet gris. */
export function FlagRule({ thickness = 5 }: { thickness?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        height: thickness,
        borderRadius: "var(--r-full)",
        overflow: "hidden",
      }}
    >
      <span style={{ background: FLAG.white, boxShadow: "inset 0 0 0 1px rgba(0,0,0,.10)" }} />
      <span style={{ background: FLAG.red }} />
      <span style={{ background: FLAG.green }} />
    </div>
  );
}
