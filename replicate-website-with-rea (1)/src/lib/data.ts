import { and, asc, count, desc, eq, gte, ilike, inArray, lte, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews, type Product } from "@/db/schema";
import { REVIEW_SEED, SEED, slugify } from "@/db/seed-data";
import { toMru } from "@/lib/options";
import { imageFor } from "@/lib/product-images";

let seeding: Promise<void> | null = null;

export function ensureSeed() {
  if (!seeding) {
    seeding = (async () => {
      const [{ n }] = await db.select({ n: count() }).from(products);
      if (n > 0) return;
      const inserted = await db
        .insert(products)
        .values(
          SEED.map((s) => ({
            slug: slugify(`${s.name}-${s.storage ?? ""}-${s.colorName}`),
            name: s.name,
            brand: s.brand,
            category: s.category,
            kind: s.kind,
            price: toMru(s.price),
            compareAtPrice: s.compare ? toMru(s.compare) : null,
            storage: s.storage ?? null,
            colorName: s.colorName,
            color: s.color,
            grade: s.grade ?? "Excellent",
            batteryHealth: s.battery ?? null,
            rating: s.rating ?? 4.7,
            reviewCount: s.reviews ?? 0,
            badge: s.badge ?? null,
            featured: s.featured ?? false,
            stock: s.stock ?? 8,
            image: imageFor(s.name),
            description: describe(s.name, s.category, s.grade ?? "Excellent"),
          })),
        )
        .onConflictDoNothing()
        .returning({ id: products.id });
      const rows = inserted.flatMap((p, i) =>
        REVIEW_SEED.slice(0, 3 + (i % 3)).map((r) => ({ ...r, productId: p.id })),
      );
      if (rows.length) await db.insert(reviews).values(rows);
    })().catch((e) => {
      seeding = null;
      throw e;
    });
  }
  return seeding;
}

function describe(name: string, category: string, grade: string) {
  if (grade === "New")
    return `${name} — a brand-new accessory, tested and ready to ship from our Riyadh warehouse.`;
  const noun =
    category === "laptops" ? "laptop" : category === "audio" ? "audio device" : "device";
  return `This ${name} is a certified renewed ${noun}. Every unit goes through a 60-point inspection, a full data wipe, battery health verification and is cleaned and repackaged. Comes with a 12-month Loopt warranty, free delivery and a 14-day no-questions return window.`;
}

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "discount";

export async function listProducts(opts: {
  category?: string;
  q?: string;
  brands?: string[];
  min?: number;
  max?: number;
  sort?: SortKey;
  limit?: number;
}): Promise<Product[]> {
  await ensureSeed();
  const conds = [];
  if (opts.category && opts.category !== "all") conds.push(eq(products.category, opts.category));
  if (opts.q) {
    const like = `%${opts.q}%`;
    conds.push(or(ilike(products.name, like), ilike(products.brand, like), ilike(products.category, like)));
  }
  if (opts.brands?.length) conds.push(inArray(products.brand, opts.brands));
  if (opts.min !== undefined) conds.push(gte(products.price, opts.min));
  if (opts.max !== undefined) conds.push(lte(products.price, opts.max));
  const order =
    opts.sort === "price-asc"
      ? [asc(products.price)]
      : opts.sort === "price-desc"
        ? [desc(products.price)]
        : opts.sort === "rating"
          ? [desc(products.rating), desc(products.reviewCount)]
          : opts.sort === "discount"
            ? [desc(sql`coalesce(${products.compareAtPrice}, ${products.price}) - ${products.price}`)]
            : [desc(products.featured), desc(products.reviewCount)];
  const q = db
    .select()
    .from(products)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(...order);
  return opts.limit ? q.limit(opts.limit) : q;
}

export async function getBrands(category?: string) {
  await ensureSeed();
  const rows = await db
    .selectDistinct({ brand: products.brand })
    .from(products)
    .where(category && category !== "all" ? eq(products.category, category) : undefined)
    .orderBy(asc(products.brand));
  return rows.map((r) => r.brand);
}

export async function getProduct(slug: string) {
  await ensureSeed();
  const [p] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return p ?? null;
}

export async function getReviews(productId: number) {
  return db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt))
    .limit(30);
}

export async function getRelated(p: Product) {
  return db
    .select()
    .from(products)
    .where(and(eq(products.category, p.category), ne(products.id, p.id)))
    .orderBy(desc(products.reviewCount))
    .limit(8);
}
