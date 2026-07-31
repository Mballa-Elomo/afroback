import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { MarketplaceProduct } from '../data/marketplaceTypes';

export interface CartItem {
  productId: string;
  vendorId: string;
  nom: string;
  prixUnitaireFcfa: number;
  imageUrl: string | null;
  quantite: number;
}

interface CartState {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (product: MarketplaceProduct) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | null>(null);

/**
 * Panier — état local à l'appareil, pas synchronisé en base : c'est une
 * étape ephémère avant checkout, aucun besoin de le partager entre
 * appareils pour la V1. Scopé au layout de l'onglet Marché (pas au layout
 * racine) pour ne pas toucher aux fichiers partagés par les autres piliers.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: MarketplaceProduct) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.productId === product.id);
      if (existing) {
        return prev.map((it) => (it.productId === product.id ? { ...it, quantite: it.quantite + 1 } : it));
      }
      return [
        ...prev,
        {
          productId: product.id,
          vendorId: product.vendor_id,
          nom: product.nom,
          prixUnitaireFcfa: product.prix_fcfa,
          imageUrl: product.image_url,
          quantite: 1,
        },
      ];
    });
  };

  const increment = (productId: string) => {
    setItems((prev) => prev.map((it) => (it.productId === productId ? { ...it, quantite: it.quantite + 1 } : it)));
  };

  const decrement = (productId: string) => {
    setItems((prev) =>
      prev
        .map((it) => (it.productId === productId ? { ...it, quantite: it.quantite - 1 } : it))
        .filter((it) => it.quantite > 0)
    );
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const clear = () => setItems([]);

  const value = useMemo<CartState>(() => {
    const count = items.reduce((sum, it) => sum + it.quantite, 0);
    const subtotal = items.reduce((sum, it) => sum + it.prixUnitaireFcfa * it.quantite, 0);
    return { items, count, subtotal, addItem, increment, decrement, removeItem, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé à l’intérieur de <CartProvider>.');
  return ctx;
}
