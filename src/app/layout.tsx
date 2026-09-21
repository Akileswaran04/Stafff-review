import type { Metadata } from "next";
import { Anton, Archivo, JetBrains_Mono, Mrs_Saint_Delafield } from "next/font/google";
import "./globals.css";

const display = Anton({ subsets: ["latin"], weight: "400", variable: "--font-display", display: "swap" });
const sans = Archivo({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const script = Mrs_Saint_Delafield({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "DIST Staff Review Portal",
  description: "A private place for Department of Information Science & Technology staff to read student reviews.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${script.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
