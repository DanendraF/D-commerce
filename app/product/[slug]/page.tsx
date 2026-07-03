'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Product, ProductVariant } from '@/lib/types';
import { formatPrice } from '@/lib/mock-data';
import { ProductCard, ProductCardSkeleton, ProductReviews } from '@/components/product';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container, FadeIn } from '@/components/shared';
import { useCartStore, useUIStore, useWishlistStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Heart, Share, Truck, RotateCcw, ShieldCheck, ChevronRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const router = useRouter();

  const { addItem: addCartItem, clearCart } = useCartStore();
  const { toggleCart } = useUIStore();
  
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const productData = await api.getProductBySlug(slug);
        if (productData) {
          setProduct(productData);
          // Initialize selected options
          const initialOptions: Record<string, string> = {};
          productData.options.forEach(option => {
            initialOptions[option.name] = option.values[0]?.name || '';
          });
          setSelectedOptions(initialOptions);

          // Fetch related products
          const related = await api.getRelatedProducts(productData.id);
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  const selectedVariant = product?.variants.find(
    v => Object.entries(selectedOptions).every(([key, value]) => v.options[key] === value)
  ) || product?.variants[0];

  const addToCart = () => {
    if (!product || !selectedVariant) return;

    addCartItem(product, selectedVariant, quantity);
    toast.success('Added to cart', {
      description: `${product.name} (${selectedVariant.name}) x${quantity}`,
      action: {
        label: 'View Cart',
        onClick: toggleCart,
      },
    });
  };

  const buyNow = () => {
    if (!product || !selectedVariant) return;
    clearCart();
    addCartItem(product, selectedVariant, quantity);
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <LayoutClient>
        <Container className="py-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div className="aspect-[3/4] animate-pulse bg-muted" />
            <div className="space-y-4">
              <div className="h-4 w-1/4 animate-pulse bg-muted" />
              <div className="h-8 w-3/4 animate-pulse bg-muted" />
              <div className="h-6 w-1/3 animate-pulse bg-muted" />
              <div className="h-32 w-full animate-pulse bg-muted" />
            </div>
          </div>
        </Container>
      </LayoutClient>
    );
  }

  if (!product) {
    return (
      <LayoutClient>
        <Container className="flex min-h-[50vh] items-center justify-center py-16">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold">Product Not Found</h1>
            <p className="mt-2 text-muted-foreground">The product you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/shop" className="mt-6 inline-block border px-6 py-2 hover:bg-muted">
              Browse Products
            </Link>
          </div>
        </Container>
      </LayoutClient>
    );
  }

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <LayoutClient>
      {/* Breadcrumb */}
      <Container className="py-4 lg:py-6">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="hover:text-foreground">Shop</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/category/${product.categories[0]}`} className="hover:text-foreground uppercase">
            {product.categories[0]}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>
      </Container>

      <Container className="pb-16 lg:pb-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className={cn(
                'relative aspect-[3/4] cursor-zoom-in overflow-hidden bg-cream-100',
                isZoomed && 'cursor-zoom-out'
              )}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {product.images[selectedImage] && (
                <Image
                  src={product.images[selectedImage].url}
                  alt={product.images[selectedImage].alt}
                  fill
                  className={cn(
                    'object-cover transition-transform duration-500',
                    isZoomed && 'scale-150'
                  )}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              )}

              {/* Badges */}
              <div className="absolute left-4 top-4 flex flex-col gap-2">
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
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((image, idx) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(idx)}
                  className={cn(
                    'relative h-20 w-16 flex-shrink-0 overflow-hidden border-2 bg-muted transition-colors',
                    selectedImage === idx ? 'border-foreground' : 'border-transparent'
                  )}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {product.brand}
            </p>

            {/* Title */}
            <h1 className="font-serif text-2xl font-bold lg:text-3xl">{product.name}</h1>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-xl font-semibold lg:text-2xl">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i < Math.floor(product.rating)
                        ? 'text-amber-500 fill-current'
                        : 'text-gray-300'
                    )}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Short Description */}
            <p className="text-muted-foreground">{product.shortDescription}</p>

            {/* Options */}
            {product.options.map((option) => (
              <div key={option.id}>
                <label className="mb-2 block text-sm font-medium">
                  {option.displayName}: <span className="font-normal">{selectedOptions[option.name]}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {option.values.map((value) => (
                    <button
                      key={value.id}
                      onClick={() => setSelectedOptions(prev => ({ ...prev, [option.name]: value.name }))}
                      className={cn(
                        'border px-4 py-2 text-sm transition-colors',
                        selectedOptions[option.name] === value.name
                          ? 'border-foreground bg-foreground text-background'
                          : 'hover:bg-muted'
                      )}
                    >
                      {value.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div>
              <label className="mb-2 block text-sm font-medium">Quantity</label>
              <div className="inline-flex items-center border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 transition-colors hover:bg-muted"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 transition-colors hover:bg-muted"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Stock Status */}
            {selectedVariant && (
              <p className={cn(
                'text-sm font-medium',
                selectedVariant.inStock ? 'text-success' : 'text-error'
              )}>
                {selectedVariant.inStock ? `${selectedVariant.stockQuantity} in stock` : 'Out of Stock'}
              </p>
            )}

            {/* Add to Cart */}
            <div className="flex gap-3">
              <button
                onClick={addToCart}
                disabled={!selectedVariant?.inStock}
                className="flex flex-1 items-center justify-center gap-2 border border-foreground bg-transparent py-4 font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingBag className="h-5 w-5" />
                Add to Cart
              </button>
              <button
                onClick={buyNow}
                disabled={!selectedVariant?.inStock}
                className="flex flex-1 items-center justify-center gap-2 bg-foreground py-4 text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Buy Now
              </button>
              <button
                onClick={() => {
                  if (isInWishlist(product.id)) {
                    removeItem(product.id);
                  } else {
                    addItem(product);
                  }
                }}
                className={cn(
                  "border px-4 py-4 text-lg transition-colors hover:bg-muted hidden sm:block",
                  isInWishlist(product.id) ? "text-maroon-600" : "text-foreground"
                )}
              >
                <Heart className="h-5 w-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 border-t pt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-4 w-4" />
                <span>Free shipping over 500K</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
                <span>14-day returns</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure checkout</span>
              </div>
            </div>

            {/* Description */}
            <div className="border-t pt-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Description</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            </div>

            {/* Details */}
            <div className="border-t pt-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Details</h3>
              <dl className="space-y-2 text-sm">
                {product.material && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Material</dt>
                    <dd>{product.material}</dd>
                  </div>
                )}
                {product.careInstructions && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Care</dt>
                    <dd className="text-right">{product.careInstructions}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">SKU</dt>
                  <dd>{product.sku}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        {/* Customer Reviews Section */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t pt-16">
            <h2 className="mb-8 font-serif text-2xl font-semibold">You May Also Like</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {relatedProducts.map((relProduct, idx) => (
                <FadeIn key={relProduct.id} delay={idx * 50}>
                  <ProductCard product={relProduct} />
                </FadeIn>
              ))}
            </div>
          </section>
        )}
      </Container>
    </LayoutClient>
  );
}
