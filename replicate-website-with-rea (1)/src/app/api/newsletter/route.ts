import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscribers } from "@/db/schema";
import { getI18n } from "@/lib/lang";

export async function POST(req: Request) {
  const { l } = await getI18n();
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ error: l("يرجى إدخال بريد إلكتروني صالح.", "Veuillez saisir un e-mail valide.") }, { status: 400 });
  }
  const res = await db.insert(subscribers).values({ email }).onConflictDoNothing().returning({ id: subscribers.id });
  return NextResponse.json({
    message: res.length
      ? l("أهلاً بك! تحقق من بريدك قريباً.", "Bienvenue ! Surveillez bientôt votre boîte mail.")
      : l("أنت مشترك بالفعل — شكراً!", "Vous êtes déjà inscrit — merci !"),
  });
}
