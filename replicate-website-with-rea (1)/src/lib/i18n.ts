// Shared (server + client) i18n helpers. Arabic is the default language, French is the alternative.
export type Lang = "ar" | "fr";
export const DEFAULT_LANG: Lang = "ar";
export const LANG_COOKIE = "lang";

export function normLang(v?: string | null): Lang {
  return v === "fr" ? "fr" : "ar";
}

type Pair = [string, string]; // [arabic, french]

const GROUPS = {
  color: {
    "Natural Titanium": ["تيتانيوم طبيعي", "Titane naturel"],
    Blue: ["أزرق", "Bleu"],
    "Deep Purple": ["بنفسجي داكن", "Violet intense"],
    Midnight: ["منتصف الليل", "Minuit"],
    "Pacific Blue": ["أزرق باسيفيك", "Bleu Pacifique"],
    Green: ["أخضر", "Vert"],
    Black: ["أسود", "Noir"],
    "Titanium Gray": ["رمادي تيتانيوم", "Gris titane"],
    "Phantom Black": ["أسود فانتوم", "Noir Phantom"],
    Mint: ["أخضر نعناعي", "Menthe"],
    Lavender: ["لافندر", "Lavande"],
    "Awesome Lime": ["أخضر ليموني", "Citron vert"],
    "Space Gray": ["رمادي فلكي", "Gris sidéral"],
    Silver: ["فضي", "Argent"],
    Platinum: ["بلاتيني", "Platine"],
    Starlight: ["ضوء النجوم", "Lumière stellaire"],
    Graphite: ["جرافيت", "Graphite"],
    White: ["أبيض", "Blanc"],
    Teal: ["أخضر مزرق", "Turquoise"],
    Clear: ["شفاف", "Transparent"],
  },
  badge: {
    "Best seller": ["الأكثر مبيعاً", "Meilleure vente"],
    Popular: ["رائج", "Populaire"],
    "Great value": ["قيمة ممتازة", "Super prix"],
    Flagship: ["الفئة الرائدة", "Haut de gamme"],
    Foldable: ["قابل للطي", "Pliable"],
  },
  grade: {
    Excellent: ["ممتازة", "excellent"],
    Good: ["جيدة", "bon"],
    New: ["جديد", "neuf"],
  },
  cat: {
    all: ["الكل", "Tout"],
    iphones: ["آيفون", "iPhone"],
    samsung: ["سامسونج", "Samsung"],
    laptops: ["حواسيب محمولة", "Ordinateurs portables"],
    tablets: ["أجهزة لوحية", "Tablettes"],
    watches: ["ساعات ذكية", "Montres connectées"],
    audio: ["صوتيات", "Audio"],
    accessories: ["إكسسوارات", "Accessoires"],
  },
  city: {
    Nouakchott: ["نواكشوط", "Nouakchott"],
    Nouadhibou: ["نواذيبو", "Nouadhibou"],
    Rosso: ["روصو", "Rosso"],
    Kiffa: ["كيفة", "Kiffa"],
    Atar: ["أطار", "Atar"],
    Zouerat: ["ازويرات", "Zouérat"],
    Kaedi: ["كيهيدي", "Kaédi"],
    Aleg: ["ألاك", "Aleg"],
    Nema: ["النعمة", "Néma"],
    Other: ["مدينة أخرى", "Autre ville"],
  },
  pay: {
    cod: ["الدفع عند الاستلام", "Paiement à la livraison"],
    bankily: ["بانكيلي", "Bankily"],
    masrvi: ["مصرفي", "Masrvi"],
  },
} satisfies Record<string, Record<string, Pair>>;

export type Group = keyof typeof GROUPS;

export const CITY_KEYS = Object.keys(GROUPS.city);

export function makeI18n(lang: Lang) {
  const idx = lang === "ar" ? 0 : 1;
  /** inline bilingual text: l("عربي", "français") */
  const l = (ar: string, fr: string) => (lang === "ar" ? ar : fr);
  /** translate a known value (colour, badge, category, ...) */
  const tv = (group: Group, value: string) => {
    const g = GROUPS[group] as Record<string, Pair>;
    return g[value]?.[idx] ?? value;
  };
  /** money in new Mauritanian ouguiya (MRU) */
  const m = (n: number) => `${n.toLocaleString("en-US")} MRU`;
  return { lang, dir: (lang === "ar" ? "rtl" : "ltr") as "rtl" | "ltr", l, tv, m };
}

export type I18n = ReturnType<typeof makeI18n>;
