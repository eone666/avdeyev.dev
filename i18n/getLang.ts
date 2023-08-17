import { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { defaultLocale, locales } from "@/i18n/locales";

export function getLang(request: NextRequest) {
  const cookieLang = request.cookies.get("lang")?.value;

  if (cookieLang) {
    return cookieLang;
  }

  const languages = new Negotiator({
    headers: Object.fromEntries(request.headers),
  }).languages();

  return match(languages, locales, defaultLocale);
}
