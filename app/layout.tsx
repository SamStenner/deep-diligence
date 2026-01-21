import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DeepDiligence",
    template: "%s | DeepDiligence",
  },
  description:
    "AI-powered due diligence platform for investors and PE/VC firms. Automate complex DD checks with orchestrated AI agents.",
  keywords: [
    "due diligence",
    "AI",
    "investment",
    "private equity",
    "venture capital",
    "M&A",
    "automation",
  ],
  authors: [{ name: "DeepDiligence" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "DeepDiligence",
    title: "DeepDiligence - AI-Powered Due Diligence",
    description:
      "Automate complex due diligence checks with AI agents. Save weeks of manual work.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeepDiligence - AI-Powered Due Diligence",
    description:
      "Automate complex due diligence checks with AI agents. Save weeks of manual work.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
