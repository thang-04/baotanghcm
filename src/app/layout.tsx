import type { Metadata } from "next";
import {
  EB_Garamond,
  Geist,
  Geist_Mono,
  Hanken_Grotesk,
  Manrope,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import { MuseumProvider } from "@/context/MuseumContext";
import { CompetitionProvider } from "@/context/CompetitionContext";
import { CompetitionPlayerHud } from "@/components/ui/CompetitionPlayer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken-grotesk",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bảo Tàng Ảo 3D | Hệ Thống Triển Lãm Không Gian Nghệ Thuật Tương Tác",
  description: "Trải nghiệm không gian bảo tàng ảo 3D tương tác thời gian thực, xem tranh nghệ thuật và các mô hình điêu khắc cổ vật với chất lượng cao trên nền tảng Web.",
  keywords: ["bao tang ao 3d", "virtual museum", "trien lam nghe thuat 3d", "react three fiber", "nextjs"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} ${ebGaramond.variable} ${hankenGrotesk.variable} ${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-[#fbf9f8] text-[#1b1c1c] font-sans flex flex-col">
        <MuseumProvider>
          <CompetitionProvider>{children}<CompetitionPlayerHud /></CompetitionProvider>
        </MuseumProvider>
      </body>
    </html>
  );
}
