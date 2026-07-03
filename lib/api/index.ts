/**
 * Data Fetching Layer
 *
 * This module provides a generic data fetching interface that can be easily
 * adapted to different data sources (Odoo ERP, Supabase, mock data, etc.)
 *
 * To switch data sources:
 * 1. Implement the DataSource interface
 * 2. Update the data source initialization in getDataSource()
 */

import {
  Product,
  Category,
  Collection,
  Banner,
  ProductFilters,
  PaginatedResult,
  Order,
  ShippingMethod,
} from '@/lib/types';
import { mockProducts, mockCategories, mockCollections, mockBanners, mockOrders, mockShippingMethods } from '@/lib/mock-data';
import { getProducts as getOdooProducts, getProductBySlug as getOdooProductBySlug } from '@/lib/odoo';
// ============================================
// Data Source Interface
// ============================================

export interface DataSource {
  // Products
  getProducts(filters?: ProductFilters): Promise<PaginatedResult<Product>>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  getFeaturedProducts(): Promise<Product[]>;
  getNewArrivals(): Promise<Product[]>;
  getRelatedProducts(productId: string, limit?: number): Promise<Product[]>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;

  // Collections
  getCollections(): Promise<Collection[]>;

  // Banners
  getBanners(): Promise<Banner[]>;

  // Orders
  getOrders(userId: string): Promise<Order[]>;
  getOrderById(orderId: string): Promise<Order | null>;
  getOrderByNumber(orderNumber: string): Promise<Order | null>;

  // Shipping
  getShippingMethods(): Promise<ShippingMethod[]>;
}

// ============================================
// Mock Data Source Implementation
// ============================================

class MockDataSource implements DataSource {
  // Simulate network delay
  private delay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getProducts(filters?: ProductFilters): Promise<PaginatedResult<Product>> {
    await this.delay(200);

    let filteredProducts = [...mockProducts];

    // Apply filters
    if (filters?.category) {
      filteredProducts = filteredProducts.filter(p =>
        p.categories.includes(filters.category!)
      );
    }

    if (filters?.categories?.length) {
      filteredProducts = filteredProducts.filter(p =>
        p.categories.some(c => filters.categories!.includes(c))
      );
    }

    if (filters?.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters?.inStock !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.inStock === filters.inStock);
    }

    if (filters?.isFeatured !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.isFeatured === filters.isFeatured);
    }

    if (filters?.isNew !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.isNew === filters.isNew);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    switch (filters?.sortBy) {
      case 'price_asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        filteredProducts.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'bestselling':
      default:
        // No specific sorting, keep original order
        break;
    }

    // Pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const total = filteredProducts.length;
    const offset = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return {
      data: paginatedProducts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: offset + limit < total,
    };
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    await this.delay(200);
    return mockProducts.find(p => p.slug === slug) || null;
  }

  async getProductById(id: string): Promise<Product | null> {
    await this.delay(200);
    return mockProducts.find(p => p.id === id) || null;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    await this.delay(200);
    return mockProducts.filter(p => p.isFeatured);
  }

  async getNewArrivals(): Promise<Product[]> {
    await this.delay(200);
    return mockProducts.filter(p => p.isNew);
  }

  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    await this.delay(200);
    const product = mockProducts.find(p => p.id === productId);
    if (!product) return [];

    return mockProducts
      .filter(p => p.id !== productId && p.categories.some(c => product.categories.includes(c)))
      .slice(0, limit);
  }

  async getCategories(): Promise<Category[]> {
    await this.delay(100);
    return mockCategories;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    await this.delay(100);
    return mockCategories.find(c => c.slug === slug) || null;
  }

  async getCollections(): Promise<Collection[]> {
    await this.delay(100);
    return mockCollections;
  }

  async getBanners(): Promise<Banner[]> {
    await this.delay(100);
    return mockBanners.filter(b => b.isActive);
  }

  async getOrders(userId: string): Promise<Order[]> {
    await this.delay(300);
    return mockOrders.filter(o => o.userId === userId);
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    await this.delay(200);
    return mockOrders.find(o => o.id === orderId) || null;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    await this.delay(200);
    return mockOrders.find(o => o.orderNumber === orderNumber) || null;
  }

  async getShippingMethods(): Promise<ShippingMethod[]> {
    await this.delay(100);
    return mockShippingMethods;
  }
}

// ============================================
// Odoo Data Source Implementation (Template)
// ============================================

/**
 * To implement Odoo integration:
 *
 * class OdooDataSource implements DataSource {
 *   private config = {
 *     url: process.env.ODOO_URL,
 *     db: process.env.ODOO_DB,
 *     username: process.env.ODOO_USERNAME,
 *     apiKey: process.env.ODOO_API_KEY,
 *   };
 *
 *   // Use XML-RPC or JSON-RPC to communicate with Odoo
 *   // Reference: https://www.odoo.com/documentation/16.0/developer/tutorials.html
 * }
 */

// ============================================
// Supabase Data Source Implementation (Template)
// ============================================

/**
 * To implement Supabase integration:
 *
 * import { createClient } from '@supabase/supabase-js';
 *
 * class SupabaseDataSource implements DataSource {
 *   private supabase = createClient(
 *     process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 *   );
 *
 *   async getProducts(filters?: ProductFilters): Promise<PaginatedResult<Product>> {
 *     let query = this.supabase.from('products').select('*');
 *     // Apply filters...
 *     const { data, error, count } = await query;
 *     // Transform and return...
 *   }
 * }
 */

