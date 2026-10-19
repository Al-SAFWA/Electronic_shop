import Link from "next/link";
import Carousel, { Slide } from "@/components/Carousel";
import ProductCard, { Stars } from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import { listProducts } from "@/lib/data";
import { getI18n } from "@/lib/lang";
import { CATEGORIES, FREE_SHIPPING_OVER, toMru } from "@/lib/options";
import { CATEGORY_IMAGE } from "@/lib/product-images";


export const dynamic = "force-dynamic";

export default async function Home() {
  const { l, tv, m } = await getI18n();
  const [featured, iphones, samsung, laptops, deals] = await Promise.all([
    listProducts({ sort: "featured", limit: 10 }),
    listProducts({ category: "iphones", limit: 8 }),
    listProducts({ category: "samsung", limit: 8 }),
    listProducts({ category: "laptops", limit: 8 }),
    listProducts({ sort: "discount", limit: 4 }),
  ]);

  const PILLARS = [
    { icon: "🛡️", title: l("شراء بلا مخاطرة", "Achat sans risque"), text: l("ضمان 12 شهراً وإرجاع مجاني خلال 14 يوماً على كل جهاز.", "Garantie 12 mois et retour gratuit sous 14 jours sur chaque appareil.") },
    { icon: "🔍", title: l("فحص جهاز بجهاز", "Contrôlé un par un"), text: l("فحص من 60 نقطة على يد فنيين معتمدين قبل أي شحن.", "Contrôle en 60 points par des techniciens certifiés avant toute expédition.") },
    { icon: "🏆", title: l("علامات موثوقة فقط", "Marques de confiance"), text: l("آبل وسامسونج وسوني ودل وغيرها — لا بضائع مجهولة المصدر.", "Apple, Samsung, Sony, Dell et d'autres — jamais de marques inconnues.") },
    { icon: "💬", title: l("فريق حقيقي بجانبك", "Une vraie équipe"), text: l("دعم ودود عبر واتساب بالعربية والفرنسية.", "Un support chaleureux sur WhatsApp en arabe et en français.") },
  ];

  const REVIEWS = [
    { n: l("محمد ولد أحمد", "Mohamed O. Ahmed"), t: l("وصلني في اليوم التالي وكأنه جديد. صحة البطارية أعلى مما هو مذكور!", "Reçu le lendemain, comme neuf. La santé de la batterie était meilleure qu'annoncé !"), d: "iPhone 15 Pro Max" },
    { n: l("مريم منت سيدي", "Mariem M. Sidi"), t: l("كنت مترددة في شراء جهاز مجدد، لكن تقرير الحالة كان دقيقاً. سعيدة جداً.", "J'hésitais à acheter du reconditionné, mais le rapport d'état était exact. Ravie."), d: 'MacBook Air 13" M2' },
    { n: l("سيدي محمد", "Sidi Mohamed"), t: l("سعر ممتاز وإتمام الطلب عبر واتساب كان سهلاً وسريعاً.", "Excellent prix et commande sur WhatsApp simple et rapide."), d: "AirPods Pro 2" },
    { n: l("فاطمة منت أحمدو", "Fatimetou M. Ahmedou"), t: l("ساعدني الفريق في اختيار الموديل المناسب لأولادي. سأشتري مرة أخرى.", "L'équipe m'a aidée à choisir le bon modèle pour mes enfants. J'achèterai encore."), d: "iPad 9th Gen" },
  ];

  const FAQ = [
    [l("ماذا تعني «مجدد ومعتمد»؟", "Que signifie « reconditionné certifié » ?"), l("يُفحص كل جهاز على 60 نقطة، ويُصلح بقطع جيدة عند الحاجة، ثم تُمسح بياناته الشخصية ويُنظف ويُعاد تغليفه.", "Chaque appareil est contrôlé sur 60 points, réparé avec des pièces de qualité si besoin, effacé de toute donnée personnelle, nettoyé et reconditionné.")],
    [l("ما صحة البطارية؟", "Quelle est la santé de la batterie ?"), l("كل هاتف أو جهاز لوحي أو ساعة بصحة بطارية 85% على الأقل. ويمكنك الترقية إلى بطارية جديدة (100%) من صفحة المنتج.", "Chaque téléphone, tablette ou montre a au moins 85 % de santé batterie. Vous pouvez passer à une batterie neuve (100 %) sur la page produit.")],
    [l("وإذا حدثت مشكلة؟", "Et en cas de problème ?"), l("لديك 14 يوماً للإرجاع مجاناً وضمان 12 شهراً. ويمكنك التمديد إلى سنتين مع «حماية لوبت» التي تغطي الأضرار العرضية.", "Vous avez 14 jours de retour gratuit et 12 mois de garantie. Étendez à 2 ans avec Loopt Shield, qui couvre aussi la casse accidentelle.")],
    [l("كيف أطلب؟", "Comment commander ?"), l("اضغط «اطلب عبر واتساب» وستُفتح محادثة مع صاحب المتجر وفيها تفاصيل طلبك جاهزة للإرسال. تأكيد الدفع والتوصيل يتم في المحادثة.", "Appuyez sur « Commander sur WhatsApp » : une conversation avec le propriétaire s'ouvre avec votre commande prête à envoyer. Paiement et livraison sont confirmés dans la discussion.")],
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ink via-[#2f0a5c] to-brand text-white">
        <div className="pointer-events-none absolute -end-24 -top-24 h-[28rem] w-[28rem] rounded-full bg-lime/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-lime">
              ● {l("أجهزة مجددة ومعتمدة", "Appareils reconditionnés certifiés")}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.15] tracking-tight md:text-6xl md:leading-[1.1]">
              {l("تقنية رائدة.", "Une tech haut de gamme.")}
              <br />
              <span className="text-lime">{l("بسعر عادل.", "À prix juste.")}</span> {l("بلا قلق.", "Zéro souci.")}
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/80">
              {l(
                "وفّر حتى 50% على الآيفون والحواسيب وأكثر. كل جهاز مفحوص ومجدد ويصلك إلى بابك بضمان 12 شهراً.",
                "Économisez jusqu'à 50 % sur iPhone, ordinateurs et plus. Chaque appareil est testé, remis à neuf et livré chez vous avec 12 mois de garantie.",
              )}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/collections/all" className="rounded-full bg-lime px-7 py-3.5 font-bold text-ink transition hover:brightness-95">
                {l("تسوق كل الأجهزة", "Voir tous les appareils")}
              </Link>
              <Link href="/info/how-it-works" className="rounded-full border-2 border-white/40 px-7 py-3.5 font-bold transition hover:bg-white hover:text-ink">
                {l("كيف نعمل", "Comment ça marche")}
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-semibold text-white/80">
              <span>✓ {l("ضمان 12 شهراً", "Garantie 12 mois")}</span>
              <span>✓ {l("توصيل لليوم التالي", "Livraison J+1")}</span>
              <span>✓ {l("إرجاع خلال 14 يوماً", "Retour sous 14 jours")}</span>
            </div>
          </div>
          <div className="relative mx-auto h-[340px] w-full max-w-lg md:h-[440px]">
            {/* devices float directly on the gradient — no white panel behind them */}
            <div
              className="floaty absolute start-2 top-4 w-[62%] drop-shadow-[0_26px_38px_rgba(9,3,20,0.5)]"
              style={{ ["--r" as string]: "-5deg" }}
            >
              <ProductImage src="/products/iphone-15-pro-max.webp" alt="iPhone 15 Pro Max" priority stage="none" className="w-full" />
            </div>
            <div
              className="floaty absolute bottom-0 end-0 w-[72%] drop-shadow-[0_26px_38px_rgba(9,3,20,0.5)]"
              style={{ ["--r" as string]: "3deg", animationDelay: "1.2s" }}
            >
              <ProductImage src="/products/macbook-air-m2.webp" alt="MacBook Air" stage="none" className="w-full" />
            </div>
            <div
              className="floaty absolute end-6 top-0 w-[34%] drop-shadow-[0_22px_30px_rgba(9,3,20,0.5)]"
              style={{ ["--r" as string]: "8deg", animationDelay: "2s" }}
            >
              <ProductImage src="/products/apple-watch-s9.webp" alt="Apple Watch" stage="none" className="w-full" />
            </div>
            <div className="absolute bottom-6 start-0 rounded-2xl bg-white px-4 py-3 text-ink shadow-xl">
              <p className="text-xs font-semibold text-muted">{l("ابتداءً من", "À partir de")}</p>
              <p className="text-xl font-extrabold">{m(toMru(799))}</p>
            </div>
          </div>
        </div>
      </section>

      {/* USP strip */}
      <section className="border-b border-line bg-soft">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-5 text-sm font-semibold md:grid-cols-4">
          <span>🚚 {l(`توصيل مجاني فوق ${m(FREE_SHIPPING_OVER)}`, `Livraison offerte dès ${m(FREE_SHIPPING_OVER)}`)}</span>
          <span>🔋 {l("بطارية 85%+", "Batterie 85 %+")}</span>
          <span>🛡️ {l("ضمان 12 شهراً", "Garantie 12 mois")}</span>
          <span>💬 {l("اطلب مباشرة عبر واتساب", "Commandez via WhatsApp")}</span>
        </div>
      </section>

      <Carousel title={l("مقترحة لك", "Recommandés pour vous")} subtitle={l("الأجهزة المجددة الأكثر حباً عند عملائنا", "Les appareils reconditionnés préférés de nos clients")} href="/collections/all">
        {featured.map((p) => (
          <Slide key={p.id}>
            <ProductCard p={p} />
          </Slide>
        ))}
      </Carousel>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <h2 className="mb-6 text-2xl font-extrabold tracking-tight md:text-3xl">{l("تسوق حسب الفئة", "Acheter par catégorie")}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/collections/${c.slug}`}
              className="group rounded-2xl border border-line bg-white p-3 text-center transition hover:-translate-y-1 hover:border-brand hover:shadow-lg"
            >
              <div className="overflow-hidden rounded-xl">
                <ProductImage src={CATEGORY_IMAGE[c.slug]} alt={tv("cat", c.slug)} className="aspect-[4/3] w-full transition duration-300 group-hover:scale-105" />
              </div>
              <p className="mt-3 text-sm font-bold">{tv("cat", c.slug)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Deals */}
      <section className="mx-auto mt-16 max-w-7xl px-4">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-soft to-[#cfc9f5] p-6 md:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_2fr]">
            <div>
              <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">{l("لفترة محدودة", "OFFRE LIMITÉE")}</span>
              <h2 className="mt-4 text-3xl font-extrabold leading-tight text-brand md:text-4xl">{l("عروض الذكرى السنوية", "Offres anniversaire")}</h2>
              <p className="mt-2 max-w-sm font-medium text-ink/80">{l("أكبر تخفيضات الموسم. عند نفادها لن تعود.", "Les plus grosses remises de la saison. Quand c'est parti, c'est parti.")}</p>
              <Link href="/collections/all?sort=discount" className="mt-5 inline-block rounded-full bg-brand px-6 py-3 font-bold text-white hover:bg-brand-dark">
                {l("تسوق العروض", "Voir les offres")}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {deals.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Carousel title={l("آيفون مجدد ومعتمد", "iPhone reconditionnés certifiés")} href="/collections/iphones">
        {iphones.map((p) => (
          <Slide key={p.id}>
            <ProductCard p={p} />
          </Slide>
        ))}
      </Carousel>
      <Carousel title={l("سامسونج مجدد ومعتمد", "Samsung reconditionnés certifiés")} href="/collections/samsung">
        {samsung.map((p) => (
          <Slide key={p.id}>
            <ProductCard p={p} />
          </Slide>
        ))}
      </Carousel>
      <Carousel title={l("حواسيب محمولة مجددة ومعتمدة", "Ordinateurs portables reconditionnés")} href="/collections/laptops">
        {laptops.map((p) => (
          <Slide key={p.id}>
            <ProductCard p={p} />
          </Slide>
        ))}
      </Carousel>

      {/* Pillars */}
      <section className="mx-auto mt-20 max-w-7xl px-4">
        <div className="rounded-3xl bg-ink p-8 text-white md:p-12">
          <h2 className="max-w-2xl text-3xl font-extrabold leading-tight md:text-4xl">
            {l("كل جهاز أصلي ومفحوص من الخبراء", "Chaque appareil est original et vérifié par des experts")}
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-lime text-2xl">{p.icon}</div>
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <h2 className="text-center text-2xl font-extrabold tracking-tight md:text-3xl">{l("من مستعمل إلى كالجديد في 3 خطوات", "De l'occasion au quasi-neuf en 3 étapes")}</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ["01", l("مصدر موثوق", "Une source fiable"), l("نشتري الأجهزة من شركاء معتمدين ومن عمليات استبدال موثقة — وليس من بائعين مجهولين.", "Nous achetons auprès de partenaires certifiés et de reprises vérifiées — jamais de vendeurs anonymes.")],
            ["02", l("فحص وتجديد", "Testé et remis à neuf"), l("60 فحصاً للبطارية والشاشة والكاميرات والحساسات والمنافذ. تُمسح البيانات ويُنظف الجهاز ويُصنف.", "60 contrôles : batterie, écran, caméras, capteurs et ports. Données effacées, nettoyage et classement.")],
            ["03", l("توصيل بعناية", "Livré avec soin"), l("تغليف واقٍ وشحن لليوم التالي مع ضمان 12 شهراً.", "Emballage protecteur et expédition le lendemain avec 12 mois de garantie.")],
          ].map(([n, t, d]) => (
            <div key={n} className="relative rounded-2xl border border-line p-7">
              <span className="text-5xl font-extrabold text-brand/15">{n}</span>
              <h3 className="mt-2 text-xl font-bold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            {l("عملاؤنا ", "Nos clients ")}
            <span className="text-brand">{l("يحبوننا", "nous adorent")}</span>
          </h2>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Stars rating={5} size={18} /> {l("4.8 متوسط التقييم", "4,8 de note moyenne")}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {REVIEWS.map((r) => (
            <figure key={r.d} className="flex flex-col rounded-2xl bg-soft p-6">
              <Stars rating={5} />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed">&ldquo;{r.t}&rdquo;</blockquote>
              <figcaption className="mt-4 text-sm font-bold">
                {r.n}{" "}
                <span className="block text-xs font-medium text-muted">
                  {l("اشترى", "A acheté")}: <bdi>{r.d}</bdi>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Delivery */}
      <section className="mx-auto max-w-7xl px-4 pt-20">
        <div className="grid gap-6 rounded-3xl bg-soft p-8 md:grid-cols-[1.2fr_2fr] md:p-12">
          <div>
            <h2 className="text-3xl font-extrabold leading-tight">{l("توصيل خلال 24 ساعة بعناية فائقة", "Livraison en 24 h avec le plus grand soin")}</h2>
            <p className="mt-2 text-sm font-semibold text-muted">{l("*اطلب قبل 3 مساءً للتوصيل في اليوم التالي داخل نواكشوط.", "*Commandez avant 15h pour une livraison le lendemain à Nouakchott.")}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              ["⚡", l("توصيل أسرع", "Plus rapide"), l("غداً عند بابك في نواكشوط ونواذيبو.", "Demain chez vous à Nouakchott et Nouadhibou.")],
              ["📦", l("عناية إضافية", "Soin extra"), l("كل علبة مغلفة بطبقتين ومؤمّنة حتى التسليم.", "Chaque colis est double emballé et assuré jusqu'à la livraison.")],
              ["😌", l("راحة بال", "Tranquillité"), l("لم يعجبك؟ أعده مجاناً خلال 14 يوماً.", "Pas convaincu ? Retournez-le gratuitement sous 14 jours.")],
            ].map(([i, t, d]) => (
              <div key={t}>
                <div className="text-3xl">{i}</div>
                <h3 className="mt-2 font-bold">{t}</h3>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pt-20">
        <h2 className="mb-6 text-center text-2xl font-extrabold tracking-tight md:text-3xl">{l("أسئلة شائعة", "Questions fréquentes")}</h2>
        {FAQ.map(([q, a]) => (
          <details key={q} className="group border-b border-line py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold">
              {q}
              <span className="text-xl text-brand transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted">{a}</p>
          </details>
        ))}
      </section>
    </>
  );
}
