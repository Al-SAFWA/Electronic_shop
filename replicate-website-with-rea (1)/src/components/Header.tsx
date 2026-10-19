"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import LangSwitch from "./LangSwitch";
import Logo from "./Logo";
import ProductImage from "./ProductImage";
import { CATEGORIES } from "@/lib/options";

type Hit = { slug: string; name: string; price: number; image: string; storage: string | null };

function SearchBox({ onDone }: { onDone?: () => void }) {
  const { l, m } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHits([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setHits(d.results ?? []))
        .catch(() => {});
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={box} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!q.trim()) return;
          setOpen(false);
          onDone?.();
          router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
        className="flex items-center rounded-full border-2 border-line bg-white ps-4 pe-1 focus-within:border-brand"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="shrink-0 text-muted">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={l("ابحث عن آيفون، ماك بوك، إيربودز…", "Rechercher iPhone, MacBook, AirPods…")}
          className="h-11 w-full bg-transparent px-3 text-sm outline-none"
        />
        <button className="my-1 rounded-full bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-dark">{l("بحث", "Chercher")}</button>
      </form>
      {open && q.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-xl">
          {hits.length === 0 ? (
            <p className="p-4 text-sm text-muted">{l("لا توجد نتائج — اضغط Enter للبحث.", "Aucun résultat — appuyez sur Entrée.")}</p>
          ) : (
            <>
              {hits.map((h) => (
                <Link
                  key={h.slug}
                  href={`/products/${h.slug}`}
                  onClick={() => {
                    setOpen(false);
                    onDone?.();
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-soft"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center p-0.5">
                    <ProductImage src={h.image} alt={h.name} stage="mini" className="h-full w-full" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold" dir="auto">{h.name}</span>
                    <span className="block text-xs text-muted">{h.storage}</span>
                  </span>
                  <span className="text-sm font-bold">{m(h.price)}</span>
                </Link>
              ))}
              <Link
                href={`/search?q=${encodeURIComponent(q)}`}
                onClick={() => setOpen(false)}
                className="block border-t border-line px-4 py-3 text-center text-sm font-bold text-brand hover:bg-soft"
              >
                {l("عرض كل النتائج ←", "Voir tous les résultats →")}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const { l, tv } = useI18n();
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_var(--color-line)]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-soft lg:hidden" onClick={() => setMenu(true)} aria-label={l("القائمة", "Menu")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>
        <Link href="/" aria-label="Loopt">
          <Logo />
        </Link>
        <div className="mx-4 hidden max-w-2xl flex-1 lg:block">
          <SearchBox />
        </div>
        <div className="ms-auto flex items-center gap-2">
          <LangSwitch />
          <Link href="/info/contact" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold hover:bg-soft md:flex">
            <span>💬</span> {l("المساعدة", "Aide")}
          </Link>
          <button onClick={() => setOpen(true)} className="relative flex items-center gap-2 rounded-full bg-soft px-4 py-2.5 text-sm font-bold hover:bg-line" aria-label={l("السلة", "Panier")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 7h12l1 13H5z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            <span className="hidden sm:inline">{l("السلة", "Panier")}</span>
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[11px] text-white">{count}</span>
          </button>
        </div>
      </div>
      <div className="px-4 pb-3 lg:hidden">
        <SearchBox />
      </div>

      <nav className="hidden border-t border-line lg:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 px-4 text-sm font-semibold">
          <li>
            <Link href="/collections/all" className="block rounded-full px-4 py-3 hover:text-brand">
              {l("كل الأجهزة", "Tous les appareils")}
            </Link>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link href={`/collections/${c.slug}`} className="block px-4 py-3 hover:text-brand">
                {tv("cat", c.slug)}
              </Link>
            </li>
          ))}
          <li className="ms-auto">
            <Link href="/info/how-it-works" className="block px-4 py-3 text-brand">
              {l("كيف تعمل لوبت", "Comment ça marche")}
            </Link>
          </li>
        </ul>
      </nav>

      {menu && (
        <div className="fixed inset-0 z-[90]">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMenu(false)} />
          <div className="absolute start-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <Logo />
              <button onClick={() => setMenu(false)} aria-label={l("إغلاق", "Fermer")}>✕</button>
            </div>
            <ul className="space-y-1 font-semibold">
              <li>
                <Link onClick={() => setMenu(false)} href="/collections/all" className="block rounded-xl px-3 py-3 hover:bg-soft">
                  {l("كل الأجهزة", "Tous les appareils")}
                </Link>
              </li>
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link onClick={() => setMenu(false)} href={`/collections/${c.slug}`} className="block rounded-xl px-3 py-3 hover:bg-soft">
                    {tv("cat", c.slug)}
                  </Link>
                </li>
              ))}
              <li>
                <Link onClick={() => setMenu(false)} href="/info/how-it-works" className="block rounded-xl px-3 py-3 text-brand hover:bg-soft">
                  {l("كيف تعمل لوبت", "Comment ça marche")}
                </Link>
              </li>
              <li>
                <Link onClick={() => setMenu(false)} href="/info/contact" className="block rounded-xl px-3 py-3 hover:bg-soft">
                  {l("المساعدة والتواصل", "Aide et contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
