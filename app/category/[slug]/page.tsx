'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { api } from '@/lib/api';
import { SortOption, Category } from '@/lib/types';
import { ProductCard, ProductCardSkeleton } from '@/components/product';
import { LayoutClient } from '@/components/layout/LayoutClient';
import { Container } from '@/components/shared';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Terbaru' },
  { value: 'bestselling', label: 'Terlaris' },
  { value: 'price_asc', label: 'Harga: Rendah ke Tinggi' },
  { value: 'price_desc', label: 'Harga: Tinggi ke Rendah' },
  { value: 'name_asc', label: 'Nama: A-Z' },
  { value: 'name_desc', label: 'Nama: Z-A' },
];

const priceRanges = [
  { label: 'Di bawah Rp 300.000', min: 0, max: 300000 },
  { label: 'Rp 300.000 - Rp 500.000', min: 300000, max: 500000 },
  { label: 'Rp 500.000 - Rp 800.000', min: 500000, max: 800000 },
  { label: 'Rp 800.000 - Rp 1.000.000', min: 800000, max: 1000000 },
  { label: 'Di atas Rp 1.000.000', min: 1000000, max: Infinity },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Awaited<ReturnType<typeof api.getProducts>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [selectedPriceRange, setSelectedPriceRange] = useState<number[] | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [categoryData, productsData] = await Promise.all([
          api.getCategoryBySlug(slug),
          api.getProducts({
            category: slug,
            sortBy,
            minPrice: selectedPriceRange?.[0],
            maxPrice: selectedPriceRange?.[1] === Infinity ? undefined : selectedPriceRange?.[1],
            page: 1,
            limit: 12,
          }),
        ]);
        setCategory(categoryData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [slug, sortBy, selectedPriceRange, selectedSizes]);

  const handlePriceChange = (range: number[] | null) => {
    setSelectedPriceRange(range);
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const clearFilters = () => {
    setSelectedPriceRange(null);
    setSelectedSizes([]);
    setSortBy('newest');
  };

  const hasActiveFilters = selectedPriceRange !== null || selectedSizes.length > 0;

  return (
    <LayoutClient>
      {/* Category Header */}
      <section className="relative h-48 sm:h-64 lg:h-80">
        {category?.image && (
          <div className="absolute inset-0">
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>
        )}
        <Container className="relative flex h-full items-end pb-8">
          <div className="text-white">
            <h1 className="font-serif text-3xl font-bold sm:text-4xl lg:text-5xl">
              {category?.name || 'Products'}
            </h1>
            {category?.description && (
              <p className="mt-2 max-w-xl text-white/80">{category.description}</p>
            )}
          </div>
        </Container>
      </section>

      {/* Filters & Products */}
      <section className="py-8 lg:py-12">
        <Container>
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors',
                  isFilterOpen || hasActiveFilters
                    ? 'bg-foreground text-background'
                    : 'border hover:bg-muted'
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
                {hasActiveFilters && (
                  <span className="ml-1 flex h-4 w-4 items-center justify-center bg-white text-xs text-foreground">
                    {(selectedPriceRange ? 1 : 0) + selectedSizes.length}
                  </span>
                )}
              </button>

              {/* Active filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 border px-4 py-2 text-sm"
              >
                Sort: {sortOptions.find(o => o.value === sortBy)?.label}
                <ChevronDown className={cn('h-4 w-4 transition-transform', isSortOpen && 'rotate-180')} />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-full z-10 mt-1 w-56 border bg-background shadow-lg">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setIsSortOpen(false);
                      }}
                      className={cn(
                        'block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-muted',
                        sortBy === option.value && 'font-medium'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="mb-8 grid gap-8 border-b pb-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Price Filter */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">Harga</h3>
                <div className="space-y-2">
                  {priceRanges.map((range) => (
                    <label key={range.label} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="price"
                        checked={selectedPriceRange?.[0] === range.min}
                        onChange={() => handlePriceChange([range.min, range.max])}
                        className="h-4 w-4 border-foreground"
                      />
                      <span className="text-sm">{range.label}</span>
                    </label>
                  ))}
                  {selectedPriceRange && (
                    <button
                      onClick={() => handlePriceChange(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear price filter
                    </button>
                  )}
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">Ukuran</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={cn(
                        'border px-3 py-1.5 text-sm transition-colors',
                        selectedSizes.includes(size)
                          ? 'border-foreground bg-foreground text-background'
                          : 'hover:bg-muted'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <h3 className="mb-3 text-sm font-semibold">Ketersediaan</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 border-foreground"
                    defaultChecked
                  />
                  <span className="text-sm">Hanya yang tersedia</span>
                </label>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products && products.data.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {products.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {products.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {Array.from({ length: products.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => router.push(`${window.location.pathname}?page=${page}`)}
                      className={cn(
                        'h-10 w-10 border text-sm transition-colors',
                        products.page === page
                          ? 'border-foreground bg-foreground text-background'
                          : 'hover:bg-muted'
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your filters or browse other categories.
              </p>
              <Link
                href="/shop"
                className="mt-6 inline-block border px-6 py-2 text-sm font-medium hover:bg-muted"
              >
                Browse All Products
              </Link>
            </div>
          )}
        </Container>
      </section>
    </LayoutClient>
  );
}
