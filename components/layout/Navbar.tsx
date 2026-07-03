'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore, useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { mockCategories } from '@/lib/mock-data';

const navigation: { name: string; href: string; highlight?: boolean }[] = [
  { name: 'New Season', href: '/collection/new-season', highlight: true },
  { name: 'Tops', href: '/category/tops' },
  { name: 'Bottoms', href: '/category/bottoms' },
  { name: 'Outerwear', href: '/category/outerwear' },
  { name: 'Dresses', href: '/category/dresses' },
  { name: 'Accessories', href: '/category/accessories' },
  { name: 'Bags', href: '/category/bags' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const { items } = useCartStore();
  const { isMobileMenuOpen, setMobileMenuOpen, toggleCart } = useUIStore();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-navy-900 py-2 text-center text-xs text-white">
        <p>Free shipping for orders above IDR 500.000 | Use code: <span className="font-semibold">DCNEW</span> for 10% off</p>
      </div>

      {/* Main navbar */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-300',
          isScrolled
            ? 'bg-background/95 backdrop-blur-md border-b'
            : 'bg-background'
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Logo */}
            <Link
              href="/"
              className="font-serif text-2xl font-semibold tracking-tight lg:text-3xl"
            >
              D&apos;commerce
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex lg:gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-foreground/70',
                    item.highlight ? 'text-maroon-600' : 'text-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search - Desktop */}
              <div className="hidden lg:block">
                {isSearchOpen ? (
                  <form onSubmit={handleSearch} className="flex items-center">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-64 border-b border-foreground/20 bg-transparent py-1 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
                      autoFocus
                    />
                    <button type="button" onClick={() => setIsSearchOpen(false)} className="ml-2">
                      <X className="h-4 w-4" />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 text-foreground hover:text-foreground/70"
                    aria-label="Search"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* User */}
              <Link
                href="/account"
                className="p-2 text-foreground hover:text-foreground/70"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-foreground hover:text-foreground/70"
                aria-label={`Cart with ${totalItems} items`}
              >
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center bg-navy-900 text-[10px] font-medium text-white">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-background lg:hidden transition-transform duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col pt-20">
          {/* Mobile Search */}
          <div className="px-4 py-4 border-b">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full border-b border-foreground/20 bg-transparent py-2 text-sm placeholder:text-muted-foreground focus:border-foreground focus:outline-none"
              />
              <button type="submit" className="p-2">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block py-3 text-base font-medium transition-colors',
                      item.highlight ? 'text-maroon-600' : 'text-foreground',
                      'hover:text-foreground/70'
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Categories */}
            <div className="mt-8 border-t pt-8">
              <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                All Categories
              </p>
              <ul className="space-y-1">
                {mockCategories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="block py-2 text-sm text-foreground hover:text-foreground/70"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Mobile Footer */}
          <div className="border-t p-4">
            <Link
              href="/account"
              className="block py-3 text-sm font-medium text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Account
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
