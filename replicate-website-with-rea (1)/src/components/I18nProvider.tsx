"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { makeI18n, type I18n, type Lang } from "@/lib/i18n";

const Ctx = createContext<I18n>(makeI18n("ar"));

export function I18nProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  const value = useMemo(() => makeI18n(lang), [lang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
