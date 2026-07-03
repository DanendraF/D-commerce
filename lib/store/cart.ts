import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, ProductVariant, Address, ShippingMethod } from '@/lib/types';

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  shippingAddress: Address | null;
  billingAddress: Address | null;
  useSameAddress: boolean;
  shippingMethod: ShippingMethod | null;
  couponCode: string | null;
  discount: number;

  // Actions
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Address actions
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address) => void;
  setUseSameAddress: (value: boolean) => void;
  setShippingMethod: (method: ShippingMethod) => void;

  // Coupon actions
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;

  // Computed values
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingCost: () => number;
  getTotal: () => number;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shippingAddress: null,
      billingAddress: null,
      useSameAddress: true,
      shippingMethod: null,
      couponCode: null,
      discount: 0,

      addItem: (product, variant, quantity = 1) => {
        const items = get().items;
        const existingIndex = items.findIndex(
          item => item.productId === product.id && item.variantId === variant.id
        );

        if (existingIndex >= 0) {
          // Update quantity if item exists
          const newItems = [...items];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + quantity,
          };
          set({ items: newItems });
        } else {
          // Add new item
          const newItem: CartItem = {
            id: generateId(),
            productId: product.id,
            variantId: variant.id,
            product,
            variant,
            quantity,
          };
          set({ items: [...items, newItem] });
        }
      },

      removeItem: (itemId) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }
        const newItems = get().items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        set({ items: newItems });
      },

      clearCart: () => {
        set({
          items: [],
          shippingAddress: null,
          billingAddress: null,
          useSameAddress: true,
          shippingMethod: null,
          couponCode: null,
          discount: 0,
        });
      },

      setShippingAddress: (address) => set({ shippingAddress: address }),
      setBillingAddress: (address) => set({ billingAddress: address }),
      setUseSameAddress: (value) => set({ useSameAddress: value }),
      setShippingMethod: (method) => set({ shippingMethod: method }),

      applyCoupon: (code, discount) => set({ couponCode: code, discount }),
      removeCoupon: () => set({ couponCode: null, discount: 0 }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.variant.price * item.quantity,
          0
        );
      },

      getShippingCost: () => {
        const method = get().shippingMethod;
        return method ? method.price : 0;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShippingCost();
        const discount = get().discount;
        return subtotal + shipping - discount;
      },
    }),
    {
      name: 'dcommerce-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        shippingAddress: state.shippingAddress,
        billingAddress: state.billingAddress,
        useSameAddress: state.useSameAddress,
        shippingMethod: state.shippingMethod,
        couponCode: state.couponCode,
        discount: state.discount,
      }),
    }
  )
);
