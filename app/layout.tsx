import { ReactNode } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Open_Sans } from "next/font/google";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import Providers from "@/app/providers";
import "@/app/globals.css";
import favicon from "./favicon.ico";

dayjs.extend(duration);
dayjs.extend(relativeTime);

const openSans = Open_Sans({
  subsets: ["latin", "cyrillic"],
  fallback: ["sans-serif"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["300", "400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ivan Avdeyev | Frontend Developer",
  description: "Ivan Avdeyev | Frontend Developer",
  icons: [
    {
      type: "image/x-icon",
      url: favicon.src,
      sizes: "all",
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={openSans.variable} suppressHydrationWarning>
      <body className="grid min-h-[100dvh]">
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
