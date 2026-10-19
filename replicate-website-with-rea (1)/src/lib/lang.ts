import { cookies, headers } from "next/headers";
import { LANG_COOKIE, makeI18n, normLang, type Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  // middleware resolves ?lang / the cookie into this header on every request
  const h = await headers();
  const fromHeader = h.get("x-lang");
  if (fromHeader === "fr" || fromHeader === "ar") return fromHeader;
  // fallback for routes the middleware skips (e.g. /api/*)
  const c = await cookies();
  return normLang(c.get(LANG_COOKIE)?.value);
}

export async function getI18n() {
  return makeI18n(await getLang());
}
