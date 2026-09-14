/* La marque iMahay : le haut d'un aloalo reduit a l'essentiel, cornes de zebu
   et losange, pose dans une tuile aux couleurs du drapeau. Blanc a gauche,
   rouge et vert a droite, comme sur le drapeau lui-meme. Dessine, jamais un
   emoji, et lisible jusqu'a seize pixels. */

export default function Logo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label="iMahay"
    >
      <rect x="0" y="0" width="48" height="48" rx="12" fill="#FFFFFF" />
      <path d="M16 0h20a12 12 0 0 1 12 12v12H16Z" fill="#FC3D32" />
      <path d="M16 24h32v12a12 12 0 0 1-12 12H16Z" fill="#007E3A" />
      <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="11.25" fill="none" stroke="rgba(0,0,0,.16)" strokeWidth="1.5" />

      {/* Cornes de zebu, puis la tete, puis le losange grave */}
      <g stroke="#131916" strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M19 16 C 13 15.4, 11 11, 13.6 8" />
        <path d="M29 16 C 35 15.4, 37 11, 34.4 8" />
      </g>
      <circle cx="24" cy="17.6" r="5" fill="#FFFFFF" stroke="#131916" strokeWidth="2.4" />
      <circle cx="24" cy="17.6" r="1.5" fill="#131916" />
      <path d="M24 25.4 L 30.6 32 L 24 38.6 L 17.4 32 Z" fill="#FFFFFF" stroke="#131916" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M24 29 L 24 35 M21 32 L 27 32" stroke="#131916" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
