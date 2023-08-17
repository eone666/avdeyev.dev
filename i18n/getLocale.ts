import { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { defaultLocale, locales } from "@/i18n/locales";

export function getLocale(request: NextRequest) {
  if (request.cookies.has("lang")) {
    return request.cookies.get("lang");
  }

  const languages = new Negotiator({
    headers: Object.fromEntries(request.headers),
  }).languages();

  const lang = match(languages, locales, defaultLocale);

  request.cookies.set("lang", lang);

  return lang;
}
