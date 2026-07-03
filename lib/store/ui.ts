import { create } from 'zustand';

interface UIState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  cartDrawerSide: 'left' | 'right';
  setCartOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  toggleCart: () => void;
  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  isSearchOpen: false,
  cartDrawerSide: 'right',

  setCartOpen: (open) => set({ isCartOpen: open }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),

  toggleCart: () => set({ isCartOpen: !get().isCartOpen }),
  toggleMobileMenu: () => set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
  toggleSearch: () => set({ isSearchOpen: !get().isSearchOpen }),

  closeAll: () => set({ isCartOpen: false, isMobileMenuOpen: false, isSearchOpen: false }),
}));
