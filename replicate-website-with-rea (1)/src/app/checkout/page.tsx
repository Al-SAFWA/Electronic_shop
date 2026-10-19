"use client";

import Link from "next/link";
import { useState } from "react";
import { CART_STORAGE, useCart } from "@/components/CartProvider";
import ProductImage from "@/components/ProductImage";
import { useI18n } from "@/components/I18nProvider";
import { WhatsAppIcon } from "@/components/WhatsAppButton";
import { CITY_KEYS } from "@/lib/i18n";
import { buildOrderMessage, waLink } from "@/lib/whatsapp";

const PAYMENTS = ["cod", "bankily", "masrvi"];

export default function Checkout() {
  const i18n = useI18n();
  const { l, tv, m } = i18n;
  const { items, subtotal, shipping, total, clear } = useCart();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [payment, setPayment] = useState("cod");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const f = new FormData(e.currentTarget);
    const customer = {
      name: String(f.get("name") ?? ""),
      phone: String(f.get("phone") ?? ""),
      city: String(f.get("city") ?? ""),
      address: String(f.get("address") ?? ""),
      payment,
    };
    const r = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...customer,
        email: f.get("email"),
        items: items.map((i) => ({ productId: i.productId, qty: i.qty, battery: i.battery, plan: i.plan })),
      }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) {
      setBusy(false);
      setErr(d.error ?? l("حدث خطأ. حاول مرة أخرى.", "Une erreur est survenue. Réessayez."));
      return;
    }
    // Order saved in the database -> send it to the store owner on WhatsApp.
    const text = buildOrderMessage(i18n, {
      ref: d.reference,
      lines: items.map((i) => ({
        name: i.name,
        subtitle: i.subtitle,
        battery: i.battery,
        plan: i.plan,
        qty: i.qty,
        unitPrice: i.unitPrice,
      })),
      subtotal: d.subtotal ?? subtotal,
      shipping: d.shipping ?? shipping,
      total: d.total ?? total,
      customer,
    });
    localStorage.setItem(CART_STORAGE, "[]");
    clear();
    window.location.href = waLink(text);
  }

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="text-5xl">🛍️</div>
        <h1 className="mt-4 text-2xl font-extrabold">{l("سلتك فارغة", "Votre panier est vide")}</h1>
        <Link href="/collections/all" className="btn-primary mt-6 inline-block">{l("تصفح الأجهزة", "Voir les appareils")}</Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-extrabold tracking-tight">{l("إتمام الطلب", "Finaliser la commande")}</h1>
      <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-extrabold">{l("1. بيانات الاتصال", "1. Vos coordonnées")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="name" required placeholder={l("الاسم الكامل", "Nom complet")} className="input sm:col-span-2" autoComplete="name" />
              <input name="phone" type="tel" required dir="ltr" placeholder={l("رقم الهاتف / واتساب", "Téléphone / WhatsApp")} className="input text-start" autoComplete="tel" />
              <input name="email" type="email" dir="ltr" placeholder={l("البريد الإلكتروني (اختياري)", "E-mail (facultatif)")} className="input text-start" autoComplete="email" />
            </div>
          </section>
          <section>
            <h2 className="mb-4 text-lg font-extrabold">{l("2. التوصيل", "2. Livraison")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <select name="city" required defaultValue="" className="input">
                <option value="" disabled>{l("المدينة", "Ville")}</option>
                {CITY_KEYS.map((c) => <option key={c} value={c}>{tv("city", c)}</option>)}
              </select>
              <input name="address" required placeholder={l("الحي، الشارع، معلم قريب", "Quartier, rue, repère")} className="input" autoComplete="street-address" />
            </div>
            <p className="mt-3 rounded-xl bg-soft p-3 text-sm font-semibold">⚡ {l("اطلب قبل 3 مساءً للتوصيل غداً في نواكشوط.", "Commandez avant 15h pour une livraison demain à Nouakchott.")}</p>
          </section>
          <section>
            <h2 className="mb-4 text-lg font-extrabold">{l("3. الدفع", "3. Paiement")}</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {PAYMENTS.map((v) => (
                <label key={v} className={`cursor-pointer rounded-xl border-2 p-4 ${payment === v ? "border-brand bg-soft" : "border-line"}`}>
                  <input type="radio" className="sr-only" checked={payment === v} onChange={() => setPayment(v)} />
                  <span className="block text-sm font-bold">{tv("pay", v)}</span>
                  <span className="text-xs text-muted">{v === "cod" ? l("ادفع عند وصول الطلب", "Payez à la réception") : l("تحويل عبر الهاتف", "Transfert mobile")}</span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-sm text-muted">{l("لا يتم خصم أي مبلغ الآن. سنؤكد الدفع والتوصيل معك عبر واتساب.", "Aucun montant n'est prélevé maintenant. Paiement et livraison sont confirmés avec vous sur WhatsApp.")}</p>
          </section>
        </div>

        <aside className="h-fit rounded-3xl border border-line bg-soft p-6 lg:sticky lg:top-28">
          <h2 className="mb-4 text-lg font-extrabold">{l("ملخص الطلب", "Récapitulatif")}</h2>
          <ul className="divide-y divide-line/80">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3 py-3">
                <div className="relative grid h-16 w-16 shrink-0 place-items-center p-1">
                  <ProductImage src={i.image} alt={i.name} stage="mini" className="h-full w-full" />
                  <span className="absolute -end-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-brand text-[11px] font-bold text-white">{i.qty}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold" dir="auto">{i.name}</p>
                  <p className="text-xs text-muted">{i.subtitle}</p>
                  <p className="text-xs text-muted">{i.battery === "new" ? l("بطارية جديدة", "Batterie neuve") : l("بطارية عادية", "Batterie standard")}{i.plan === "shield" ? ` · ${l("حماية لوبت", "Loopt Shield")}` : ""}</p>
                </div>
                <span className="text-sm font-bold">{m(i.unitPrice * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt>{l("المجموع الفرعي", "Sous-total")}</dt><dd className="font-semibold">{m(subtotal)}</dd></div>
            <div className="flex justify-between"><dt>{l("التوصيل", "Livraison")}</dt><dd className="font-semibold">{shipping ? m(shipping) : l("مجاني", "Gratuite")}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-extrabold"><dt>{l("الإجمالي", "Total")}</dt><dd>{m(total)}</dd></div>
          </dl>
          {err && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{err}</p>}
          <button disabled={busy} className="btn-wa mt-5 w-full py-4 text-base">
            <WhatsAppIcon />
            {busy ? l("جارٍ إرسال الطلب…", "Envoi de la commande…") : l(`أكّد الطلب عبر واتساب · ${m(total)}`, `Valider sur WhatsApp · ${m(total)}`)}
          </button>
          <p className="mt-3 text-center text-xs text-muted">{l("ضمان 12 شهراً · إرجاع مجاني خلال 14 يوماً", "Garantie 12 mois · retour gratuit sous 14 jours")}</p>
        </aside>
      </form>
    </div>
  );
}
