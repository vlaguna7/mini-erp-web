import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  code?: string;
  itemDiscount?: number;
  itemDiscountType?: 'value' | 'percent';
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  cpf?: string;
  phone?: string;
}

export interface Seller {
  id: string;
  name: string;
  email?: string;
}

export type PaymentMethod = 'cash' | 'pix' | 'credit' | 'debit';

export interface PaymentEntry {
  id: string;
  method: PaymentMethod;
  label: string;
  amount: number;
}

interface PDVStore {
  cart: CartItem[];
  selectedClient: Client | null;
  selectedPayment: PaymentMethod | null;
  selectedSeller: Seller | null;
  discount: number;
  discountType: 'value' | 'percent';
  surcharge: number;
  surchargeType: 'value' | 'percent';
  coupon: string;
  payments: PaymentEntry[];
  saleType: 'online' | 'inperson';

  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  updateItemDiscount: (itemId: string, discount: number, type: 'value' | 'percent') => void;
  clearCart: () => void;
  setSelectedClient: (client: Client | null) => void;
  setSelectedPayment: (method: PaymentMethod | null) => void;
  setSelectedSeller: (seller: Seller | null) => void;
  setDiscount: (discount: number) => void;
  setDiscountType: (type: 'value' | 'percent') => void;
  setSurcharge: (surcharge: number) => void;
  setSurchargeType: (type: 'value' | 'percent') => void;
  setCoupon: (coupon: string) => void;
  addPayment: (entry: PaymentEntry) => void;
  removePayment: (id: string) => void;
  clearPayments: () => void;
  setSaleType: (type: 'online' | 'inperson') => void;
  getCartTotal: () => number;
  getSubtotal: () => number;
  getTotalToPay: () => number;
  getTotalPaid: () => number;
  resetPDV: () => void;
}

export const usePDVStore = create<PDVStore>()(
  persist(
    (set, get) => ({
  cart: [],
  selectedClient: null,
  selectedPayment: null,
  selectedSeller: null,
  discount: 0,
  discountType: 'value',
  surcharge: 0,
  surchargeType: 'value',
  coupon: '',
  payments: [],
  saleType: 'inperson',

  addToCart: (item: CartItem) =>
    set((state) => {
      const existingItem = state.cart.find((i) => i.id === item.id);
      if (existingItem) {
        return {
          cart: state.cart.map((i) =>
            i.id === item.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { cart: [...state.cart, item] };
    }),

  removeFromCart: (itemId: string) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.id !== itemId),
    })),

  updateCartQuantity: (itemId: string, quantity: number) =>
    set((state) => ({
      cart:
        quantity <= 0
          ? state.cart.filter((i) => i.id !== itemId)
          : state.cart.map((i) =>
              i.id === itemId ? { ...i, quantity } : i
            ),
    })),

  updateItemDiscount: (itemId: string, discount: number, type: 'value' | 'percent') =>
    set((state) => ({
      cart: state.cart.map((i) =>
        i.id === itemId ? { ...i, itemDiscount: discount, itemDiscountType: type } : i
      ),
      payments: [],
    })),

  clearCart: () => set({ cart: [] }),

  setSelectedClient: (client: Client | null) =>
    set({ selectedClient: client }),

  setSelectedPayment: (method: PaymentMethod | null) =>
    set({ selectedPayment: method }),

  setSelectedSeller: (seller: Seller | null) =>
    set({ selectedSeller: seller }),

  setDiscount: (discount: number) => set({ discount, payments: [] }),

  setDiscountType: (type: 'value' | 'percent') => set({ discountType: type, payments: [] }),

  setSurcharge: (surcharge: number) => set({ surcharge, payments: [] }),

  setSurchargeType: (type: 'value' | 'percent') => set({ surchargeType: type, payments: [] }),

  setCoupon: (coupon: string) => set({ coupon }),

  addPayment: (entry: PaymentEntry) =>
    set((state) => ({ payments: [...state.payments, entry] })),

  removePayment: (id: string) =>
    set((state) => ({ payments: state.payments.filter((p) => p.id !== id) })),

  clearPayments: () => set({ payments: [] }),

  setSaleType: (type: 'online' | 'inperson') => set({ saleType: type }),

  getSubtotal: () => {
    const state = get();
    return state.cart.reduce((sum, item) => {
      const lineTotal = item.price * item.quantity;
      const disc = item.itemDiscount || 0;
      const discValue = item.itemDiscountType === 'percent' ? lineTotal * (disc / 100) : disc;
      return sum + Math.max(0, lineTotal - discValue);
    }, 0);
  },

  getCartTotal: () => {
    const state = get();
    const subtotal = get().getSubtotal();
    return Math.max(0, subtotal - state.discount);
  },

  getTotalToPay: () => {
    const state = get();
    const subtotal = get().getSubtotal();
    const discountValue =
      state.discountType === 'percent'
        ? subtotal * (state.discount / 100)
        : state.discount;
    const surchargeValue =
      state.surchargeType === 'percent'
        ? subtotal * (state.surcharge / 100)
        : state.surcharge;
    return Math.max(0, subtotal - discountValue + surchargeValue);
  },

  getTotalPaid: () => {
    const state = get();
    return state.payments.reduce((sum, p) => sum + p.amount, 0);
  },

  resetPDV: () =>
    set({
      cart: [],
      selectedClient: null,
      selectedPayment: null,
      selectedSeller: null,
      discount: 0,
      discountType: 'value',
      surcharge: 0,
      surchargeType: 'value',
      coupon: '',
      payments: [],
      saleType: 'inperson',
    }),
}),
    {
      name: 'pdv-store',
    }
  )
);
