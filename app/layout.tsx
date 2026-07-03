import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dcommerce-store.vercel.app'),
  title: {
    default: "D'commerce - Premium Fashion",
    template: "%s | D'commerce",
  },
  description: 'Discover timeless elegance with our curated collection of premium fashion pieces.',
  openGraph: {
    title: "D'commerce - Premium Fashion",
    description: 'Discover timeless elegance with our curated collection of premium fashion pieces.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "D'commerce - Premium Fashion",
    description: 'Discover timeless elegance with our curated collection of premium fashion pieces.',
  },
};

import { AuthProvider } from '@/components/layout/AuthProvider';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AuthProvider>
        <script type="text/javascript" src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}></script>
      </body>
    </html>
  );
}
