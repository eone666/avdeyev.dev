import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "@/types/middlewareFactory";
import { locales } from "@/i18n/config";
import { getLocale } from "@/i18n/getLocale";

export const withI18n: MiddlewareFactory = (next) => {
  return (request: NextRequest, _next: NextFetchEvent) => {
    const pathname = request.nextUrl.pathname;
    const pathnameIsMissingLocale = locales.every(
      (locale) =>
        !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`,
    );

    if (pathnameIsMissingLocale) {
      const locale = getLocale(request);

      return NextResponse.redirect(
        new URL(`/${locale}/${pathname}`, request.url),
      );
    }
    return next(request, _next);
  };
};
