import Link from "next/link";
import Logo from "./Logo";
import Newsletter from "./Newsletter";
import { WhatsAppIcon } from "./WhatsAppButton";
import { CATEGORIES } from "@/lib/options";
import { getI18n } from "@/lib/lang";
import { waDisplayNumber, waLink } from "@/lib/whatsapp";

export default async function Footer() {
  const { l, tv } = await getI18n();
  return (
    <footer className="mt-20 bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand p-8 md:flex-row md:items-center">
          <div>
            <h3 className="text-2xl font-extrabold">{l("كن أول من يعرف بالجديد", "Soyez les premiers informés")}</h3>
            <p className="mt-1 text-white/80">{l("عروض أسبوعية على الأجهزة المجددة. بلا إزعاج، ويمكنك إلغاء الاشتراك في أي وقت.", "Offres hebdomadaires sur les appareils reconditionnés. Pas de spam, désabonnement à tout moment.")}</p>
          </div>
          <Newsletter />
        </div>

        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              {l("لوبت تمنح التقنية الرائعة حياة ثانية. كل جهاز مفحوص ومجدد ومغطى بضمان 12 شهراً.", "Loopt offre une seconde vie à la belle technologie. Chaque appareil est contrôlé, remis à neuf et garanti 12 mois.")}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-white/80">
              {[l("الدفع عند الاستلام", "Paiement à la livraison"), "Bankily", "Masrvi", "WhatsApp"].map((p) => (
                <span key={p} className="rounded-md border border-white/20 px-2 py-1">
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-bold">{l("تسوق", "Boutique")}</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link className="hover:text-lime" href={`/collections/${c.slug}`}>
                    {tv("cat", c.slug)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold">{l("معلومات", "Informations")}</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link className="hover:text-lime" href="/info/how-it-works">{l("كيف تعمل لوبت", "Comment ça marche")}</Link></li>
              <li><Link className="hover:text-lime" href="/info/warranty">{l("الضمان", "Garantie")}</Link></li>
              <li><Link className="hover:text-lime" href="/info/returns">{l("الإرجاع والاسترداد", "Retours et remboursements")}</Link></li>
              <li><Link className="hover:text-lime" href="/info/delivery">{l("التوصيل", "Livraison")}</Link></li>
              <li><Link className="hover:text-lime" href="/info/about">{l("من نحن", "À propos")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold">{l("تواصل معنا", "Contact")}</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li>📍 {l("نواكشوط، موريتانيا", "Nouakchott, Mauritanie")}</li>
              <li>🕘 {l("السبت – الخميس، 9 ص – 9 م", "Samedi – jeudi, 9h – 21h")}</li>
              <li>
                <a href={waLink(l("مرحباً، لدي سؤال.", "Bonjour, j'ai une question."))} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 rounded-full bg-wa px-4 py-2 font-bold text-white hover:brightness-95">
                  <WhatsAppIcon size={18} />
                  <span dir="ltr">{waDisplayNumber()}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/50">
          © {new Date().getFullYear()} Loopt. {l("متجر تجريبي مستقل — جميع أسماء المنتجات والعلامات التجارية ملك لأصحابها. الأسعار بالأوقية الجديدة (MRU).", "Boutique indépendante de démonstration — les noms de produits et marques appartiennent à leurs propriétaires. Prix en nouvelle ouguiya (MRU).")}
        </div>
      </div>
    </footer>
  );
}
