import { NextResponse } from "next/server";
import { withI18n } from "@/i18n/withI18n";

export function defaultMiddleware() {
  return NextResponse.next();
}
export default withI18n(defaultMiddleware);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
