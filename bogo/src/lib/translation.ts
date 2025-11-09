import { TranslationText } from "@tagadapay/plugin-sdk/v2";

export const resolveTranslation = (
  text: TranslationText | string | null | undefined,
  locale: string = "en"
): string => {
  if (text == null) {
    return "";
  }

  if (typeof text === "string") {
    return text;
  }

  const translations = text as Record<string, string>;

  if (translations[locale]) {
    return translations[locale];
  }

  if (translations.en) {
    return translations.en;
  }

  const firstAvailable = Object.values(translations).find(
    (value): value is string => typeof value === "string"
  );

  return firstAvailable ?? "";
};

