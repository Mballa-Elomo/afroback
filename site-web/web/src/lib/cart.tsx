'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

/** Panier du Marché, gardé dans le navigateur (même logique que l'app : une commande par vendeur). */
export type CartItem = { productId: string; vendorId: string; nom: string; prix: number; quantite: number; image: string | null; stock: number };

type CartValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, 'quantite'>, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const KEY = 'afroback-web:panier';
const Ctx = createContext<CartValue | null>(null);
export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useCart hors de CartProvider');
  return v;
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* panier vide */
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* best-effort */
    }
  }, [items]);

  const value = useMemo<CartValue>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantite, 0),
      subtotal: items.reduce((s, i) => s + i.prix * i.quantite, 0),
      add: (item, qty = 1) =>
        setItems((cur) => {
          const found = cur.find((c) => c.productId === item.productId);
          if (found) return cur.map((c) => (c.productId === item.productId ? { ...c, quantite: Math.min(c.quantite + qty, item.stock || 99) } : c));
          return [...cur, { ...item, quantite: Math.min(qty, item.stock || 99) }];
        }),
      setQty: (id, qty) => setItems((cur) => cur.map((c) => (c.productId === id ? { ...c, quantite: Math.max(1, Math.min(qty, c.stock || 99)) } : c))),
      remove: (id) => setItems((cur) => cur.filter((c) => c.productId !== id)),
      clear: () => setItems([]),
    }),
    [items]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
