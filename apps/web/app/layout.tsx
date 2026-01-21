import type { Metadata } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const lora = Lora({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${sourceSans.variable} ${lora.variable} antialiased font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
