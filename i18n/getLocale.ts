import { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

import { locales, defaultLocale } from "@/i18n/config";

export function getLocale(request: NextRequest) {
  const languages = new Negotiator({
    headers: Object.fromEntries(request.headers),
  }).languages();

  return match(languages, locales as unknown as string[], defaultLocale);
}
