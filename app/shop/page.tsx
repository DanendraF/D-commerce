import { Metadata } from 'next';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/product';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container, FadeIn } from '@/components/shared';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Shop All',
  description: 'Browse all products from D\'commerce premium fashion collection.',
};

export default async function ShopPage() {
  const products = await api.getProducts({ limit: 24 });
  const categories = await api.getCategories();

  return (
    <LayoutClient>
      {/* Header */}
      <section className="bg-cream-100 py-12 lg:py-16">
        <Container>
          <FadeIn>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
              Shop All
            </h1>
            <p className="mt-2 text-muted-foreground">
              Explore our complete collection of premium fashion pieces
            </p>
          </FadeIn>
        </Container>
      </section>

      {/* Category Quick Links */}
      <section className="border-b py-6">
        <Container>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="border bg-foreground px-4 py-2 text-sm font-medium text-background"
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Products Grid */}
      <section className="py-12 lg:py-16">
        <Container>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.data.map((product, idx) => (
              <FadeIn key={product.id} delay={idx * 50}>
                <ProductCard product={product} />
              </FadeIn>
            ))}
          </div>

          {/* Load More */}
          {products.hasMore && (
            <div className="mt-12 text-center">
              <button className="border px-8 py-3 text-sm font-medium transition-colors hover:bg-muted">
                Load More Products
              </button>
            </div>
          )}
        </Container>
      </section>
    </LayoutClient>
  );
}
