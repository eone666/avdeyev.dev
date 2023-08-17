import { locales } from "@/i18n/config";
import { WithI18n } from "@/i18n/types";

export async function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export default async function Page({ params: { lang } }: WithI18n) {
  return <div>{lang}</div>;
}
