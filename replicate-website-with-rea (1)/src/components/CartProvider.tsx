"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import ProductImage from "./ProductImage";
import { useI18n } from "./I18nProvider";
import WhatsAppButton from "./WhatsAppButton";
import { FREE_SHIPPING_OVER, SHIPPING_FEE } from "@/lib/options";
import { buildOrderMessage } from "@/lib/whatsapp";

export type CartItem = {
  key: string;
  productId: number;
  slug: string;
  name: string;
  image: string;
  subtitle: string;
  unitPrice: number;
  qty: number;
  battery: string;
  plan: string;
};

type Ctx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (item: Omit<CartItem, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const CartCtx = createContext<Ctx | null>(null);
export const CART_STORAGE = "loopt-cart-v5-photo";

export function useCart() {
  const c = useContext(CartCtx);
  if (!c) throw new Error("useCart outside provider");
  return c;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(CART_STORAGE, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((item: Omit<CartItem, "key">) => {
    const key = `${item.productId}:${item.battery}:${item.plan}`;
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) return prev.map((i) => (i.key === key ? { ...i, qty: Math.min(5, i.qty + item.qty) } : i));
      return [...prev, { ...item, key }];
    });
    setOpen(true);
  }, []);
  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty: Math.min(5, qty) } : i)),
    );
  }, []);
  const remove = useCallback((key: string) => setItems((p) => p.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<Ctx>(() => {
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    const shipping = items.length === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
    return {
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
    };
  }, [items, open, add, setQty, remove, clear]);

  return (
    <CartCtx.Provider value={value}>
      {children}
      <CartDrawer />
    </CartCtx.Provider>
  );
}

function CartDrawer() {
  const i18n = useI18n();
  const { l, m } = i18n;
  const { items, open, setOpen, subtotal, shipping, total, setQty, remove } = useCart();
  const left = Math.max(0, FREE_SHIPPING_OVER - subtotal);
  const n = items.reduce((s, i) => s + i.qty, 0);

  const message = () =>
    buildOrderMessage(i18n, {
      lines: items.map((i) => ({
        name: i.name,
        subtitle: i.subtitle,
        battery: i.battery,
        plan: i.plan,
        qty: i.qty,
        unitPrice: i.unitPrice,
        url: `${window.location.origin}/products/${i.slug}`,
      })),
      subtotal,
      shipping,
      total,
    });

  return (
    <div className={`fixed inset-0 z-[80] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-ink/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        className={`absolute end-0 top-0 flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "ltr:translate-x-full rtl:-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold">
            {l("سلتك", "Votre panier")} ({n})
          </h2>
          <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-soft" aria-label={l("إغلاق", "Fermer")}>
            ✕
          </button>
        </div>
        {items.length > 0 && (
          <div className="border-b border-line bg-soft px-5 py-3 text-sm">
            {left > 0 ? (
              <p>
                {l("أضف", "Ajoutez")} <b>{m(left)}</b> {l("إضافية للحصول على", "pour profiter de la")}{" "}
                <b className="text-brand">{l("توصيل مجاني", "livraison gratuite")}</b>
              </p>
            ) : (
              <p className="font-semibold text-brand">🎉 {l("حصلت على توصيل مجاني", "Livraison gratuite débloquée")}</p>
            )}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_OVER) * 100)}%` }} />
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-soft text-3xl">🛍️</div>
                <p className="font-semibold">{l("سلتك فارغة", "Votre panier est vide")}</p>
                <p className="mt-1 text-sm text-muted">{l("اعثر على جهاز مجدد ومعتمد يعجبك.", "Trouvez un appareil reconditionné certifié qui vous plaît.")}</p>
                <Link href="/collections/all" onClick={() => setOpen(false)} className="btn-primary mt-4 inline-block">
                  {l("ابدأ التسوق", "Commencer mes achats")}
                </Link>
              </div>
            </div>
          ) : (
            items.map((i) => (
              <div key={i.key} className="flex gap-3 border-b border-line py-4">
                <Link href={`/products/${i.slug}`} onClick={() => setOpen(false)} className="grid h-20 w-20 shrink-0 place-items-center p-1">
                  <ProductImage src={i.image} alt={i.name} stage="mini" className="h-full w-full" />
                </Link>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" dir="auto">{i.name}</p>
                  <p className="text-xs text-muted">{i.subtitle}</p>
                  <p className="text-xs text-muted">
                    {i.battery === "new" ? l("بطارية جديدة", "Batterie neuve") : l("بطارية عادية", "Batterie standard")}
                    {i.plan === "shield" ? ` · ${l("حماية لوبت", "Loopt Shield")}` : ""}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-line text-sm" dir="ltr">
                      <button className="h-7 w-7" onClick={() => setQty(i.key, i.qty - 1)} aria-label="−">−</button>
                      <span className="w-6 text-center">{i.qty}</span>
                      <button className="h-7 w-7" onClick={() => setQty(i.key, i.qty + 1)} aria-label="+">+</button>
                    </div>
                    <span className="text-sm font-bold">{m(i.unitPrice * i.qty)}</span>
                  </div>
                  <button onClick={() => remove(i.key)} className="mt-1 text-xs text-muted underline">
                    {l("إزالة", "Retirer")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-line p-5">
            <div className="mb-3 flex justify-between text-base font-bold">
              <span>{l("المجموع الفرعي", "Sous-total")}</span>
              <span>{m(subtotal)}</span>
            </div>
            <WhatsAppButton
              message={message}
              label={l("اطلب عبر واتساب", "Commander sur WhatsApp")}
              className="btn-wa w-full"
            />
            <Link href="/checkout" onClick={() => setOpen(false)} className="btn-ghost mt-2 block w-full text-center text-sm">
              {l("إتمام الطلب بالتفاصيل", "Commande avec mes informations")}
            </Link>
            <p className="mt-2 text-center text-xs text-muted">{l("يتم احتساب التوصيل عند تأكيد الطلب", "Livraison calculée à la confirmation")}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
