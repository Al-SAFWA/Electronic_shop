import Link from "next/link";
import { notFound } from "next/navigation";
import BuyBox from "@/components/BuyBox";
import Carousel, { Slide } from "@/components/Carousel";
import ProductImage from "@/components/ProductImage";
import ProductCard, { Stars } from "@/components/ProductCard";
import ReviewForm from "@/components/ReviewForm";
import { getProduct, getRelated, getReviews } from "@/lib/data";
import { getI18n } from "@/lib/lang";
import { FREE_SHIPPING_OVER } from "@/lib/options";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProduct((await params).slug);
  const { l } = await getI18n();
  return { title: p ? `${p.name} ${p.storage ?? ""} — ${l("مجدد ومعتمد", "reconditionné certifié")} | Loopt` : "404" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();
  const { l, tv, m, lang } = await getI18n();
  const [revs, related] = await Promise.all([getReviews(p.id), getRelated(p)]);
  const isNew = p.grade === "New";
  const colorName = tv("color", p.colorName);

  const noun =
    p.category === "laptops"
      ? l("حاسوب محمول", "ordinateur portable")
      : p.category === "audio"
        ? l("جهاز صوتي", "appareil audio")
        : l("جهاز", "appareil");
  const description = isNew
    ? l(`${p.name} — إكسسوار جديد كلياً، مفحوص وجاهز للشحن.`, `${p.name} — accessoire neuf, testé et prêt à être expédié.`)
    : l(
        `${p.name} ${noun} مجدد ومعتمد. يخضع كل جهاز لفحص من 60 نقطة ومسح كامل للبيانات والتحقق من صحة البطارية، ثم يُنظف ويُعاد تغليفه. يأتي بضمان لوبت لمدة 12 شهراً وتوصيل مجاني (للطلبات المؤهلة) وإرجاع خلال 14 يوماً دون أسئلة.`,
        `Ce ${p.name} est un ${noun} reconditionné certifié. Chaque unité passe un contrôle en 60 points, un effacement complet des données et une vérification de la batterie, puis est nettoyée et reconditionnée. Garantie Loopt 12 mois, livraison offerte (commandes éligibles) et retour sous 14 jours sans question.`,
      );

  const specs: [string, string][] = [
    [l("الماركة", "Marque"), p.brand],
    [l("الحالة", "État"), isNew ? l("جديد كلياً", "Neuf") : l(`حالة ${tv("grade", p.grade)} — مجدد ومعتمد`, `État ${tv("grade", p.grade)} — reconditionné certifié`)],
    ...(p.storage ? ([[l("التخزين / المواصفات", "Stockage / specs"), p.storage]] as [string, string][]) : []),
    [l("اللون", "Couleur"), colorName],
    ...(p.batteryHealth && !isNew ? ([[l("صحة البطارية", "Santé batterie"), `${p.batteryHealth}%+`]] as [string, string][]) : []),
    [l("الضمان", "Garantie"), isNew ? l("6 أشهر", "6 mois") : l("12 شهراً ضمان لوبت", "12 mois Loopt")],
    [l("الإرجاع", "Retours"), l("14 يوماً، مجاناً", "14 jours, gratuit")],
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="mb-5 text-xs font-semibold text-muted">
          <Link href="/" className="hover:text-brand">{l("الرئيسية", "Accueil")}</Link> /{" "}
          <Link href={`/collections/${p.category}`} className="hover:text-brand">{tv("cat", p.category)}</Link> /{" "}
          <span className="text-ink">{p.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="relative rounded-3xl bg-white p-4 ring-1 ring-line">
              {p.badge && <span className="absolute start-5 top-5 rounded-full bg-lime px-3 py-1 text-xs font-bold">{tv("badge", p.badge)}</span>}
              <ProductImage src={p.image} alt={p.name} priority className="mx-auto aspect-[4/3] w-full max-w-md" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs font-bold">
              {[
                ["🛡️", l("ضمان 12 شهراً", "Garantie 12 mois")],
                ["🚚", l(`توصيل مجاني فوق ${m(FREE_SHIPPING_OVER)}`, `Livraison offerte dès ${m(FREE_SHIPPING_OVER)}`)],
                ["↩️", l("إرجاع خلال 14 يوماً", "Retour sous 14 jours")],
              ].map(([i, t]) => (
                <div key={t} className="rounded-xl bg-soft px-2 py-3">
                  <div className="text-xl">{i}</div>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand">{p.brand}</p>
            <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl" dir="auto">{p.name}</h1>
            <p className="mt-1 text-muted">{[p.storage, colorName].filter(Boolean).join(" · ")}</p>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <Stars rating={p.rating} size={16} />
              <a href="#reviews" className="font-semibold underline">
                {p.rating} ({p.reviewCount} {l("تقييم", "avis")})
              </a>
            </div>
            <div className="my-6 h-px bg-line" />
            <BuyBox
              p={{
                id: p.id,
                slug: p.slug,
                name: p.name,
                image: p.image,
                storage: p.storage,
                colorName,
                price: p.price,
                compareAtPrice: p.compareAtPrice,
                stock: p.stock,
                isNew,
                supportsBattery: !isNew && p.batteryHealth !== null,
              }}
            />

            <div className="mt-10">
              <h2 className="text-lg font-extrabold">{l("عن هذا الجهاز", "À propos de cet appareil")}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
              <dl className="mt-5 divide-y divide-line rounded-2xl border border-line text-sm">
                {specs.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-4 py-3">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              {!isNew && (
                <div className="mt-5 rounded-2xl bg-ink p-5 text-white">
                  <h3 className="font-bold">{l("محتويات العلبة", "Contenu du colis")}</h3>
                  <p className="mt-1 text-sm text-white/70">{l("جهازك، وكابل شحن سريع، وأداة SIM عند الحاجة، وتقرير فحص مطبوع.", "Votre appareil, un câble de charge rapide, un outil SIM si nécessaire et un rapport d'inspection imprimé.")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <section id="reviews" className="mt-16 scroll-mt-40">
          <h2 className="mb-6 text-2xl font-extrabold tracking-tight">{l("آراء العملاء", "Avis clients")}</h2>
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {revs.length === 0 && <p className="text-muted">{l("لا توجد آراء بعد — كن الأول.", "Aucun avis pour l'instant — soyez le premier.")}</p>}
              {revs.map((r) => (
                <article key={r.id} className="rounded-2xl border border-line p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold" dir="auto">{r.author}</span>
                    <span className="text-xs text-muted">{r.createdAt.toLocaleDateString(lang === "ar" ? "ar-MR-u-nu-latn" : "fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <Stars rating={r.rating} />
                  <p className="mt-2 text-sm leading-relaxed" dir="auto">{r.body}</p>
                  <p className="mt-2 text-xs font-semibold text-brand">{l("✓ شراء موثّق", "✓ Achat vérifié")}</p>
                </article>
              ))}
            </div>
            <ReviewForm productId={p.id} />
          </div>
        </section>
      </div>

      {related.length > 0 && (
        <div className="pb-4">
          <Carousel title={l("قد يعجبك أيضاً", "Vous aimerez aussi")} href={`/collections/${p.category}`}>
            {related.map((r) => (
              <Slide key={r.id}>
                <ProductCard p={r} />
              </Slide>
            ))}
          </Carousel>
        </div>
      )}
    </>
  );
}
