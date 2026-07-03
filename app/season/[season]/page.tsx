'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Product } from '@/lib/types';
import { ProductCard, ProductCardSkeleton } from '@/components/product';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container, FadeIn } from '@/components/shared';
import Link from 'next/link';

interface SeasonInfo {
  name: string;
  title: string;
  description: string;
  image: string;
  color: string;
}

const seasons: Record<string, SeasonInfo> = {
  spring: {
    name: 'Spring Collection',
    title: 'Spring Collection',
    description: 'Fresh blooms and lighter layers. Embrace the season of renewal with our spring collection featuring soft pastels, breathable fabrics, and nature-inspired designs.',
    image: 'https://images.pexels.com/photos/2681252/pexels-photo-2681252.jpeg',
    color: 'from-pink-900/50 to-transparent',
  },
  summer: {
    name: 'Summer Collection',
    title: 'Summer Collection',
    description: 'Light fabrics and vibrant styles for the warm days ahead. Discover breezy silhouettes and sun-kissed palettes perfect for beach getaways and city adventures.',
    image: 'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg',
    color: 'from-amber-900/50 to-transparent',
  },
  autumn: {
    name: 'Autumn Collection',
    title: 'Autumn Collection',
    description: 'Earthy tones and layered looks. Celebrate the beauty of fall with rich textures, warm hues, and cozy essential pieces for the transitional season.',
    image: 'https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg',
    color: 'from-orange-900/50 to-transparent',
  },
  winter: {
    name: 'Winter Collection',
    title: 'Winter Collection',
    description: 'Luxurious layers and elegant outerwear. Stay warm and stylish with our winter collection featuring premium wools structured coats, and statement accessories.',
    image: 'https://images.pexels.com/photos/1457986/pexels-photo-1457986.jpeg',
    color: 'from-slate-900/60 to-transparent',
  },
};

export default function SeasonPage() {
  const params = useParams();
  const seasonSlug = params.season as string;
  const season = seasons[seasonSlug];

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const featured = await api.getFeaturedProducts();
        setProducts(featured);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (!season) {
    return (
      <LayoutClient>
        <Container className="flex min-h-[50vh] items-center justify-center py-16">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold">Collection Not Found</h1>
            <p className="mt-2 text-muted-foreground">
              The season collection you&apos;re looking for doesn&apos;t exist.
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
      <section className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh]">
        <div className="absolute inset-0">
          <Image
            src={season.image}
            alt={season.title}
            fill
            className="object-cover"
            priority
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${season.color}`} />
        </div>
        <Container className="relative flex h-full items-center">
          <div className="max-w-lg pt-20 lg:pt-0">
            <FadeIn>
              <span className="text-xs font-medium uppercase tracking-widest text-white/80">
                New Season
              </span>
            </FadeIn>
            <FadeIn delay={100}>
              <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {season.title}
              </h1>
            </FadeIn>
            <FadeIn delay={200}>
              <p className="mt-4 text-base text-white/80 sm:text-lg">
                {season.description}
              </p>
            </FadeIn>
            <FadeIn delay={300}>
              <Link
                href={`#${seasonSlug}-products`}
                className="mt-8 inline-block bg-white px-8 py-4 text-sm font-medium text-navy-900 transition-colors hover:bg-cream-100"
              >
                Shop Collection
              </Link>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Season Navigation */}
      <section className="border-b">
        <Container>
          <div className="flex overflow-x-auto no-scrollbar">
            {Object.entries(seasons).map(([slug, info]) => (
              <Link
                key={slug}
                href={`/season/${slug}`}
                className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                  seasonSlug === slug
                    ? 'border-b-2 border-foreground text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {info.name}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Products */}
      <section id={`${seasonSlug}-products`} className="py-12 lg:py-16">
        <Container>
          <div className="mb-8">
            <h2 className="font-serif text-2xl font-semibold">{season.title}</h2>
            <p className="mt-2 text-muted-foreground">
              Curated pieces for the {seasonSlug} season
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {products.map((product, idx) => (
                <FadeIn key={product.id} delay={idx * 50}>
                  <ProductCard product={product} />
                </FadeIn>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Season Features */}
      <section className="bg-cream-100 py-12 lg:py-16">
        <Container>
          <FadeIn>
            <h2 className="mb-8 text-center font-serif text-2xl font-semibold">
              {season.name} Highlights
            </h2>
          </FadeIn>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {['Lightweight Fabrics', 'Seasonal Colors', 'Layering Essentials', 'Limited Editions'].map((feature, idx) => (
              <FadeIn key={feature} delay={idx * 100}>
                <div className="border bg-background p-6 text-center">
                  <h3 className="font-medium">{feature}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Carefully curated for {seasonSlug}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </LayoutClient>
  );
}
