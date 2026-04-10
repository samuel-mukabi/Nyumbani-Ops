import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nyumbani-ops.com"),
  title: {
    default: "Nyumbani-Ops | Precision Property Management",
    template: "%s | Nyumbani-Ops",
  },
  description: "Advanced automation for Kenyan short-term rental operators. Seamlessly track KPLC meters, integrate TTLock, and automate eTIMS compliance.",
  keywords: [
    "Property Management",
    "Short-term rental automation",
    "Kenya Real Estate",
    "KPLC tracking",
    "TTLock integration",
    "eTIMS compliance",
    "Airbnb Management Kenya",
    "Nyumbani Ops",
  ],
  authors: [{ name: "Nyumbani-Ops Team" }],
  creator: "Nyumbani-Ops",
  publisher: "Nyumbani-Ops",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://nyumbani-ops.com",
    siteName: "Nyumbani-Ops",
    title: "Nyumbani-Ops | Precision Property Management",
    description: "Native automation for Kenyan STR operators. KPLC tracking, TTLock integration, and eTIMS compliance.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nyumbani-Ops - Precision Property Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nyumbani-Ops | Precision Property Management",
    description: "Native automation for Kenyan STR operators. KPLC tracking, TTLock integration, and eTIMS compliance.",
    creator: "@nyumbaniops",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google4800b59b517b2d5f",
  },
  alternates: {
    canonical: "/",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
