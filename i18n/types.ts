import { locales } from "@/i18n/config";

export type Lang = (typeof locales)[number];

export interface I18nParams {
  params: {
    lang: Lang;
  };
}

export type WithI18n<T = unknown> = T & I18nParams;
