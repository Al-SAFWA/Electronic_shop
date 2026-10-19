"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { useI18n } from "./I18nProvider";
import WhatsAppButton from "./WhatsAppButton";
import { BATTERY_OPTIONS, optionPrice, shieldPrice, type BatteryId, type PlanId } from "@/lib/options";
import { buildOrderMessage } from "@/lib/whatsapp";

type P = {
  id: number;
  slug: string;
  name: string;
  image: string;
  storage: string | null;
  colorName: string; // already translated for display
  price: number;
  compareAtPrice: number | null;
  stock: number;
  supportsBattery: boolean;
  isNew: boolean;
};

export default function BuyBox({ p }: { p: P }) {
  const i18n = useI18n();
  const { l, m } = i18n;
  const { add } = useCart();
  const [battery, setBattery] = useState<BatteryId>("standard");
  const [plan, setPlan] = useState<PlanId>("none");
  const [qty, setQty] = useState(1);
  const unit = optionPrice(p.price, battery, plan, p.supportsBattery);
  const subtitle = [p.storage, p.colorName].filter(Boolean).join(" · ");
  const batteryUsed = p.supportsBattery ? battery : "standard";
  const planUsed = p.isNew ? "none" : plan;

  const batteryText: Record<BatteryId, { label: string; note: string }> = {
    standard: { label: l("عادية", "Standard"), note: l("صحة البطارية 85% على الأقل", "Santé batterie 85 % minimum") },
    new: { label: l("بطارية جديدة", "Batterie neuve"), note: l("صحة البطارية 100%", "Santé batterie 100 %") },
  };
  const planText: Record<PlanId, { label: string; note: string }> = {
    none: { label: l("بدون حماية إضافية", "Sans protection"), note: l("ضمان لوبت 12 شهراً مشمول", "Garantie Loopt 12 mois incluse") },
    shield: { label: l("حماية لوبت · سنتان", "Loopt Shield · 2 ans"), note: l("تغطية الأضرار العرضية + ضمان ممتد", "Casse accidentelle + garantie étendue") },
  };

  const message = () =>
    buildOrderMessage(i18n, {
      lines: [
        {
          name: p.name,
          subtitle,
          battery: batteryUsed,
          plan: planUsed,
          qty,
          unitPrice: unit,
          url: `${window.location.origin}/products/${p.slug}`,
        },
      ],
      total: unit * qty,
    });

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-3xl font-extrabold">{m(unit)}</span>
        {p.compareAtPrice && <span className="text-lg text-muted line-through">{m(p.compareAtPrice + (unit - p.price))}</span>}
        {p.compareAtPrice && (
          <span className="rounded-full bg-lime px-2.5 py-1 text-xs font-bold">
            {l("وفّر", "Économisez")} {m(p.compareAtPrice - p.price)}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-muted">
        {l("السعر نهائي شامل الضريبة · الدفع عند الاستلام متاح", "Prix final TTC · paiement à la livraison possible")}
      </p>

      {p.supportsBattery && (
        <fieldset className="mt-6">
          <legend className="mb-2 text-sm font-extrabold uppercase tracking-wider">{l("البطارية", "Batterie")}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {BATTERY_OPTIONS.map((o) => (
              <label
                key={o.id}
                className={`cursor-pointer rounded-xl border-2 p-4 transition ${battery === o.id ? "border-brand bg-soft" : "border-line hover:border-ink/30"}`}
              >
                <input type="radio" name="battery" className="sr-only" checked={battery === o.id} onChange={() => setBattery(o.id)} />
                <span className="flex justify-between gap-2 text-sm font-bold">
                  {batteryText[o.id].label}
                  <span className="text-brand">{o.delta ? `+${m(o.delta)}` : l("مشمولة", "Incluse")}</span>
                </span>
                <span className="mt-0.5 block text-xs text-muted">🔋 {batteryText[o.id].note}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {!p.isNew && (
        <fieldset className="mt-6">
          <legend className="mb-2 text-sm font-extrabold uppercase tracking-wider">{l("الحماية", "Protection")}</legend>
          <div className="space-y-3">
            {(["none", "shield"] as PlanId[]).map((id) => (
              <label
                key={id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${plan === id ? "border-brand bg-soft" : "border-line hover:border-ink/30"}`}
              >
                <input type="radio" name="plan" checked={plan === id} onChange={() => setPlan(id)} className="mt-1 accent-brand" />
                <span className="flex-1">
                  <span className="flex justify-between gap-2 text-sm font-bold">
                    {planText[id].label}
                    <span className="text-brand">{id === "shield" ? `+${m(shieldPrice(p.price))}` : l("مجاناً", "Gratuit")}</span>
                  </span>
                  <span className="block text-xs text-muted">{planText[id].note}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 flex items-center gap-3">
        <div className="flex items-center rounded-full border-2 border-line" dir="ltr">
          <button className="h-12 w-11 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="−">−</button>
          <span className="w-8 text-center font-bold">{qty}</span>
          <button className="h-12 w-11 text-lg" onClick={() => setQty((q) => Math.min(Math.min(5, p.stock), q + 1))} aria-label="+">+</button>
        </div>
        <button
          disabled={p.stock <= 0}
          className="btn-primary flex-1 py-3.5 text-base"
          onClick={() =>
            add({
              productId: p.id,
              slug: p.slug,
              name: p.name,
              image: p.image,
              subtitle,
              unitPrice: unit,
              qty,
              battery: batteryUsed,
              plan: planUsed,
            })
          }
        >
          {p.stock > 0 ? l("أضف إلى السلة", "Ajouter au panier") : l("نفدت الكمية", "Épuisé")}
        </button>
      </div>

      <WhatsAppButton
        message={message}
        disabled={p.stock <= 0}
        label={l("اطلب الآن عبر واتساب", "Commander maintenant sur WhatsApp")}
        className="btn-wa mt-3 w-full py-3.5 text-base"
      />

      <p className={`mt-3 text-sm font-semibold ${p.stock <= 3 ? "text-orange-600" : "text-brand"}`}>
        {p.stock <= 0
          ? l("غير متوفر حالياً", "Rupture de stock")
          : p.stock <= 3
            ? l(`بقي ${p.stock} فقط — اطلب بسرعة`, `Plus que ${p.stock} — dépêchez-vous`)
            : l("● متوفر · يُشحن غداً إذا طُلب قبل 3 مساءً", "● En stock · expédié demain si commandé avant 15h")}
      </p>
      <p className="mt-2 text-xs text-muted">
        {l("تحتاج مساعدة في الاختيار؟", "Besoin d'aide pour choisir ?")}{" "}
        <Link href="/info/contact" className="font-bold text-brand underline">{l("تحدث إلينا", "Parlez-nous")}</Link>
      </p>
    </div>
  );
}
