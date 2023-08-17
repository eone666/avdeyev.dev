import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "@/types/middlewareFactory";
import { LOCALES } from "@/i18n/locales";
import { getLang } from "@/i18n/getLang";

export const withI18n: MiddlewareFactory = (next) => {
  return (request: NextRequest, _next: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;
    const pathnameIsMissingLocale = LOCALES.every(
      (locale) =>
        !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    );

    if (pathnameIsMissingLocale) {
      const lang = getLang(request);

      const cookieLang = request.cookies.get("lang")?.value;
      if (!cookieLang) {
        request.cookies.set("lang", lang);
      }

      return NextResponse.redirect(
        new URL(`/${lang}/${pathname}`, request.url),
      );
    }
    return next(request, _next);
  };
};
