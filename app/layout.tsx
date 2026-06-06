import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "LandChain — Decentralized Land Registry & Property Management",
  description: "Secure, transparent, and instant land mutation and registry platform powered by Blockchain and IPFS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${syne.variable} ${dmSans.variable} font-body antialiased selection:bg-brand-light selection:text-brand-dark`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
