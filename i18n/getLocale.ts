import { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { DEFAULT_LOCALE, LOCALES } from "@/i18n/locales";

export function getLocale(request: NextRequest) {
  const cookieLang = request.cookies.get("locale")?.value;

  if (cookieLang) {
    return cookieLang;
  }

  const languages = new Negotiator({
    headers: Object.fromEntries(request.headers),
  }).languages();

  return match(languages, LOCALES as unknown as string[], DEFAULT_LOCALE);
}
