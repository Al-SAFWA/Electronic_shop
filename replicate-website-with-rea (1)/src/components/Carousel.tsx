"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { useI18n } from "./I18nProvider";

export default function Carousel({
  title,
  href,
  subtitle,
  children,
}: {
  title: string;
  href?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { l } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    const el = ref.current;
    if (!el) return;
    // in RTL, "next" means scrolling towards negative scrollLeft
    const sign = getComputedStyle(el).direction === "rtl" ? -1 : 1;
    el.scrollBy({ left: dir * sign * el.clientWidth * 0.85, behavior: "smooth" });
  };
  const chevron = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
  return (
    <section className="mx-auto max-w-7xl px-4 pt-14">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {href && (
            <Link href={href} className="text-sm font-bold text-brand hover:underline">
              {l("عرض الكل", "Voir tout")}
            </Link>
          )}
          <div className="hidden gap-2 md:flex">
            <button onClick={() => scroll(-1)} className="grid h-10 w-10 place-items-center rounded-full border-2 border-line hover:border-ink" aria-label={l("السابق", "Précédent")}>
              <span className="rotate-180">{chevron}</span>
            </button>
            <button onClick={() => scroll(1)} className="grid h-10 w-10 place-items-center rounded-full border-2 border-line hover:border-ink" aria-label={l("التالي", "Suivant")}>
              {chevron}
            </button>
          </div>
        </div>
      </div>
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3">
        {children}
      </div>
    </section>
  );
}

export function Slide({ children }: { children: ReactNode }) {
  return <div className="w-[62%] shrink-0 snap-start sm:w-[34%] md:w-[26%] lg:w-[22%]">{children}</div>;
}
