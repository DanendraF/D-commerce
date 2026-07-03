'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export function ShopFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');

  // Update state if URL changes externally
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSort(searchParams.get('sort') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(query, sort);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    setSort(newSort);
    updateUrl(query, newSort);
  };

  const updateUrl = (q: string, s: string) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (s) params.set('sort', s);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
      <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border bg-background px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 bottom-0 px-3 flex items-center text-muted-foreground hover:text-foreground"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </form>
      
      <div className="flex items-center gap-2">
        <label htmlFor="sort" className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</label>
        <select
          id="sort"
          value={sort}
          onChange={handleSortChange}
          className="border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
        >
          <option value="">Featured</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
        </select>
      </div>
    </div>
  );
}
