import type { Metadata } from "next";
import { Sora, Inter, IBM_Plex_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

/* Sora na manchete e na marca, Inter no corpo, Plex Mono em rótulo e dado.
   Mesmo trio da Lattis: é o que dá a assinatura. */
/* Sora e Inter entram como fonte variável (sem `weight`): o corpo usa 450,
   um peso intermediário que só existe no eixo contínuo. */
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});
const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

/* JetBrains Mono só nos NÚMEROS do painel do produto. IBM Plex segue no
   restante do site: chrome é uma coisa, dado de aplicação é outra.
   O 700 entrou pro número grande da seção `the reach`: 500 em corpo de 60px
   fica anêmico, e display precisa de peso pra ter presença sem efeito. */
const jet = JetBrains_Mono({
  variable: "--font-jet",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "spanix · local profiler for AI agents",
  description:
    "See where your agent run went, where it broke, and what every step cost in dollars. Runs on your machine, nothing goes to the cloud.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${mono.variable} ${jet.variable}`}
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
