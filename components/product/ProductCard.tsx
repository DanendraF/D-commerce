'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
  showQuickAdd?: boolean;
}

export function ProductCard({ product, className, showQuickAdd = false }: ProductCardProps) {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

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
