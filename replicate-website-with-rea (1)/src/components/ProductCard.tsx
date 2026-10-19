import Link from "next/link";
import ProductImage from "./ProductImage";
import type { Product } from "@/db/schema";
import { getI18n } from "@/lib/lang";

export function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex" dir="ltr" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i <= Math.round(rating) ? "#f5a623" : "#d8d6ea"}>
          <path d="m10 1.5 2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8z" />
        </svg>
      ))}
    </span>
  );
}

export default async function ProductCard({ p }: { p: Product }) {
  const { l, tv, m } = await getI18n();
  const off = p.compareAtPrice ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;
  const isNew = p.grade === "New";
  return (
    <Link
      href={`/products/${p.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:shadow-[0_14px_34px_-14px_rgba(29,8,54,0.4)]"
    >
      <div className="relative p-2.5">
        <div className="absolute start-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {off > 0 && <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-bold text-white" dir="ltr">-{off}%</span>}
          {p.badge && <span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold text-ink">{tv("badge", p.badge)}</span>}
        </div>
        <ProductImage src={p.image} alt={p.name} className="mx-auto aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand">{p.brand}</p>
        <h3 className="mt-0.5 line-clamp-2 min-h-[2.6rem] text-sm font-bold leading-snug" dir="auto">{p.name}</h3>
        <p className="mt-1 truncate text-xs text-muted">
          {[p.storage, tv("color", p.colorName)].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <Stars rating={p.rating} />
          <span>({p.reviewCount})</span>
        </div>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-3">
          <span className="text-lg font-extrabold">{m(p.price)}</span>
          {p.compareAtPrice && <span className="text-xs text-muted line-through">{m(p.compareAtPrice)}</span>}
        </div>
        <p className="mt-1 text-[11px] font-semibold text-muted">
          {isNew ? l("جديد كلياً", "Neuf") : `${l("حالة", "État")} ${tv("grade", p.grade)}`}
          {p.batteryHealth && !isNew ? ` · 🔋 ${p.batteryHealth}%` : ""}
        </p>
      </div>
    </Link>
  );
}
