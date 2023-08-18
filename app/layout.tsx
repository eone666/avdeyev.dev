import { ReactNode } from "react";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "@/app/globals.css";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const openSans = Open_Sans({
  subsets: ["latin", "cyrillic"],
  fallback: ["sans-serif"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-open-sans">{children}</body>
    </html>
  );
}
