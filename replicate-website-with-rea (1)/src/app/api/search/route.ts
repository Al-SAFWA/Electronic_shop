import { NextResponse } from "next/server";
import { listProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });
  const rows = await listProducts({ q: q.slice(0, 60), limit: 6 });
  return NextResponse.json({
    results: rows.map((p) => ({
      slug: p.slug,
      name: p.name,
      price: p.price,
      image: p.image,
      storage: p.storage,
    })),
  });
}
