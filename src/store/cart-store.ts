import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique key: `${productId}-${variantId}`
  productId: string;
  variantId: string;
  title: string;
  slug: string;
  image: string;
  size: string;
  frame: string;
  price: number; // in paise
  mrp?: number | null;
  quantity: number;
  maxStock: number;
}

export interface AppliedCoupon {
  code: string;
  description?: string | null;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  discountAmount: number; // in paise
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  coupon: AppliedCoupon | null;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setDrawerOpen: (open: boolean) => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isDrawerOpen: false,
      coupon: null,

      addItem: (itemData) => {
        const id = `${itemData.productId}-${itemData.variantId}`;
        const existing = get().items.find((i) => i.id === id);

        if (existing) {
          const newQty = Math.min(existing.quantity + itemData.quantity, itemData.maxStock);
          set({
            items: get().items.map((i) =>
              i.id === id ? { ...i, quantity: newQty, maxStock: itemData.maxStock } : i
            ),
            isDrawerOpen: true,
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                ...itemData,
                id,
                quantity: Math.min(itemData.quantity, itemData.maxStock),
              },
            ],
            isDrawerOpen: true,
          });
        }
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        set({
          items: get().items.map((item) => {
            if (item.id === id) {
              const clamped = Math.min(quantity, item.maxStock);
              return { ...item, quantity: clamped };
            }
            return item;
          }),
        });
      },

      removeItem: (id) => {
        set({
          items: get().items.filter((item) => item.id !== id),
        });
      },

      clearCart: () => {
        set({ items: [], coupon: null });
      },

      setDrawerOpen: (open) => {
        set({ isDrawerOpen: open });
      },

      applyCoupon: (coupon) => {
        set({ coupon });
      },

      removeCoupon: () => {
        set({ coupon: null });
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'shreenath_cart_v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    }
  )
);

