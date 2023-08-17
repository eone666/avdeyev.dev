import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "@/types/middlewareFactory";
import { LOCALES } from "@/i18n/locales";
import { getLocale } from "@/i18n/getLocale";

export const withI18n: MiddlewareFactory = (next) => {
  return (request: NextRequest, _next: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;
    const pathnameIsMissingLocale = LOCALES.every(
      (locale) =>
        !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    );

    if (pathnameIsMissingLocale) {
      const locale = getLocale(request);

      const cookieLang = request.cookies.get("locale")?.value;
      if (!cookieLang) {
        request.cookies.set("locale", locale);
      }

      return NextResponse.redirect(
        new URL(`/${locale}/${pathname}`, request.url),
      );
    }
    return next(request, _next);
  };
};
