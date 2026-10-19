import type { I18n } from "./i18n";

// Store owner's WhatsApp number, international format without "+" (Mauritania = 222).
// Set NEXT_PUBLIC_WHATSAPP_NUMBER in .env (or your hosting dashboard).
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "22200000000").replace(/\D/g, "");

export function waLink(text: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

export function waDisplayNumber() {
  return `+${WHATSAPP_NUMBER}`;
}

export type WaLine = {
  name: string;
  subtitle: string;
  battery: string;
  plan: string;
  qty: number;
  unitPrice: number;
  url?: string;
};

export function buildOrderMessage(
  i: I18n,
  o: {
    lines: WaLine[];
    total: number;
    subtotal?: number;
    shipping?: number;
    ref?: string;
    customer?: { name: string; phone: string; city: string; address: string; payment: string };
  },
) {
  const { l, m, tv } = i;
  const out: string[] = [l("مرحباً 👋 أرغب في تقديم طلب:", "Bonjour 👋 je souhaite passer commande :")];
  if (o.ref) out.push(`${l("رقم الطلب", "Réf. commande")}: ${o.ref}`);
  out.push("");
  for (const x of o.lines) {
    const opts = [
      x.battery === "new" ? l("بطارية جديدة", "batterie neuve") : "",
      x.plan === "shield" ? l("حماية لوبت", "Loopt Shield") : "",
    ].filter(Boolean);
    out.push(
      `• ${x.qty} × ${x.name}${x.subtitle ? ` (${x.subtitle})` : ""}${opts.length ? ` + ${opts.join(" + ")}` : ""} — ${m(x.unitPrice * x.qty)}`,
    );
    if (x.url) out.push(`  ${x.url}`);
  }
  out.push("");
  if (o.subtotal !== undefined && o.shipping !== undefined) {
    out.push(`${l("المجموع الفرعي", "Sous-total")}: ${m(o.subtotal)}`);
    out.push(`${l("التوصيل", "Livraison")}: ${o.shipping ? m(o.shipping) : l("مجاني", "Gratuite")}`);
  }
  out.push(`*${l("الإجمالي", "Total")}: ${m(o.total)}*`);
  if (o.customer) {
    const c = o.customer;
    out.push("");
    out.push(`${l("الاسم", "Nom")}: ${c.name}`);
    out.push(`${l("الهاتف", "Téléphone")}: ${c.phone}`);
    out.push(`${l("المدينة", "Ville")}: ${tv("city", c.city)}`);
    out.push(`${l("العنوان", "Adresse")}: ${c.address}`);
    out.push(`${l("الدفع", "Paiement")}: ${tv("pay", c.payment)}`);
  }
  return out.join("\n");
}
