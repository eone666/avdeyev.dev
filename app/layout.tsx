import { ReactNode } from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Open_Sans } from "next/font/google";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import Providers from "@/app/providers";
import "@/app/globals.css";

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
  applicationName: "AVDEYEV.DEV",
  themeColor: "#000000",
  icons: [
    {
      type: "image/x-icon",
      rel: "icon",
      url: "/favicon.ico",
      sizes: "all",
    },
    {
      type: "image/png",
      rel: "icon",
      url: "/favicon-16x16.png",
      sizes: "16x16",
    },
    {
      type: "image/png",
      rel: "icon",
      url: "/favicon-32x32.png",
      sizes: "32x32",
    },
    {
      rel: "apple-touch-icon",
      url: "/apple-touch-icon.png",
      sizes: "/apple-touch-icon.png",
    },
  ],
};
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={openSans.variable} suppressHydrationWarning>
      <body>
        <Providers>
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
