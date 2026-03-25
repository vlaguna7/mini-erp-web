import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  code?: string;
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

interface PDVStore {
  cart: CartItem[];
  selectedClient: Client | null;
  selectedPayment: PaymentMethod | null;
  selectedSeller: Seller | null;
  discount: number;
  saleType: 'online' | 'inperson';

  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedClient: (client: Client | null) => void;
  setSelectedPayment: (method: PaymentMethod | null) => void;
  setSelectedSeller: (seller: Seller | null) => void;
  setDiscount: (discount: number) => void;
  setSaleType: (type: 'online' | 'inperson') => void;
  getCartTotal: () => number;
  resetPDV: () => void;
}

export const usePDVStore = create<PDVStore>((set, get) => ({
  cart: [],
  selectedClient: null,
  selectedPayment: null,
  selectedSeller: null,
  discount: 0,
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

  clearCart: () => set({ cart: [] }),

  setSelectedClient: (client: Client | null) =>
    set({ selectedClient: client }),

  setSelectedPayment: (method: PaymentMethod | null) =>
    set({ selectedPayment: method }),

  setSelectedSeller: (seller: Seller | null) =>
    set({ selectedSeller: seller }),

  setDiscount: (discount: number) => set({ discount }),

  setSaleType: (type: 'online' | 'inperson') => set({ saleType: type }),

  getCartTotal: () => {
    const state = get();
    const subtotal = state.cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return Math.max(0, subtotal - state.discount);
  },

  resetPDV: () =>
    set({
      cart: [],
      selectedClient: null,
      selectedPayment: null,
      selectedSeller: null,
      discount: 0,
      saleType: 'inperson',
    }),
}));
