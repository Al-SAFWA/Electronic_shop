"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "./I18nProvider";

export default function ReviewForm({ productId }: { productId: number }) {
  const { l } = useI18n();
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, author, rating, body }),
    });
    setBusy(false);
    if (r.ok) {
      setAuthor("");
      setBody("");
      setRating(5);
      router.refresh();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error ?? l("تعذر نشر رأيك.", "Impossible de publier votre avis."));
    }
  }

  return (
    <form onSubmit={submit} className="h-fit rounded-2xl border border-line p-5">
      <h3 className="font-bold">{l("اكتب رأيك", "Donnez votre avis")}</h3>
      <div className="mt-3 flex gap-1" role="radiogroup" aria-label={l("التقييم", "Note")} dir="ltr">
        {[1, 2, 3, 4, 5].map((i) => (
          <button type="button" key={i} onClick={() => setRating(i)} aria-label={`${i}`} className="text-2xl leading-none" style={{ color: i <= rating ? "#f5a623" : "#d8d6ea" }}>
            ★
          </button>
        ))}
      </div>
      <input required maxLength={60} value={author} onChange={(e) => setAuthor(e.target.value)} placeholder={l("اسمك", "Votre nom")} className="input mt-3 text-sm" />
      <textarea required minLength={5} maxLength={800} value={body} onChange={(e) => setBody(e.target.value)} placeholder={l("كيف وجدت جهازك؟", "Que pensez-vous de votre appareil ?")} rows={3} className="input mt-3 text-sm" />
      {err && <p className="mt-2 text-sm font-semibold text-red-600">{err}</p>}
      <button disabled={busy} className="btn-primary mt-3 text-sm">{busy ? l("جارٍ النشر…", "Publication…") : l("انشر الرأي", "Publier")}</button>
    </form>
  );
}
