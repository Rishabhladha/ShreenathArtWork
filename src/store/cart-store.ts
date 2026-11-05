import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculateCouponDiscount } from '@/lib/money';

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
  minOrderValue?: number | null;
  maxDiscount?: number | null;
}

function recalculateCoupon(coupon: AppliedCoupon | null, items: CartItem[]): AppliedCoupon | null {
  if (!coupon) return null;
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  if (subtotal <= 0) {
    return null;
  }

  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return null;
  }

  const newDiscount = calculateCouponDiscount(coupon, subtotal);
  if (newDiscount === 0 && coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return null;
  }

  return {
    ...coupon,
    discountAmount: newDiscount,
  };
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
        let nextItems: CartItem[];

        if (existing) {
          const newQty = Math.min(existing.quantity + itemData.quantity, itemData.maxStock);
          nextItems = get().items.map((i) =>
            i.id === id ? { ...i, quantity: newQty, maxStock: itemData.maxStock } : i
          );
        } else {
          nextItems = [
            ...get().items,
            {
              ...itemData,
              id,
              quantity: Math.min(itemData.quantity, itemData.maxStock),
            },
          ];
        }

        const nextCoupon = recalculateCoupon(get().coupon, nextItems);
        set({
          items: nextItems,
          coupon: nextCoupon,
          isDrawerOpen: true,
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }

        const nextItems = get().items.map((item) => {
          if (item.id === id) {
            const clamped = Math.min(quantity, item.maxStock);
            return { ...item, quantity: clamped };
          }
          return item;
        });

        const nextCoupon = recalculateCoupon(get().coupon, nextItems);
        set({
          items: nextItems,
          coupon: nextCoupon,
        });
      },

      removeItem: (id) => {
        const nextItems = get().items.filter((item) => item.id !== id);
        const nextCoupon = recalculateCoupon(get().coupon, nextItems);
        set({
          items: nextItems,
          coupon: nextCoupon,
        });
      },

      clearCart: () => {
        set({ items: [], coupon: null });
      },

      setDrawerOpen: (open) => {
        set({ isDrawerOpen: open });
      },

      applyCoupon: (coupon) => {
        const recalculated = recalculateCoupon(coupon, get().items);
        set({ coupon: recalculated || coupon });
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

