'use client';

import { useWishlistStore } from '@/lib/store';
import { ProductCard } from '@/components/product';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container, FadeIn } from '@/components/shared';
import Link from 'next/link';

export default function WishlistPage() {
  const items = useWishlistStore((state) => state.items);
  const clearWishlist = useWishlistStore((state) => state.clearWishlist);

  return (
    <LayoutClient>
      <section className="bg-cream-100 py-12 lg:py-16">
        <Container>
          <FadeIn>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
              My Wishlist
            </h1>
            <p className="mt-2 text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </FadeIn>
        </Container>
      </section>

      <section className="py-12 lg:py-16">
        <Container>
          {items.length > 0 ? (
            <>
              <div className="flex justify-end mb-6">
                <button
                  onClick={clearWishlist}
                  className="text-sm font-medium text-maroon-600 hover:underline"
                >
                  Clear Wishlist
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {items.map((product, idx) => (
                  <FadeIn key={product.id} delay={idx * 50}>
                    <ProductCard product={product} />
                  </FadeIn>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <h2 className="text-xl font-medium mb-4">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-8">
                Save your favorite items to view them later.
              </p>
              <Link
                href="/shop"
                className="inline-block bg-foreground px-8 py-3 text-sm font-medium text-background hover:bg-foreground/90"
              >
                Continue Shopping
              </Link>
            </div>
          )}
        </Container>
      </section>
    </LayoutClient>
  );
}
