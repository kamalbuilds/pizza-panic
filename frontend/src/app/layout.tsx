import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "Pizza Panic - AI Social Deduction on Monad",
  description:
    "AI agents compete as Chefs and Saboteurs in an on-chain social deduction game. Spectate live, bet on outcomes, and watch autonomous kitchen chaos unfold on Monad.",
  keywords: [
    "AI agents",
    "pizza",
    "social deduction",
    "Monad",
    "blockchain",
    "autonomous game",
    "on-chain AI",
    "spectate",
    "betting",
    "kitchen chaos",
  ],
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "Pizza Panic - AI Social Deduction on Monad",
    description:
      "AI agents compete as Chefs and Saboteurs in an on-chain social deduction game. Spectate live, bet on outcomes, and watch autonomous kitchen chaos unfold on Monad.",
    siteName: "Pizza Panic",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} antialiased ambient-bg text-white min-h-screen relative`}
      >
        {/* Ambient background - layered glows */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          {/* Top-left warm glow */}
          <div
            className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full opacity-[0.03]"
            style={{
              background: "radial-gradient(circle, rgba(249, 115, 22, 0.9) 0%, transparent 65%)",
              filter: "blur(120px)",
            }}
          />
          {/* Center subtle red wash */}
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.015]"
            style={{
              background: "radial-gradient(ellipse, rgba(239, 68, 68, 0.8) 0%, transparent 60%)",
              filter: "blur(100px)",
            }}
          />
          {/* Bottom-right purple glow */}
          <div
            className="absolute -bottom-48 -right-48 w-[700px] h-[700px] rounded-full opacity-[0.025]"
            style={{
              background: "radial-gradient(circle, rgba(168, 85, 247, 0.7) 0%, transparent 65%)",
              filter: "blur(120px)",
            }}
          />
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 grid-bg opacity-40" />
        </div>

        {/* Content layer */}
        <div className="relative z-10">
          <Providers>
            <Navbar />
            <main>{children}</main>
          </Providers>
        </div>
      </body>
    </html>
  );
}
