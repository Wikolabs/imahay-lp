import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body-var",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const TITLE = "iMahay, la sagesse malgache a portee de question";
const DESCRIPTION =
  "Ohabolana verifies, kabary, fomba. Pose ta question, iMahay repond dans ta langue et t'oriente vers le proverbe exact et la video qui l'explique. Gratuit, anonyme, ouvert jour et nuit.";

export const metadata: Metadata = {
  metadataBase: new URL("https://imahay.com"),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "ohabolana",
    "kabary",
    "fomba malagasy",
    "sagesse malgache",
    "savoir-etre malgache",
    "hira gasy",
    "fihavanana",
    "vodiondry",
    "Madagascar",
  ].join(", "),
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    locale: "mg_MG",
    alternateLocale: ["fr_FR", "en_US"],
    siteName: "iMahay",
    url: "https://imahay.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "iMahay, la sagesse malgache te parle." }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: "Ohabolana verifies, kabary, fomba. Gratuit, anonyme, ouvert jour et nuit.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mg" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
