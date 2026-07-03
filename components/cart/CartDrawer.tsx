'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCartStore, useUIStore } from '@/lib/store';
import { formatPrice } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const { isCartOpen, setCartOpen } = useUIStore();
  const { items, removeItem, updateQuantity, getSubtotal } = useCartStore();

  const subtotal = getSubtotal();

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300',
          isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background transition-transform duration-300',
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="font-serif text-lg font-semibold">
            Shopping Bag ({items.length})
          </h2>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-muted rounded-sm transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">Your bag is empty</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Looks like you haven&apos;t added anything yet.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80"
                onClick={() => setCartOpen(false)}
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => {
                const primaryImage = item.product.images.find(img => img.isPrimary) || item.product.images[0];
                return (
                  <div key={item.id} className="flex gap-4 p-4">
                    {/* Image */}
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="relative h-24 w-20 flex-shrink-0 overflow-hidden bg-muted"
                      onClick={() => setCartOpen(false)}
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
                            className="text-sm font-medium hover:underline"
                            onClick={() => setCartOpen(false)}
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {item.variant.options.size && `Size: ${item.variant.options.size}`}
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
                            className="p-2 hover:bg-muted transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-10 text-center text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-muted transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <p className="text-sm font-semibold">
                          {formatPrice(item.variant.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm">Subtotal</span>
              <span className="text-lg font-semibold">{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Shipping & taxes calculated at checkout
            </p>
            <div className="grid gap-2">
              <Link
                href="/checkout"
                className="block w-full bg-foreground py-3.5 text-center text-sm font-medium text-background transition-colors hover:bg-foreground/80"
                onClick={() => setCartOpen(false)}
              >
                Checkout
              </Link>
              <Link
                href="/cart"
                className="block w-full border py-3.5 text-center text-sm font-medium transition-colors hover:bg-muted"
                onClick={() => setCartOpen(false)}
              >
                View Bag
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
