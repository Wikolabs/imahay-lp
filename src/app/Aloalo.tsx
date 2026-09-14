/* Aloalo : le poteau sculpte que l'on dresse chez les Mahafaly et les Antandroy.
   Il n'est jamais lisse. On y empile des modules tailles dans le meme tronc :
   une tete de zebu aux cornes, un losange, un disque, un carre, des chevrons,
   un fut entaille. Chaque variante d'ici recompose cette grammaire dans un
   ordre different, en bois de tons varies, pour que deux poteaux ne se
   ressemblent jamais tout a fait. Dessine, jamais un emoji. */

export const WOODS = ["#78350F", "#92400E", "#A16207", "#B45309", "#8B5A2B", "#6B3410"];

type Mod = "zebu" | "losange" | "cercle" | "carre" | "chevrons" | "anneaux" | "croix" | "corne";

/* Chaque variante est une pile lue de haut en bas. La derniere piece est
   toujours le fut, ajoute par le composant. */
const VARIANTS: Mod[][] = [
  ["zebu", "losange", "cercle", "carre"],
  ["corne", "carre", "losange", "anneaux"],
  ["zebu", "anneaux", "chevrons", "losange"],
  ["losange", "cercle", "croix", "carre"],
  ["zebu", "carre", "chevrons", "cercle"],
  ["corne", "losange", "anneaux", "croix"],
];

const H: Record<Mod, number> = {
  zebu: 42,
  corne: 34,
  losange: 30,
  cercle: 28,
  carre: 26,
  chevrons: 24,
  anneaux: 26,
  croix: 24,
};

function Module({ mod, y, fill, line }: { mod: Mod; y: number; fill: string; line: string }) {
  const cx = 50;
  switch (mod) {
    case "zebu":
      return (
        <g>
          <path d={`M${cx - 9} ${y + 26} C ${cx - 30} ${y + 24}, ${cx - 38} ${y + 10}, ${cx - 28} ${y + 2}`} stroke={line} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d={`M${cx + 9} ${y + 26} C ${cx + 30} ${y + 24}, ${cx + 38} ${y + 10}, ${cx + 28} ${y + 2}`} stroke={line} strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx={cx} cy={y + 26} r="13" fill={fill} stroke={line} strokeWidth="2.5" />
          <circle cx={cx - 5} cy={y + 23} r="2.2" fill={line} />
          <circle cx={cx + 5} cy={y + 23} r="2.2" fill={line} />
          <path d={`M${cx - 4} ${y + 33} h8`} stroke={line} strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "corne":
      return (
        <g>
          <path d={`M${cx - 26} ${y + 28} C ${cx - 22} ${y + 4}, ${cx - 6} ${y + 2}, ${cx} ${y + 14} C ${cx + 6} ${y + 2}, ${cx + 22} ${y + 4}, ${cx + 26} ${y + 28}`} stroke={line} strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx={cx} cy={y + 22} r="6" fill={fill} stroke={line} strokeWidth="2.5" />
        </g>
      );
    case "losange":
      return (
        <g>
          <path d={`M${cx} ${y + 1} L ${cx + 20} ${y + 15} L ${cx} ${y + 29} L ${cx - 20} ${y + 15} Z`} fill={fill} stroke={line} strokeWidth="2.5" strokeLinejoin="round" />
          <path d={`M${cx} ${y + 8} L ${cx + 10} ${y + 15} L ${cx} ${y + 22} L ${cx - 10} ${y + 15} Z`} fill="none" stroke={line} strokeWidth="1.8" />
        </g>
      );
    case "cercle":
      return (
        <g>
          <circle cx={cx} cy={y + 14} r="13" fill={fill} stroke={line} strokeWidth="2.5" />
          <circle cx={cx} cy={y + 14} r="6" fill="none" stroke={line} strokeWidth="1.8" />
        </g>
      );
    case "anneaux":
      return (
        <g>
          <circle cx={cx} cy={y + 13} r="12.5" fill={fill} stroke={line} strokeWidth="2.5" />
          <path d={`M${cx - 12.5} ${y + 13} h25 M${cx} ${y + 0.5} v25`} stroke={line} strokeWidth="1.8" />
        </g>
      );
    case "carre":
      return (
        <g>
          <rect x={cx - 15} y={y + 2} width="30" height="22" fill={fill} stroke={line} strokeWidth="2.5" />
          <rect x={cx - 7} y={y + 8} width="14" height="10" fill="none" stroke={line} strokeWidth="1.8" />
        </g>
      );
    case "chevrons":
      return (
        <g fill="none" stroke={line} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <rect x={cx - 16} y={y + 2} width="32" height="20" fill={fill} strokeWidth="2.5" />
          <path d={`M${cx - 10} ${y + 18} L ${cx} ${y + 7} L ${cx + 10} ${y + 18}`} strokeWidth="2.4" />
        </g>
      );
    case "croix":
      return (
        <g>
          <rect x={cx - 14} y={y + 2} width="28" height="20" fill={fill} stroke={line} strokeWidth="2.5" />
          <path d={`M${cx - 14} ${y + 2} L ${cx + 14} ${y + 22} M${cx + 14} ${y + 2} L ${cx - 14} ${y + 22}`} stroke={line} strokeWidth="1.8" />
        </g>
      );
  }
}

export default function Aloalo({
  variant = 0,
  height = 220,
  shaft = 64,
  className,
  title,
}: {
  variant?: number;
  height?: number;
  shaft?: number;
  className?: string;
  title?: string;
}) {
  const mods = VARIANTS[variant % VARIANTS.length];
  const stackH = mods.reduce((sum, m) => sum + H[m], 0);
  const totalH = stackH + shaft + 14;

  let y = 0;
  const pieces = mods.map((m, i) => {
    const at = y;
    y += H[m];
    const fill = WOODS[(variant + i) % WOODS.length];
    const line = WOODS[(variant + i + 3) % WOODS.length];
    return <Module key={`${m}-${i}`} mod={m} y={at} fill={fill} line={line} />;
  });

  const shaftFill = WOODS[(variant + 2) % WOODS.length];
  const shaftLine = WOODS[(variant + 5) % WOODS.length];

  return (
    <svg
      viewBox={`0 0 100 ${totalH}`}
      width={(height * 100) / totalH}
      height={height}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {pieces}
      <rect x="42" y={stackH} width="16" height={shaft} fill={shaftFill} stroke={shaftLine} strokeWidth="2.5" />
      {Array.from({ length: Math.max(1, Math.floor(shaft / 18)) }).map((_, i) => (
        <g key={i}>
          <path d={`M42 ${stackH + 12 + i * 18} l -6 4 l 6 4 Z`} fill={shaftLine} />
          <path d={`M58 ${stackH + 12 + i * 18} l 6 4 l -6 4 Z`} fill={shaftLine} />
        </g>
      ))}
      <rect x="30" y={stackH + shaft} width="40" height="9" fill={shaftLine} />
    </svg>
  );
}
