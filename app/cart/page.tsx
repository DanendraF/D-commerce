'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { formatPrice } from '@/lib/mock-data';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container } from '@/components/shared';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getShippingCost,
    getTotal,
    couponCode,
    discount,
    applyCoupon,
    removeCoupon,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <LayoutClient>
        <Container className="py-16">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-muted mb-8" />
            <div className="h-96 bg-muted" />
          </div>
        </Container>
      </LayoutClient>
    );
  }

  const subtotal = getSubtotal();
  const shipping = getShippingCost();
  const total = getTotal();

  const handleApplyCoupon = () => {
    if (couponInput.toUpperCase() === 'DCNEW') {
      applyCoupon('DCNEW', subtotal * 0.1);
    } else if (couponInput.toUpperCase() === 'SAVE15') {
      applyCoupon('SAVE15', subtotal * 0.15);
    }
  };

  return (
    <LayoutClient>
      <Container className="py-8 lg:py-16">
        <h1 className="font-serif text-2xl font-bold lg:text-3xl">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center py-16 text-center">
            <ShoppingBag className="h-20 w-20 text-muted-foreground/50" />
            <h2 className="mt-6 text-xl font-medium">Your cart is empty</h2>
            <p className="mt-2 text-muted-foreground">
              Looks like you haven&apos;t added anything to your cart yet.
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-flex items-center gap-2 bg-foreground px-8 py-3 text-background hover:bg-foreground/80"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 lg:mt-12">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="divide-y">
                  {items.map((item) => {
                    const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
                    return (
                      <div key={item.id} className="flex gap-4 py-6">
                        {/* Image */}
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="relative h-32 w-24 flex-shrink-0 overflow-hidden bg-muted sm:h-40 sm:w-32"
                        >
                          {primaryImage && (
                            <Image
                              src={primaryImage.url}
                              alt={primaryImage.alt}
                              fill
                              className="object-cover"
                            />
                          )}
                        </Link>

                        {/* Details */}
                        <div className="flex flex-1 flex-col">
                          <div className="flex justify-between">
                            <div>
                              <Link
                                href={`/product/${item.product.slug}`}
                                className="font-medium hover:underline"
                              >
                                {item.product.name}
                              </Link>
                              <p className="mt-1 text-sm text-muted-foreground">
                                {item.variant.options.size && `Size: ${item.variant.options.size}`}
                              </p>
                              <p className="mt-1 text-sm text-muted-foreground">
                                SKU: {item.variant.sku}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 text-muted-foreground hover:text-foreground"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="mt-auto flex items-center justify-between">
                            {/* Quantity */}
                            <div className="flex items-center border">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-2 transition-colors hover:bg-muted"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-12 text-center text-sm">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-2 transition-colors hover:bg-muted"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <p className="text-right">
                              <span className="font-semibold">
                                {formatPrice(item.variant.price * item.quantity)}
                              </span>
                              <span className="ml-2 text-xs text-muted-foreground">
                                ({formatPrice(item.variant.price)} each)
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 border p-6">
                  <h2 className="text-lg font-semibold">Order Summary</h2>

                  {/* Coupon */}
                  <div className="mt-6">
                    <label className="text-sm font-medium">Promo Code</label>
                    {couponCode ? (
                      <div className="mt-2 flex items-center justify-between bg-muted px-4 py-3">
                        <span className="text-sm font-medium">{couponCode}</span>
                        <button
                          onClick={removeCoupon}
                          className="text-xs text-muted-foreground hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="flex-1 border px-3 py-2 text-sm focus:border-foreground focus:outline-none"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={!couponInput}
                          className="border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Try: DCNEW for 10% off or SAVE15 for 15% off
                    </p>
                  </div>

                  {/* Totals */}
                  <div className="mt-6 space-y-3 border-t pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span>Discount</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{shipping > 0 ? formatPrice(shipping) : 'Calculated at checkout'}</span>
                    </div>
                    <div className="flex justify-between border-t pt-3 text-base font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(subtotal - discount)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => router.push('/checkout')}
                    className="mt-6 w-full bg-foreground py-4 text-center text-background transition-colors hover:bg-foreground/80"
                  >
                    Proceed to Checkout
                  </button>

                  {/* Security */}
                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    Secure checkout powered by industry-leading encryption
                  </p>

                  {/* Continue Shopping */}
                  <Link
                    href="/shop"
                    className="mt-4 block w-full border py-3 text-center text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </LayoutClient>
  );
}