// ============================================
// Hybrid Data Source Implementation
// ============================================

class HybridDataSource implements DataSource {
  private mockSource = new MockDataSource();

  private async fetchOdooProducts(): Promise<Product[]> {
    if (typeof window !== 'undefined') {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch from API');
      return res.json();
    }
    return getOdooProducts();
  }

  private async fetchOdooProductBySlug(slug: string): Promise<Product | null> {
    if (typeof window !== 'undefined') {
      const res = await fetch(`/api/products?slug=${slug}`);
      if (!res.ok) return null;
      return res.json();
    }
    return getOdooProductBySlug(slug);
  }

  async getProducts(filters?: ProductFilters): Promise<PaginatedResult<Product>> {
    try {
      const odooProducts = await this.fetchOdooProducts();
      let filteredProducts = [...odooProducts];

      // Apply filters
      if (filters?.category) {
        filteredProducts = filteredProducts.filter(p => p.categories.includes(filters.category!));
      }
      if (filters?.categories?.length) {
        filteredProducts = filteredProducts.filter(p => p.categories.some(c => filters.categories!.includes(c)));
      }
      if (filters?.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
      }
      if (filters?.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 12;
      const total = filteredProducts.length;
      const offset = (page - 1) * limit;
      const paginatedProducts = filteredProducts.slice(offset, offset + limit);

      return {
        data: paginatedProducts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + limit < total,
      };
    } catch (e) {
      console.error("Failed to fetch from Odoo, falling back to mock data", e);
      return this.mockSource.getProducts(filters);
    }
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const product = await this.fetchOdooProductBySlug(slug);
      return product || await this.mockSource.getProductBySlug(slug);
    } catch (e) {
      console.error("Failed to fetch from Odoo, falling back to mock", e);
      return this.mockSource.getProductBySlug(slug);
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    try {
      const allProducts = await this.fetchOdooProducts();
      const product = allProducts.find(p => p.id === id);
      return product || await this.mockSource.getProductById(id);
    } catch (e) {
      return this.mockSource.getProductById(id);
    }
  }

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const products = await this.fetchOdooProducts();
      return products.slice(0, 8); // Display first 8 as featured
    } catch (e) {
      return this.mockSource.getFeaturedProducts();
    }
  }

  async getNewArrivals(): Promise<Product[]> {
    try {
      const products = await this.fetchOdooProducts();
      return [...products].reverse().slice(0, 8); // Reverse to simulate newest
    } catch (e) {
      return this.mockSource.getNewArrivals();
    }
  }

  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    try {
      const products = await this.fetchOdooProducts();
      const product = products.find(p => p.id === productId);
      if (!product) return [];
      return products
        .filter(p => p.id !== productId && p.categories.some(c => product.categories.includes(c)))
        .slice(0, limit);
    } catch (e) {
      return this.mockSource.getRelatedProducts(productId, limit);
    }
  }

  // Delegate non-product methods to MockSource
  getCategories() { return this.mockSource.getCategories(); }
  getCategoryBySlug(slug: string) { return this.mockSource.getCategoryBySlug(slug); }
  getCollections() { return this.mockSource.getCollections(); }
  getBanners() { return this.mockSource.getBanners(); }
  getOrders(userId: string) { return this.mockSource.getOrders(userId); }
  getOrderById(orderId: string) { return this.mockSource.getOrderById(orderId); }
  getOrderByNumber(orderNumber: string) { return this.mockSource.getOrderByNumber(orderNumber); }
  getShippingMethods() { return this.mockSource.getShippingMethods(); }
}

// ============================================
// Data Source Factory
// ============================================

let dataSourceInstance: DataSource | null = null;

export function getDataSource(): DataSource {
  if (!dataSourceInstance) {
    // Currently using mock data source
    // Switch to another implementation for production
    const useHybrid = true; 

    if (useHybrid) {
      dataSourceInstance = new HybridDataSource();
    } else {
      dataSourceInstance = new MockDataSource();
    }
  }

  return dataSourceInstance;
}

// ============================================
// Convenience exports
// ============================================

export const api = {
  // Products
  getProducts: (filters?: ProductFilters) => getDataSource().getProducts(filters),
  getProductBySlug: (slug: string) => getDataSource().getProductBySlug(slug),
  getProductById: (id: string) => getDataSource().getProductById(id),
  getFeaturedProducts: () => getDataSource().getFeaturedProducts(),
  getNewArrivals: () => getDataSource().getNewArrivals(),
  getRelatedProducts: (productId: string, limit?: number) =>
    getDataSource().getRelatedProducts(productId, limit),

  // Categories
  getCategories: () => getDataSource().getCategories(),
  getCategoryBySlug: (slug: string) => getDataSource().getCategoryBySlug(slug),

  // Collections
  getCollections: () => getDataSource().getCollections(),

  // Banners
  getBanners: () => getDataSource().getBanners(),

  // Orders
  getOrders: (userId: string) => getDataSource().getOrders(userId),
  getOrderById: (orderId: string) => getDataSource().getOrderById(orderId),
  getOrderByNumber: (orderNumber: string) => getDataSource().getOrderByNumber(orderNumber),

  // Shipping
  getShippingMethods: () => getDataSource().getShippingMethods(),
};
