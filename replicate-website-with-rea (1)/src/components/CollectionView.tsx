import Link from "next/link";
import ProductCard from "./ProductCard";
import { getBrands, listProducts, type SortKey } from "@/lib/data";
import { getI18n } from "@/lib/lang";
import { CATEGORIES } from "@/lib/options";

type SP = { [k: string]: string | string[] | undefined };

const SORT_KEYS: SortKey[] = ["featured", "price-asc", "price-desc", "rating", "discount"];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function CollectionView({
  category,
  q,
  title,
  searchParams,
  basePath,
}: {
  category?: string;
  q?: string;
  title: string;
  searchParams: SP;
  basePath: string;
}) {
  const { l, tv } = await getI18n();
  const SORT_LABEL: Record<SortKey, string> = {
    featured: l("المميزة", "Sélection"),
    "price-asc": l("السعر: من الأقل إلى الأعلى", "Prix croissant"),
    "price-desc": l("السعر: من الأعلى إلى الأقل", "Prix décroissant"),
    rating: l("الأعلى تقييماً", "Mieux notés"),
    discount: l("أكبر تخفيض", "Plus grosse remise"),
  };

  const brandsParam = searchParams.brand;
  const brands = brandsParam ? (Array.isArray(brandsParam) ? brandsParam : [brandsParam]) : [];
  const min = one(searchParams.min) ? Number(one(searchParams.min)) : undefined;
  const max = one(searchParams.max) ? Number(one(searchParams.max)) : undefined;
  const sortRaw = one(searchParams.sort) as SortKey | undefined;
  const sort: SortKey = sortRaw && SORT_KEYS.includes(sortRaw) ? sortRaw : "featured";

  const [items, allBrands] = await Promise.all([
    listProducts({
      category,
      q,
      brands,
      min: Number.isFinite(min) ? min : undefined,
      max: Number.isFinite(max) ? max : undefined,
      sort,
    }),
    getBrands(category),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 text-xs font-semibold text-muted">
        <Link href="/" className="hover:text-brand">{l("الرئيسية", "Accueil")}</Link> / <span className="text-ink">{title}</span>
      </nav>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
          <p className="mt-1 text-sm text-muted">
            {items.length} {l("جهاز", items.length === 1 ? "appareil" : "appareils")}
          </p>
        </div>
      </div>

      <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
        <Link href="/collections/all" className={`shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-bold ${category === "all" ? "border-brand bg-brand text-white" : "border-line hover:border-brand"}`}>
          {tv("cat", "all")}
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/collections/${c.slug}`} className={`shrink-0 rounded-full border-2 px-4 py-1.5 text-sm font-bold ${category === c.slug ? "border-brand bg-brand text-white" : "border-line hover:border-brand"}`}>
            {tv("cat", c.slug)}
          </Link>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <form action={basePath} method="get" className="h-fit rounded-2xl border border-line p-5 lg:sticky lg:top-24">
          {q && <input type="hidden" name="q" value={q} />}
          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider">{l("ترتيب حسب", "Trier par")}</h2>
          <select name="sort" defaultValue={sort} className="input mb-6 text-sm">
            {SORT_KEYS.map((k) => (
              <option key={k} value={k}>{SORT_LABEL[k]}</option>
            ))}
          </select>

          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider">{l("الماركة", "Marque")}</h2>
          <div className="mb-6 space-y-2">
            {allBrands.map((b) => (
              <label key={b} className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                <input type="checkbox" name="brand" value={b} defaultChecked={brands.includes(b)} className="h-4 w-4 accent-brand" />
                {b}
              </label>
            ))}
          </div>

          <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider">{l("السعر (MRU)", "Prix (MRU)")}</h2>
          <div className="mb-6 flex items-center gap-2">
            <input name="min" type="number" min={0} placeholder={l("الأدنى", "Min")} defaultValue={min} className="input px-3 py-2 text-sm" />
            <span>–</span>
            <input name="max" type="number" min={0} placeholder={l("الأعلى", "Max")} defaultValue={max} className="input px-3 py-2 text-sm" />
          </div>
          <button className="btn-primary w-full">{l("تطبيق الفلاتر", "Appliquer")}</button>
          <Link href={q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath} className="mt-3 block text-center text-sm font-semibold text-muted underline">
            {l("مسح الكل", "Tout effacer")}
          </Link>
        </form>

        <div>
          {items.length === 0 ? (
            <div className="rounded-2xl bg-soft p-12 text-center">
              <p className="text-xl font-bold">{l("لا توجد أجهزة مطابقة لبحثك", "Aucun appareil ne correspond")}</p>
              <p className="mt-1 text-sm text-muted">{l("جرّب إزالة أحد الفلاتر أو ابحث عن شيء آخر.", "Essayez de retirer un filtre ou de chercher autre chose.")}</p>
              <Link href="/collections/all" className="btn-primary mt-5 inline-block">{l("تصفح كل الأجهزة", "Voir tous les appareils")}</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
