"use client";

import { useState } from "react";
import { useI18n } from "./I18nProvider";

export default function Newsletter() {
  const { l } = useI18n();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    const r = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      setState("ok");
      setMsg(d.message ?? l("تم الاشتراك!", "Vous êtes inscrit !"));
      setEmail("");
    } else {
      setState("err");
      setMsg(d.error ?? l("حدث خطأ ما", "Une erreur est survenue"));
    }
  }

  return (
    <form onSubmit={submit} className="w-full md:w-auto md:min-w-[380px]">
      <div className="flex rounded-full bg-white p-1">
        <input
          type="email"
          required
          dir="ltr"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={l("بريدك الإلكتروني", "Votre e-mail")}
          className="w-full bg-transparent px-4 text-sm text-ink outline-none placeholder:text-start"
        />
        <button disabled={state === "loading"} className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-black disabled:opacity-60">
          {state === "loading" ? "…" : l("اشترك", "S'abonner")}
        </button>
      </div>
      {state !== "idle" && state !== "loading" && (
        <p className={`mt-2 text-sm font-semibold ${state === "ok" ? "text-lime" : "text-white"}`}>{msg}</p>
      )}
    </form>
  );
}
