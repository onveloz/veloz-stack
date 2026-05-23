import { defineRouting } from "next-intl/routing";

/** @internal Scaffold export. */
export const routing = defineRouting({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  localePrefix: "as-needed",
});

