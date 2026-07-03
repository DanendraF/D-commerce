// ============================================
// Product Types - Generic for any data source
// ============================================

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  images: ProductImage[];
  categories: string[];
  categoryIds: string[];
  variants: ProductVariant[];
  options: ProductOption[];
  tags: string[];
  isFeatured: boolean;
  isNew: boolean;
  inStock: boolean;
  stockQuantity: number;
  rating: number;
  reviewCount: number;
  brand: string;
  material?: string;
  careInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  position: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  options: Record<string, string>;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  inStock: boolean;
  image?: ProductImage;
}

export interface ProductOption {
  id: string;
  name: string;
  displayName: string;
  position: number;
  values: ProductOptionValue[];
}

export interface ProductOptionValue {
  id: string;
  name: string;
  label: string;
  colorCode?: string;
  position: number;
}

// ============================================
// Category Types
// ============================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  productCount: number;
  displayOrder: number;
}

// ============================================
// Cart Types
// ============================================

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  appliedCoupons: AppliedCoupon[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppliedCoupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
}

// ============================================
// Order Types
// ============================================

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type FulfillmentStatus =
  | 'unfulfilled'
  | 'partial'
  | 'fulfilled';

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  notes?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image: string;
  options: Record<string, string>;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
  icon?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentType;
  code: string;
  icon?: string;
}

export type PaymentType = 'bank_transfer' | 'e_wallet' | 'credit_card' | 'debit_card' | 'cod';

// ============================================
// Address Types
// ============================================

export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  province?: string;
  postalCode: string;
  country: string;
  countryId?: string;
  isDefault?: boolean;
  label?: string;
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Filter Types
// ============================================

export interface ProductFilters {
  category?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  search?: string;
  sortBy?: SortOption;
  page?: number;
  limit?: number;
}

export type SortOption =
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'bestselling'
  | 'rating';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ============================================
// Payment Gateway Types (Ready for integration)
// ============================================

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  method: PaymentType;
  customerEmail: string;
  customerPhone: string;
  callbackUrl: string;
  successRedirectUrl: string;
  failureRedirectUrl: string;
}

export interface PaymentResponse {
  transactionId: string;
  orderId: string;
  status: PaymentStatus;
  paymentUrl?: string;
  qrCode?: string;
  vaNumber?: string;
  instructions?: string[];
  expiresAt?: string;
}

export interface PaymentCallback {
  orderId: string;
  transactionId: string;
  transactionStatus: string;
  paymentType: string;
  grossAmount: number;
  signatureKey: string;
}

// ============================================
// Checkout Types
// ===========================================

export interface CheckoutState {
  step: CheckoutStep;
  shippingAddress?: Address;
  billingAddress?: Address;
  useSameAddress: boolean;
  shippingMethod?: ShippingMethod;
  paymentMethod?: PaymentMethod;
}

export type CheckoutStep = 'address' | 'shipping' | 'payment' | 'review';

// ============================================
// Review Types
// ============================================

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

// ============================================
// Banner/Promo Types
// ============================================

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  imageMobile?: string;
  link?: string;
  buttonText?: string;
  position: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  productCount: number;
  displayOrder: number;
}
