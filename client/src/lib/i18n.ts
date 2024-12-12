import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { locale } from "@/config/i18n";
import en from "@/i18n/en.json";
import ta from "@/i18n/ta.json";

i18n
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    debug: true,
    fallbackLng: locale.en,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    resources: {
      [locale.en]: {
        translation: en,
      },
      [locale.ta]: {
        translation: ta,
      },
    },
  });

export { i18n };
