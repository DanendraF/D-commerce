'use client';

import { ReactNode } from 'react';
import { CartDrawer } from '@/components/cart/CartDrawer';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
}
