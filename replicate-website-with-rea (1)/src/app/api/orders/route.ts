import { NextResponse } from "next/server";
import { inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, products } from "@/db/schema";
import { getI18n } from "@/lib/lang";
import { FREE_SHIPPING_OVER, SHIPPING_FEE, optionPrice, type BatteryId, type PlanId } from "@/lib/options";

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const PAYMENTS = ["cod", "bankily", "masrvi"];

export async function POST(req: Request) {
  const { l } = await getI18n();
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: l("طلب غير صالح", "Requête invalide") }, { status: 400 });

  const customerName = str(b.name, 100);
  const email = str(b.email, 200).toLowerCase();
  const phone = str(b.phone, 30);
  const city = str(b.city, 60);
  const address = str(b.address, 300);
  const paymentMethod = PAYMENTS.includes(b.payment) ? b.payment : "cod";

  if (
    !customerName ||
    (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) ||
    phone.replace(/\D/g, "").length < 8 ||
    !city ||
    address.length < 3
  ) {
    return NextResponse.json({ error: l("يرجى إكمال بيانات التوصيل بشكل صحيح.", "Veuillez compléter correctement vos informations de livraison.") }, { status: 400 });
  }
  const rawItems = Array.isArray(b.items) ? b.items.slice(0, 20) : [];
  if (rawItems.length === 0) return NextResponse.json({ error: l("سلتك فارغة.", "Votre panier est vide.") }, { status: 400 });

  const ids = rawItems.map((i: { productId: number }) => Number(i.productId)).filter(Number.isInteger);
  const rows = ids.length ? await db.select().from(products).where(inArray(products.id, ids)) : [];
  const byId = new Map(rows.map((p) => [p.id, p]));

  const lines: {
    productId: number;
    name: string;
    subtitle: string;
    battery: BatteryId;
    plan: PlanId;
    qty: number;
    unitPrice: number;
  }[] = [];
  for (const i of rawItems) {
    const p = byId.get(Number(i.productId));
    const qty = Math.max(1, Math.min(5, Math.floor(Number(i.qty) || 1)));
    if (!p) return NextResponse.json({ error: l("أحد المنتجات في سلتك لم يعد متوفراً.", "Un produit de votre panier n'est plus disponible.") }, { status: 400 });
    if (p.stock < qty)
      return NextResponse.json({ error: l(`${p.name}: المتوفر ${p.stock} فقط.`, `${p.name} : il n'en reste que ${p.stock}.`) }, { status: 400 });
    const isNew = p.grade === "New";
    const battery: BatteryId = i.battery === "new" && !isNew && p.batteryHealth !== null ? "new" : "standard";
    const plan: PlanId = i.plan === "shield" && !isNew ? "shield" : "none";
    // Prices are always recomputed on the server from the database.
    const unitPrice = optionPrice(p.price, battery, plan, !isNew && p.batteryHealth !== null);
    lines.push({ productId: p.id, name: p.name, subtitle: [p.storage, p.colorName].filter(Boolean).join(" · "), battery, plan, qty, unitPrice });
  }

  const subtotal = lines.reduce((s, x) => s + x.unitPrice * x.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const reference = "LPT-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

  await db.transaction(async (tx) => {
    for (const x of lines) {
      await tx
        .update(products)
        .set({ stock: sql`greatest(${products.stock} - ${x.qty}, 0)` })
        .where(sql`${products.id} = ${x.productId}`);
    }
    await tx.insert(orders).values({
      reference,
      customerName,
      email,
      phone,
      city,
      address,
      paymentMethod,
      items: lines,
      subtotal,
      shipping,
      total,
    });
  });

  return NextResponse.json({ reference, subtotal, shipping, total });
}
