import type { Metadata } from "next";
import localFont from "next/font/local";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
// Pixel display face — short bursts only: hero headline words, score
// digits, HUD labels. Wide bitmap glyphs, never used for paragraphs.
const pixelDisplay = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
});
// Terminal face — the workhorse pixel font: nav, panels, eyebrows,
// section labels. Readable at normal sizes, unlike the display face.
const terminal = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-terminal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeadGen — Find the Signal",
  description: "LeadGen scans the conversations happening in your market and brings back the ones worth a reply.",
  metadataBase: new URL("https://leadgen.example.com"),
  openGraph: {
    title: "LeadGen — Find the Signal",
    description: "LeadGen scans the conversations happening in your market and brings back the ones worth a reply.",
    url: "/",
    siteName: "LeadGen",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LeadGen pixel art universe",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeadGen — Find the Signal",
    description: "LeadGen scans the conversations happening in your market and brings back the ones worth a reply.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${pixelDisplay.variable} ${terminal.variable} min-h-screen bg-background font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
