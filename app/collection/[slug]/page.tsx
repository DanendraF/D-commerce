'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Collection, Product } from '@/lib/types';
import { formatPrice } from '@/lib/mock-data';
import { ProductCard, ProductCardSkeleton } from '@/components/product';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container, FadeIn } from '@/components/shared';

export default function CollectionPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const collections = await api.getCollections();
        const found = collections.find(c => c.slug === slug);
        setCollection(found || null);

        // Get featured products for collection
        const featured = await api.getFeaturedProducts();
        setProducts(featured.slice(0, 12));
      } catch (error) {
        console.error('Error fetching collection:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (isLoading) {
    return (
      <LayoutClient>
        <Container className="py-16">
          <div className="animate-pulse">
            <div className="h-64 w-full bg-muted" />
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </Container>
      </LayoutClient>
    );
  }

  if (!collection) {
    return (
      <LayoutClient>
        <Container className="flex min-h-[50vh] items-center justify-center py-16">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold">Collection Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              The collection you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link href="/" className="mt-6 inline-block border px-6 py-2 hover:bg-muted">
              Back to Home
            </Link>
          </div>
        </Container>
      </LayoutClient>
    );
  }

  return (
    <LayoutClient>
      {/* Hero */}
      <section className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh]">
        <div className="absolute inset-0">
          <Image
            src={collection.image}
            alt={collection.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <Container className="relative flex h-full items-end pb-12">
          <div className="text-white">
            <FadeIn>
              <h1 className="font-serif text-4xl font-bold sm:text-5xl lg:text-6xl">
                {collection.name}
              </h1>
            </FadeIn>
            {collection.description && (
              <FadeIn delay={100}>
                <p className="mt-4 max-w-xl text-white/80">{collection.description}</p>
              </FadeIn>
            )}
          </div>
        </Container>
      </section>

      {/* Products */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="mb-8 flex items-center justify-between">
            <p className="text-muted-foreground">{collection.productCount} Products</p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((product, idx) => (
              <FadeIn key={product.id} delay={idx * 50}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </LayoutClient>
  );
}
