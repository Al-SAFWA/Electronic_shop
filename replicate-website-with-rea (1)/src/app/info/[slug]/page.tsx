import Link from "next/link";
import { notFound } from "next/navigation";
import { getI18n } from "@/lib/lang";
import { FREE_SHIPPING_OVER, SHIPPING_FEE } from "@/lib/options";
import { waDisplayNumber } from "@/lib/whatsapp";

type Section = [string, string];
type Page = { title: string; intro: string; sections: Section[] };

export default async function Info({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { l, m } = await getI18n();

  const PAGES: Record<string, Page> = {
    "how-it-works": {
      title: l("كيف تعمل لوبت", "Comment fonctionne Loopt"),
      intro: l("نمنح التقنية الرائعة حياة ثانية — ونجعل شراءها سهلاً وآمناً كشراء الجديد.", "Nous offrons une seconde vie à la belle technologie — et rendons son achat aussi simple et sûr que du neuf."),
      sections: [
        [l("1. المصدر", "1. Sourcing"), l("نحصل على الأجهزة من عمليات استبدال موثقة وشركاء معتمدين. لا نشتري أبداً من بائعين مجهولين.", "Les appareils proviennent de reprises vérifiées et de partenaires certifiés. Jamais de vendeurs anonymes.")],
        [l("2. فحص من 60 نقطة", "2. Contrôle en 60 points"), l("يختبر الفنيون البطارية والشاشة والكاميرات والسماعات والحساسات والمنافذ والاتصال اللاسلكي. وكل ما دون المستوى يُصلح أو يُعاد تدويره.", "Nos techniciens testent batterie, écran, caméras, haut-parleurs, capteurs, ports et sans-fil. Tout ce qui ne passe pas est réparé ou recyclé.")],
        [l("3. التجديد والتصنيف", "3. Remise à neuf et classement"), l("تُمسح البيانات وفق المعايير الصناعية، وتُنظف القطع، ويُصنف الجهاز «ممتازة» أو «جيدة».", "Les données sont effacées selon les normes, les pièces nettoyées, et l'appareil classé « excellent » ou « bon ».")],
        [l("4. الطلب عبر واتساب", "4. Commande sur WhatsApp"), l("اضغط «اطلب عبر واتساب» وستصل تفاصيل طلبك مباشرة إلى صاحب المتجر لتأكيد الدفع والتوصيل.", "Appuyez sur « Commander sur WhatsApp » : votre commande arrive directement au propriétaire pour confirmer paiement et livraison.")],
      ],
    },
    warranty: {
      title: l("الضمان", "Garantie"),
      intro: l("كل جهاز مجدد يشمل ضمان لوبت لمدة 12 شهراً.", "Chaque appareil reconditionné inclut 12 mois de garantie Loopt."),
      sections: [
        [l("ما الذي يغطيه؟", "Ce qui est couvert"), l("الأعطال في العتاد، وتدهور البطارية دون 80%، ومشاكل البرمجيات غير الناتجة عن المستخدم.", "Les pannes matérielles, la batterie sous 80 % et les problèmes logiciels non causés par l'utilisateur.")],
        [l("حماية لوبت", "Loopt Shield"), l("مدد الضمان إلى سنتين وأضف تغطية الأضرار العرضية مثل كسر الشاشة والسوائل بمبلغ بسيط عند الطلب.", "Étendez à 2 ans et ajoutez la casse accidentelle (écran, liquide) pour un petit supplément à la commande.")],
        [l("كيف أقدم مطالبة؟", "Comment faire une demande"), l("راسلنا على واتساب مع رقم طلبك وسنرتب الاستلام والإصلاح أو الاستبدال مجاناً.", "Écrivez-nous sur WhatsApp avec votre numéro de commande : nous organisons gratuitement la récupération, la réparation ou l'échange.")],
      ],
    },
    returns: {
      title: l("الإرجاع والاسترداد", "Retours et remboursements"),
      intro: l("لم يعجبك؟ أعده خلال 14 يوماً.", "Pas convaincu ? Retournez-le sous 14 jours."),
      sections: [
        [l("إرجاع مجاني", "Retour gratuit"), l("نستلم الجهاز دون أي تكلفة بشرط أن يكون بالحالة نفسها التي وصلك بها.", "Nous récupérons l'appareil sans frais, à condition qu'il soit dans l'état où vous l'avez reçu.")],
        [l("الاسترداد", "Remboursement"), l("يُسدد المبلغ بنفس طريقة الدفع الأصلية خلال 5 أيام عمل من وصول الجهاز إلى مستودعنا.", "Le remboursement est effectué par le moyen de paiement d'origine sous 5 jours ouvrés après réception de l'appareil.")],
      ],
    },
    delivery: {
      title: l("التوصيل", "Livraison"),
      intro: l("سريع، متتبَّع ومؤمَّن.", "Rapide, suivie et assurée."),
      sections: [
        [l("توصيل لليوم التالي", "Livraison le lendemain"), l("اطلب قبل 3 مساءً ليصلك غداً في نواكشوط ونواذيبو. وتحتاج المدن الأخرى من 2 إلى 3 أيام عمل.", "Commandez avant 15h pour être livré demain à Nouakchott et Nouadhibou. Les autres villes : 2 à 3 jours ouvrés.")],
        [l("التكلفة", "Tarif"), l(`مجاني للطلبات فوق ${m(FREE_SHIPPING_OVER)}، وإلا فرسوم ثابتة ${m(SHIPPING_FEE)}.`, `Gratuite dès ${m(FREE_SHIPPING_OVER)}, sinon forfait de ${m(SHIPPING_FEE)}.`)],
        [l("العملة", "Devise"), l("جميع الأسعار بالأوقية الجديدة (MRU).", "Tous les prix sont en nouvelle ouguiya (MRU).")],
      ],
    },
    about: {
      title: l("من نحن", "À propos de Loopt"),
      intro: l("لوبت متجر تجريبي للأجهزة الإلكترونية المجددة والمعتمدة في موريتانيا.", "Loopt est une boutique de démonstration d'électronique reconditionnée certifiée en Mauritanie."),
      sections: [
        [l("مهمتنا", "Notre mission"), l("جعل التقنية المتميزة في متناول الجميع وتقليل النفايات الإلكترونية — جهازاً مجدداً في كل مرة.", "Rendre la technologie premium accessible et réduire les déchets électroniques — un appareil reconditionné à la fois.")],
        [l("مشروع مستقل", "Projet indépendant"), l("لوبت متجر مفاهيمي مستقل. أسماء العلامات التجارية ملك لأصحابها وتُستخدم فقط لوصف المنتجات المتوافقة.", "Loopt est une boutique conceptuelle indépendante. Les marques appartiennent à leurs propriétaires et ne servent qu'à décrire les produits compatibles.")],
      ],
    },
    contact: {
      title: l("المساعدة والتواصل", "Aide et contact"),
      intro: l("نحن بجانبك من السبت إلى الخميس، 9 صباحاً – 9 مساءً.", "Nous sommes là du samedi au jeudi, de 9h à 21h."),
      sections: [
        [l("واتساب", "WhatsApp"), waDisplayNumber()],
        [l("المقر", "Adresse"), l("نواكشوط، موريتانيا", "Nouakchott, Mauritanie")],
      ],
    },
  };

  const page = PAGES[slug];
  if (!page) notFound();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <Link href="/" className="text-sm font-semibold text-brand">{l("→ العودة للرئيسية", "← Retour à l'accueil")}</Link>
      <h1 className="mt-4 text-4xl font-extrabold tracking-tight">{page.title}</h1>
      <p className="mt-3 text-lg text-muted">{page.intro}</p>
      <div className="mt-10 space-y-6">
        {page.sections.map(([h, t]) => (
          <section key={h} className="rounded-2xl bg-soft p-6">
            <h2 className="font-bold">{h}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted" dir="auto">{t}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
