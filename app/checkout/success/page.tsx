import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container } from '@/components/shared';

export default function CheckoutSuccessPage() {
  return (
    <LayoutClient>
      <Container className="flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="mb-6 h-20 w-20 text-success" />
        <h1 className="mb-2 font-serif text-3xl font-bold">Order Placed Successfully!</h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          Thank you for your purchase. We have received your order and it is now being processed. 
          You can track your payment status in your account.
        </p>
        <div className="flex gap-4">
          <Link 
            href="/account?tab=orders"
            className="bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
          >
            View Order History
          </Link>
          <Link 
            href="/"
            className="border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            Continue Shopping
          </Link>
        </div>
      </Container>
    </LayoutClient>
  );
}
