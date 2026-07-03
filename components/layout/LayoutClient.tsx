import { ReactNode } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { CartDrawer } from '@/components/cart/CartDrawer';

interface LayoutClientProps {
  children: ReactNode;
}

export function LayoutClient({ children }: LayoutClientProps) {
  return (
    <ClientProviders>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </ClientProviders>
  );
}
