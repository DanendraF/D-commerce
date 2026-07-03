'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Banknote, Wallet, CreditCard, Copy, Check, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/mock-data';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container } from '@/components/shared';

const paymentMethods = [
  { id: 'bca', name: 'Bank Transfer BCA', type: 'bank_transfer', icon: Banknote },
  { id: 'mandiri', name: 'Bank Transfer Mandiri', type: 'bank_transfer', icon: Banknote },
  { id: 'bni', name: 'Bank Transfer BNI', type: 'bank_transfer', icon: Banknote },
  { id: 'gopay', name: 'GoPay', type: 'e_wallet', icon: Wallet },
  { id: 'ovo', name: 'OVO', type: 'e_wallet', icon: Wallet },
  { id: 'dana', name: 'DANA', type: 'e_wallet', icon: Wallet },
  { id: 'visa', name: 'Kartu Kredit Visa', type: 'credit_card', icon: CreditCard },
  { id: 'mastercard', name: 'Kartu Kredit Mastercard', type: 'credit_card', icon: CreditCard },
];

type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed';

export default function PaymentPage() {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [status, setStatus] = useState<PaymentStatus>('pending');
  const [copied, setCopied] = useState(false);

  // Mock order data
  const order = {
    orderNumber: 'DC-2024-002345',
    total: 1275000,
  };

  const handleCopyVA = (vaNumber: string) => {
    navigator.clipboard.writeText(vaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulatePayment = () => {
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  if (status === 'success') {
    return (
      <LayoutClient>
        <Container className="flex min-h-[60vh] items-center justify-center py-16">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <Check className="h-10 w-10 text-success" />
            </div>
            <h1 className="font-serif text-2xl font-bold">Payment Successful!</h1>
            <p className="mt-4 text-muted-foreground">
              Your payment has been processed successfully. You will receive an order confirmation shortly.
            </p>
            <div className="mt-8 gap-4 space-y-3">
              <Link
                href="/account/orders"
                className="block w-full bg-foreground py-3 text-center text-background transition-colors hover:bg-foreground/80"
              >
                View My Orders
              </Link>
              <Link
                href="/shop"
                className="block w-full border py-3 text-center text-sm font-medium transition-colors hover:bg-muted"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </Container>
      </LayoutClient>
    );
  }

  if (status === 'failed') {
    return (
      <LayoutClient>
        <Container className="flex min-h-[60vh] items-center justify-center py-16">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error/10">
              <AlertCircle className="h-10 w-10 text-error" />
            </div>
            <h1 className="font-serif text-2xl font-bold">Payment Failed</h1>
            <p className="mt-4 text-muted-foreground">
              We couldn&apos;t process your payment. Please try again or use a different payment method.
            </p>
            <div className="mt-8 gap-4 space-y-3">
              <button
                onClick={() => setStatus('pending')}
                className="block w-full bg-foreground py-3 text-center text-background transition-colors hover:bg-foreground/80"
              >
                Try Again
              </button>
              <Link
                href="/checkout/payment"
                className="block w-full border py-3 text-center text-sm font-medium transition-colors hover:bg-muted"
              >
                Choose Different Method
              </Link>
            </div>
          </div>
        </Container>
      </LayoutClient>
    );
  }

  return (
    <LayoutClient>
      <Container className="py-8 lg:py-16">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="font-serif text-2xl font-bold lg:text-3xl">Payment</h1>
            <p className="mt-2 text-muted-foreground">Order #{order.orderNumber}</p>
          </div>

          {/* Payment Method Selection */}
          {!selectedPayment && (
            <div className="mb-8">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider">Select Payment Method</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className="flex items-center gap-4 border p-4 text-left transition-colors hover:bg-muted"
                  >
                    <method.icon className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{method.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{method.type.replace('_', ' ')}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payment Instructions */}
          {selectedPayment && status === 'pending' && (
            <div className="border">
              <div className="border-b p-4">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Change payment method
                </button>
              </div>

              {/* Bank Transfer Instructions */}
              {paymentMethods.find(m => m.id === selectedPayment)?.type === 'bank_transfer' && (
                <div className="p-6">
                  <h3 className="mb-4 font-medium">Bank Transfer Instructions</h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Please transfer the exact amount below to the following account. Your order will be processed after payment is verified.
                  </p>

                  <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Bank Name</span>
                      <span className="font-medium">{selectedPayment?.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Account Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium">8123-4567-8910</span>
                        <button
                          onClick={() => handleCopyVA('812345678910')}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Account Name</span>
                      <span className="font-medium">D&apos;COMMERCE INDONESIA</span>
                    </div>
                    <div className="flex justify-between border-t pt-4">
                      <span className="text-sm font-medium">Total Amount</span>
                      <span className="font-mono font-bold text-lg">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-start gap-2 rounded-md bg-warning/10 p-3">
                    <Clock className="h-5 w-5 flex-shrink-0 text-warning" />
                    <div className="text-sm">
                      <p className="font-medium">Payment Deadline</p>
                      <p className="text-muted-foreground">Please complete payment within 24 hours</p>
                    </div>
                  </div>

                  <button
                    onClick={simulatePayment}
                    className="mt-6 w-full bg-foreground py-4 text-center text-background transition-colors hover:bg-foreground/80"
                  >
                    I&apos;ve Made the Payment
                  </button>
                </div>
              )}

              {/* E-Wallet Instructions */}
              {paymentMethods.find(m => m.id === selectedPayment)?.type === 'e_wallet' && (
                <div className="p-6">
                  <h3 className="mb-4 font-medium">E-Wallet Payment</h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    You will be redirected to complete payment via your e-wallet application.
                  </p>

                  <div className="space-y-4 rounded-lg bg-muted/50 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Payment Method</span>
                      <span className="font-medium capitalize">{selectedPayment}</span>
                    </div>
                    <div className="flex justify-between border-t pt-4">
                      <span className="text-sm font-medium">Total Amount</span>
                      <span className="font-mono font-bold text-lg">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={simulatePayment}
                    className="mt-6 w-full bg-foreground py-4 text-center text-background transition-colors hover:bg-foreground/80"
                  >
                    Pay with {selectedPayment?.toUpperCase()}
                  </button>
                </div>
              )}

              {/* Credit Card Instructions */}
              {paymentMethods.find(m => m.id === selectedPayment)?.type === 'credit_card' && (
                <div className="p-6">
                  <h3 className="mb-4 font-medium">Card Payment</h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Enter your card details to complete the payment securely.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full border px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full border px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full border px-4 py-3 text-sm focus:border-foreground focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-lg bg-muted/50 p-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Total Amount</span>
                      <span className="font-mono font-bold text-lg">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={simulatePayment}
                    className="mt-6 w-full bg-foreground py-4 text-center text-background transition-colors hover:bg-foreground/80"
                  >
                    Pay {formatPrice(order.total)}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Processing */}
          {status === 'processing' && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-foreground" />
              </div>
              <h2 className="font-serif text-xl font-semibold">Processing Payment</h2>
              <p className="mt-2 text-muted-foreground">Please wait while we verify your payment...</p>
            </div>
          )}

          {/* Order Summary */}
          {!selectedPayment && (
            <div className="rounded-lg border bg-muted/30 p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Order Summary</h3>
              <div className="mb-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              <div className="flex justify-between border-t pt-3 font-semibold">
                <span>Total</span>
                <span className="font-mono">{formatPrice(order.total)}</span>
              </div>
            </div>
          )}
        </div>
      </Container>
    </LayoutClient>
  );
}
