'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/mock-data';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/lib/store';

interface ProductCardProps {
  product: Product;
  className?: string;
  showQuickAdd?: boolean;
}

export function ProductCard({ product, className, showQuickAdd = false }: ProductCardProps) {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  
  // Need to handle hydration mismatch by rendering default false on server
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  useEffect(() => {
    setIsWishlisted(isInWishlist(product.id));
  }, [isInWishlist, product.id]);

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn('group block', className)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-100">
        {primaryImage && (
          <Image
            src={primaryImage.url}
            alt={primaryImage.alt}
            fill
            className="product-image object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-navy-900 px-2 py-1 text-2xs font-medium uppercase tracking-wider text-white">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="bg-maroon-600 px-2 py-1 text-2xs font-medium uppercase tracking-wider text-white">
              Sale
            </span>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/5" />

        {/* Quick view on hover - desktop only */}
        {showQuickAdd && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              className="w-full bg-white py-2.5 text-sm font-medium text-navy-900 transition-colors hover:bg-cream-100"
              onClick={(e) => {
                e.preventDefault();
                // Quick add logic would go here
              }}
            >
              Add to Cart
            </button>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (isWishlisted) {
              removeItem(product.id);
            } else {
              addItem(product);
            }
          }}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
        >
          <svg
            className={cn('h-4 w-4 transition-colors', isWishlisted ? 'fill-maroon-600 text-maroon-600' : 'text-gray-600')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isWishlisted ? "0" : "1.5"} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            {isWishlisted && <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L12 8.343l3.172-3.171a4 4 0 115.656 5.656L12 22.828l-8.828-8.829a4 4 0 010-5.656z" clipRule="evenodd" />}
          </svg>
        </button>
      </div>

      {/* Product Info */}
      <div className="mt-4 space-y-1.5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.brand}
        </p>
        <h3 className="text-sm font-medium text-foreground line-clamp-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    'h-3 w-3',
                    i < Math.floor(product.rating)
                      ? 'text-amber-500 fill-current'
                      : 'text-gray-300 fill-current'
                  )}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
