import "./css/style.css";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://w8list.com"),
  title: "w8list — Adaptive waitlist forms that match any site",
  description: "Drop one script tag. Get a waitlist form that auto-adapts to your site's colors, fonts, and style. See signups in a dashboard. Free to start.",
  keywords: ["waitlist", "waitlist form", "embeddable waitlist", "pre-launch", "adaptive form", "waitlist SaaS", "startup launch", "email collection"],
  authors: [{ name: "w8list", url: "https://w8list.com" }],
  alternates: {
    canonical: "https://w8list.com",
  },
  openGraph: {
    title: "w8list — Waitlist forms that match your site automatically",
    description: "One script tag. Your waitlist form auto-adapts to your site's UI — colors, fonts, dark mode, everything. Free to start.",
    url: "https://w8list.com",
    siteName: "w8list",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "w8list — Adaptive waitlist forms",
    description: "One script tag. Your waitlist form auto-adapts to your site's UI — colors, fonts, dark mode, everything.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} bg-gray-50 font-inter tracking-tight text-gray-900 antialiased`}
      >
        <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
          {children}
        </div>
      </body>
    </html>
  );
}
