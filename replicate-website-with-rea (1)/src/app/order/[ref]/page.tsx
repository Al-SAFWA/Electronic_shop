import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { getI18n } from "@/lib/lang";
import { buildOrderMessage, waLink, type WaLine } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const [o] = await db.select().from(orders).where(eq(orders.reference, ref)).limit(1);
  if (!o) notFound();
  const i18n = await getI18n();
  const { l, tv, m } = i18n;
  const lines = o.items as WaLine[];
  const text = buildOrderMessage(i18n, {
    ref: o.reference,
    lines,
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    customer: { name: o.customerName, phone: o.phone, city: o.city, address: o.address, payment: o.paymentMethod },
  });
  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <div className="text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime text-4xl text-brand">✓</div>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight">{l(`شكراً ${o.customerName.split(" ")[0]}!`, `Merci ${o.customerName.split(" ")[0]} !`)}</h1>
        <p className="mt-2 text-muted">
          {l("تم تسجيل طلبك رقم", "Votre commande")} <b className="text-ink" dir="ltr">{o.reference}</b> {l("بنجاح.", "est enregistrée.")}
        </p>
        <a href={waLink(text)} target="_blank" rel="noopener noreferrer" className="btn-wa mt-5">
          <WhatsAppIcon />
          {l("أرسل الطلب عبر واتساب", "Envoyer la commande sur WhatsApp")}
        </a>
      </div>
      <div className="mt-8 rounded-3xl border border-line p-6">
        <ul className="divide-y divide-line">
          {lines.map((x, i) => (
            <li key={i} className="flex justify-between gap-4 py-3 text-sm">
              <div>
                <p className="font-bold" dir="auto">{x.qty} × {x.name}</p>
                <p className="text-xs text-muted">
                  {x.subtitle} · {x.battery === "new" ? l("بطارية جديدة", "Batterie neuve") : l("بطارية عادية", "Batterie standard")}
                  {x.plan === "shield" ? ` · ${l("حماية لوبت", "Loopt Shield")}` : ""}
                </p>
              </div>
              <span className="font-bold">{m(x.unitPrice * x.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
          <div className="flex justify-between"><dt>{l("المجموع الفرعي", "Sous-total")}</dt><dd>{m(o.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>{l("التوصيل", "Livraison")}</dt><dd>{o.shipping ? m(o.shipping) : l("مجاني", "Gratuite")}</dd></div>
          <div className="flex justify-between text-lg font-extrabold"><dt>{l("الإجمالي", "Total")}</dt><dd>{m(o.total)}</dd></div>
        </dl>
        <div className="mt-5 rounded-2xl bg-soft p-4 text-sm">
          <p className="font-bold">{l("التوصيل إلى", "Livraison à")}</p>
          <p className="text-muted">{o.address}، {tv("city", o.city)}</p>
          <p className="mt-2 font-bold">{l("طريقة الدفع", "Paiement")}</p>
          <p className="text-muted">{tv("pay", o.paymentMethod)}</p>
        </div>
      </div>
      <div className="mt-8 text-center">
        <Link href="/collections/all" className="btn-primary inline-block">{l("متابعة التسوق", "Continuer mes achats")}</Link>
      </div>
    </div>
  );
}
