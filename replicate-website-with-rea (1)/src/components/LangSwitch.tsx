"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "./I18nProvider";

export default function LangSwitch({ className = "" }: { className?: string }) {
  const { lang } = useI18n();
  const router = useRouter();
  const next = lang === "ar" ? "fr" : "ar";

  function switchLang() {
    // Remember the choice. SameSite=None + Secure is required for the cookie to be
    // stored when the store runs inside a cross-origin iframe; plain http (local
    // dev) rejects Secure cookies, so fall back to Lax there.
    const secure = typeof window !== "undefined" && window.location.protocol === "https:";
    document.cookie = `lang=${next}; path=/; max-age=31536000; ${
      secure ? "samesite=none; secure" : "samesite=lax"
    }`;

    // Flip the document immediately so the page never shows the wrong direction
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";

    // Carry ?lang in the URL as well: middleware turns it into a request header,
    // so the switch works even if the cookie cannot be stored at all.
    const q = new URLSearchParams(window.location.search);
    q.set("lang", next);
    router.replace(`${window.location.pathname}?${q.toString()}`);
  }

  return (
    <button
      type="button"
      onClick={switchLang}
      className={`flex items-center gap-1.5 rounded-full border-2 border-line px-3.5 py-2 text-sm font-bold transition hover:border-brand hover:text-brand ${className}`}
      aria-label={lang === "ar" ? "Passer en français" : "التبديل إلى العربية"}
      title={lang === "ar" ? "Passer en français" : "التبديل إلى العربية"}
      lang={next}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
      </svg>
      {lang === "ar" ? "Français" : "العربية"}
    </button>
  );
}
