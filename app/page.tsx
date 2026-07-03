import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/product';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container, FadeIn } from '@/components/shared';

export const metadata: Metadata = {
  title: "D'commerce - Premium Fashion",
  description: 'Discover timeless elegance with our curated collection of premium fashion pieces.',
};

export default async function HomePage() {
  const [banners, categories, collections, featuredProducts, newArrivals] = await Promise.all([
    api.getBanners(),
    api.getCategories(),
    api.getCollections(),
    api.getFeaturedProducts(),
    api.getNewArrivals(),
  ]);

  const heroBanner = banners[0];

  return (
    <LayoutClient>
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] lg:h-[85vh]">
        {heroBanner && (
          <div className="absolute inset-0">
            <Image
              src={heroBanner.image}
              alt={heroBanner.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 to-transparent" />
          </div>
        )}
        <Container className="relative flex h-full items-center">
          <div className="max-w-lg pt-20 lg:pt-0">
            <FadeIn>
              <span className="text-xs font-medium uppercase tracking-widest text-white/80">
                {heroBanner?.subtitle || 'New Collection'}
              </span>
            </FadeIn>
            <FadeIn delay={100}>
              <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {heroBanner?.title || 'Timeless Elegance'}
              </h1>
            </FadeIn>
            <FadeIn delay={200}>
              <p className="mt-4 text-base text-white/80 sm:text-lg">
                Discover our curated collection of premium fashion pieces designed for the modern lifestyle.
              </p>
            </FadeIn>
            <FadeIn delay={300}>
              <Link
                href={heroBanner?.link || '/collection/new-season'}
                className="mt-8 inline-block bg-white px-8 py-4 text-sm font-medium text-navy-900 transition-colors hover:bg-cream-100"
              >
                {heroBanner?.buttonText || 'Explore Collection'}
              </Link>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Featured Collections */}
      <section className="py-16 lg:py-24">
        <Container>
          <FadeIn>
            <div className="mb-10 text-center">
              <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Featured Collections</h2>
              <p className="mt-2 text-muted-foreground">Curated styles for every occasion</p>
            </div>
          </FadeIn>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection, idx) => (
              <FadeIn key={collection.id} delay={idx * 100}>
                <Link
                  href={`/collection/${collection.slug}`}
                  className="group relative block aspect-[4/5] overflow-hidden sm:aspect-[3/4]"
                >
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="font-serif text-xl font-semibold">{collection.name}</h3>
                    <p className="mt-1 text-sm text-white/80">{collection.productCount} Products</p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* Shop by Category */}
      <section className="bg-cream-100 py-16 lg:py-24">
        <Container>
          <FadeIn>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Shop by Category</h2>
                <p className="mt-2 text-muted-foreground">Find your perfect style</p>
              </div>
              <Link
                href="/categories"
                className="text-sm font-medium underline-offset-4 hover:underline"
              >
                View All
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category, idx) => (
              <FadeIn key={category.id} delay={idx * 50}>
                <Link
                  href={`/category/${category.slug}`}
                  className="group relative block aspect-square overflow-hidden"
                >
                  <Image
                    src={category.image || ''}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
                  <div className="absolute inset-0 flex items-end justify-center p-4">
                    <span className="font-serif text-lg font-semibold text-white">
                      {category.name}
                    </span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* New Arrivals */}
      <section className="py-16 lg:py-24">
        <Container>
          <FadeIn>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="font-serif text-2xl font-semibold sm:text-3xl">New Arrivals</h2>
                <p className="mt-2 text-muted-foreground">The latest additions to our collection</p>
              </div>
              <Link
                href="/new-arrivals"
                className="text-sm font-medium underline-offset-4 hover:underline"
              >
                View All
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {newArrivals.slice(0, 4).map((product, idx) => (
              <FadeIn key={product.id} delay={idx * 100}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>

      {/* Feature Banner */}
      <section className="relative h-[50vh] lg:h-[70vh]">
        <Image
          src="https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg"
          alt="Essential Collection"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <Container className="relative flex h-full items-center justify-end">
          <div className="max-w-lg text-right">
            <FadeIn>
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                Essential Edit
              </h2>
            </FadeIn>
            <FadeIn delay={100}>
              <p className="mt-4 text-white/90">
                Timeless pieces that form the foundation of every wardrobe. Quality over quantity.
              </p>
            </FadeIn>
            <FadeIn delay={200}>
              <Link
                href="/collection/essential-edit"
                className="mt-6 inline-block border-2 border-white bg-transparent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-white hover:text-navy-900"
              >
                Explore
              </Link>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24">
        <Container>
          <FadeIn>
            <div className="mb-10 text-center">
              <h2 className="font-serif text-2xl font-semibold sm:text-3xl">Best Sellers</h2>
              <p className="mt-2 text-muted-foreground">Our most loved pieces</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {featuredProducts.slice(0, 8).map((product, idx) => (
              <FadeIn key={product.id} delay={idx * 75}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={200}>
            <div className="mt-12 text-center">
              <Link
                href="/shop"
                className="inline-block border px-8 py-3 text-sm font-medium transition-colors hover:bg-muted"
              >
                View All Products
              </Link>
            </div>
          </FadeIn>
        </Container>
      </section>

      {/* Brand Promise */}
      <section className="bg-navy-900 py-16 text-white lg:py-24">
        <Container>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FadeIn>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-white/30">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-semibold">Premium Quality</h3>
                <p className="mt-2 text-sm text-white/70">
                  Carefully selected materials and craftsmanship
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-white/30">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold">Fair Pricing</h3>
                <p className="mt-2 text-sm text-white/70">
                  Direct from us, no middleman markup
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-white/30">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h3 className="font-semibold">Free Shipping</h3>
                <p className="mt-2 text-sm text-white/70">
                  On all orders above IDR 500.000
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={300}>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-white/30">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 className="font-semibold">Easy Returns</h3>
                <p className="mt-2 text-sm text-white/70">
                  14-day return policy for your peace of mind
                </p>
              </div>
            </FadeIn>
          </div>
        </Container>
      </section>

      {/* Instagram Feed Placeholder */}
      <section className="py-16 lg:py-24">
        <Container>
          <FadeIn>
            <div className="mb-10 text-center">
              <h2 className="font-serif text-2xl font-semibold sm:text-3xl">@dcommerce on Instagram</h2>
              <p className="mt-2 text-muted-foreground">Follow us for daily inspiration</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {[
              'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg',
              'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
              'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
              'https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg',
              'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
              'https://images.pexels.com/photos/4544158/pexels-photo-4544158.jpeg'
            ].map((url, idx) => (
              <FadeIn key={idx} delay={idx * 50}>
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block aspect-square overflow-hidden"
                >
                  <Image
                    src={url}
                    alt="Instagram post"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </Container>
      </section>
    </LayoutClient>
  );
}
