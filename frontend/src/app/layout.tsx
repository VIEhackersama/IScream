import type { Metadata } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        {/* Material Symbols Outlined */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${nunito.variable} ${playfair.variable} font-display bg-background-light dark:bg-background-dark text-text-main dark:text-background-light overflow-x-hidden antialiased selection:bg-primary selection:text-white`}
      >
        <div className="relative flex h-auto min-h-screen w-full flex-col">
          <Navbar />
          <main className="flex flex-1 flex-col items-center w-full px-4 md:px-10 pb-20">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
