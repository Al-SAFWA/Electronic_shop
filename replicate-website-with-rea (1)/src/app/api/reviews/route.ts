import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { getI18n } from "@/lib/lang";

export async function POST(req: Request) {
  const { l } = await getI18n();
  const b = await req.json().catch(() => ({}));
  const productId = Number(b.productId);
  const rating = Number(b.rating);
  const author = String(b.author ?? "").trim().slice(0, 60);
  const body = String(b.body ?? "").trim().slice(0, 800);
  if (!Number.isInteger(productId) || !Number.isInteger(rating) || rating < 1 || rating > 5 || !author || body.length < 5) {
    return NextResponse.json({ error: l("يرجى إكمال جميع الحقول.", "Veuillez remplir tous les champs.") }, { status: 400 });
  }
  const [p] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId));
  if (!p) return NextResponse.json({ error: l("المنتج غير موجود.", "Produit introuvable.") }, { status: 404 });
  await db.insert(reviews).values({ productId, author, rating, body });
  // refresh aggregate rating from real reviews blended with the existing count
  await db
    .update(products)
    .set({
      reviewCount: sql`${products.reviewCount} + 1`,
      rating: sql`round(((${products.rating} * ${products.reviewCount}) + ${rating})::numeric / (${products.reviewCount} + 1), 1)`,
    })
    .where(eq(products.id, productId));
  return NextResponse.json({ ok: true });
}
