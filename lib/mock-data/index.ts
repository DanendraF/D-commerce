import {
  Product,
  Category,
  Banner,
  Collection,
  ShippingMethod,
  Order,
  OrderStatus,
  PaymentStatus,
} from '@/lib/types';

// ============================================
// Categories
// ============================================

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Tops',
    slug: 'tops',
    description: 'Premium tops collection for various occasions',
    image: 'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg',
    productCount: 45,
    displayOrder: 1,
  },
  {
    id: 'cat-2',
    name: 'Bottoms',
    slug: 'bottoms',
    description: 'Elegant design pants and skirts',
    image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
    productCount: 32,
    displayOrder: 2,
  },
  {
    id: 'cat-3',
    name: 'Outerwear',
    slug: 'outerwear',
    description: 'Premium blazers, shirts, and outerwear',
    image: 'https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg',
    productCount: 28,
    displayOrder: 3,
  },
  {
    id: 'cat-4',
    name: 'Dresses',
    slug: 'dresses',
    description: 'Elegant dresses for every special moment',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    productCount: 36,
    displayOrder: 4,
  },
  {
    id: 'cat-5',
    name: 'Accessories',
    slug: 'accessories',
    description: 'The perfect finishing touch for your look',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    productCount: 52,
    displayOrder: 5,
  },
  {
    id: 'cat-6',
    name: 'Bags',
    slug: 'bags',
    description: 'Premium bag collection with the best quality',
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
    productCount: 24,
    displayOrder: 6,
  },
];

// ============================================
// Collections
// ============================================

export const mockCollections: Collection[] = [
  {
    id: 'col-1',
    name: 'New Season',
    slug: 'new-season',
    description: 'This season\'s latest collection with a modern touch',
    image: 'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg',
    productCount: 24,
    displayOrder: 1,
  },
  {
    id: 'col-2',
    name: 'Essential Edit',
    slug: 'essential-edit',
    description: 'Basic wardrobe essentials for everyone',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    productCount: 18,
    displayOrder: 2,
  },
  {
    id: 'col-3',
    name: 'Evening Wear',
    slug: 'evening-wear',
    description: 'Elegant attire for evening events',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    productCount: 12,
    displayOrder: 3,
  },
];

// ============================================
// Banners
// ============================================

export const mockBanners: Banner[] = [
  {
    id: 'ban-1',
    title: 'New Season Collection',
    subtitle: 'Discover the latest collection with modern and elegant designs',
    image: 'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg',
    imageMobile: 'https://images.pexels.com/photos/4544158/pexels-photo-4544158.jpeg',
    link: '/collection/new-season',
    buttonText: 'View Collection',
    position: 1,
    isActive: true,
  },
  {
    id: 'ban-2',
    title: 'Essential Edit',
    subtitle: 'High-quality basic clothing for everyday wear',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
    link: '/collection/essential-edit',
    buttonText: 'Explore',
    position: 2,
    isActive: true,
  },
];

// ============================================
// Products
// ============================================

const createProduct = (
  id: string,
  name: string,
  category: string,
  price: number,
  images: string[],
  isNew = false,
  isFeatured = false
): Product => ({
  id,
  sku: `SKU-${id}`,
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-'),
  description: `${name} with premium quality. Made with high-quality materials and timeless design. Suitable for various occasions, from casual to formal.`,
  shortDescription: `${name} premium with an elegant design`,
  price,
  compareAtPrice: isNew ? undefined : Math.round(price * 1.15),
  images: images.map((url, idx) => ({
    id: `img-${id}-${idx}`,
    url,
    alt: name,
    isPrimary: idx === 0,
    position: idx,
  })),
  categories: [category],
  categoryIds: [mockCategories.find(c => c.slug === category)?.id || ''],
  variants: [
    {
      id: `var-${id}-s`,
      productId: id,
      sku: `SKU-${id}-S`,
      name: 'Small',
      options: { size: 'S', color: 'Default' },
      price,
      stockQuantity: 10,
      inStock: true,
    },
    {
      id: `var-${id}-m`,
      productId: id,
      sku: `SKU-${id}-M`,
      name: 'Medium',
      options: { size: 'M', color: 'Default' },
      price,
      stockQuantity: 20,
      inStock: true,
    },
    {
      id: `var-${id}-l`,
      productId: id,
      sku: `SKU-${id}-L`,
      name: 'Large',
      options: { size: 'L', color: 'Default' },
      price,
      stockQuantity: 15,
      inStock: true,
    },
    {
      id: `var-${id}-xl`,
      productId: id,
      sku: `SKU-${id}-XL`,
      name: 'Extra Large',
      options: { size: 'XL', color: 'Default' },
      price,
      stockQuantity: 8,
      inStock: true,
    },
  ],
  options: [
    {
      id: `opt-${id}-size`,
      name: 'size',
      displayName: 'Size',
      position: 1,
      values: [
        { id: `val-${id}-s`, name: 'S', label: 'S', position: 1 },
        { id: `val-${id}-m`, name: 'M', label: 'M', position: 2 },
        { id: `val-${id}-l`, name: 'L', label: 'L', position: 3 },
        { id: `val-${id}-xl`, name: 'XL', label: 'XL', position: 4 },
      ],
    },
  ],
  tags: [category, 'premium', 'local-brand'],
  isFeatured,
  isNew,
  inStock: true,
  stockQuantity: 53,
  rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
  reviewCount: Math.floor(Math.random() * 50) + 10,
  brand: "D'commerce",
  material: '100% Cotton Premium',
  careInstructions: 'Machine wash cold, iron on medium heat',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const mockProducts: Product[] = [
  // Atasan
  createProduct(
    'prod-1',
    'Silk Blouse Premium',
    'tops',
    599000,
    [
      'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg',
      'https://images.pexels.com/photos/4544158/pexels-photo-4544158.jpeg',
      'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg',
    ],
    true,
    true
  ),
  createProduct(
    'prod-2',
    'Linen Shirt Relaxed',
    'tops',
    449000,
    [
      'https://images.pexels.com/photos/4544158/pexels-photo-4544158.jpeg',
      'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg',
    ],
    false,
    true
  ),
  createProduct(
    'prod-3',
    'Kaftan Elegance',
    'tops',
    799000,
    [
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
      'https://images.pexels.com/photos/4544158/pexels-photo-4544158.jpeg',
    ],
    true,
    true
  ),
  // Bawahan
  createProduct(
    'prod-4',
    'Wide Leg Pants Classic',
    'bottoms',
    549000,
    [
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg',
    ],
    false,
    true
  ),
  createProduct(
    'prod-5',
    'Tailored Trousers',
    'bottoms',
    499000,
    [
      'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg',
      'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
    ],
    true,
    false
  ),
  createProduct(
    'prod-6',
    'Pleated Midi Skirt',
    'bottoms',
    479000,
    [
      'https://images.pexels.com/photos/2681252/pexels-photo-2681252.jpeg',
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
    ],
    false,
    true
  ),
  // Outer
  createProduct(
    'prod-7',
    'Oversized Blazer',
    'outerwear',
    899000,
    [
      'https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg',
      'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg',
    ],
    true,
    true
  ),
  createProduct(
    'prod-8',
    'Lightweight Cardigan',
    'outerwear',
    459000,
    [
      'https://images.pexels.com/photos/4544158/pexels-photo-4544158.jpeg',
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
    ],
    false,
    false
  ),
  createProduct(
    'prod-9',
    'Structured Vest',
    'outerwear',
    599000,
    [
      'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg',
      'https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg',
    ],
    false,
    true
  ),
  // Dress
  createProduct(
    'prod-10',
    'Midi Dress Evening',
    'dresses',
    999000,
    [
      'https://images.pexels.com/photos/2681252/pexels-photo-2681252.jpeg',
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
      'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg',
    ],
    true,
    true
  ),
  createProduct(
    'prod-11',
    'Wrap Dress Casual',
    'dresses',
    689000,
    [
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
      'https://images.pexels.com/photos/2681252/pexels-photo-2681252.jpeg',
    ],
    false,
    false
  ),
  createProduct(
    'prod-12',
    'Maxi Dress Bohemian',
    'dresses',
    759000,
    [
      'https://images.pexels.com/photos/2681252/pexels-photo-2681252.jpeg',
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
    ],
    false,
    true
  ),
  // Aksesoris
  createProduct(
    'prod-13',
    'Silk Scarf Deluxe',
    'accessories',
    299000,
    [
      'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
      'https://images.pexels.com/photos/1457986/pexels-photo-1457986.jpeg',
    ],
    false,
    true
  ),
  createProduct(
    'prod-14',
    'Leather Belt Heritage',
    'accessories',
    359000,
    [
      'https://images.pexels.com/photos/1457986/pexels-photo-1457986.jpeg',
      'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
    ],
    false,
    false
  ),
  // Tas
  createProduct(
    'prod-15',
    'Tote Bag Premium',
    'bags',
    1199000,
    [
      'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
      'https://images.pexels.com/photos/1457986/pexels-photo-1457986.jpeg',
    ],
    true,
    true
  ),
  createProduct(
    'prod-16',
    'Crossbody Bag Minimalist',
    'bags',
    849000,
    [
      'https://images.pexels.com/photos/1457986/pexels-photo-1457986.jpeg',
      'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
    ],
    false,
    true
  ),
];

// ============================================
// Shipping Methods
// ============================================

export const mockShippingMethods: ShippingMethod[] = [
  {
    id: 'ship-1',
    name: 'Regular',
    description: 'Standard shipping 3-5 business days',
    price: 15000,
    estimatedDays: '3-5 business days',
  },
  {
    id: 'ship-2',
    name: 'Express',
    description: 'Fast shipping 1-2 business days',
    price: 35000,
    estimatedDays: '1-2 business days',
  },
  {
    id: 'ship-3',
    name: 'Same Day',
    description: 'Same-day delivery (selected areas only)',
    price: 50000,
    estimatedDays: 'Today',
  },
];

// ============================================
// Mock Orders
// ============================================

export const mockOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'DC-2024-001234',
    userId: 'user-1',
    status: 'delivered',
    paymentStatus: 'paid',
    fulfillmentStatus: 'fulfilled',
    items: [
      {
        id: 'item-1',
        orderId: 'ord-1',
        productId: 'prod-1',
        variantId: 'var-prod-1-m',
        productName: 'Silk Blouse Premium',
        variantName: 'Medium',
        sku: 'SKU-prod-1-M',
        quantity: 2,
        unitPrice: 599000,
        totalPrice: 1198000,
        image: 'https://images.pexels.com/photos/6311390/pexels-photo-6311390.jpeg',
        options: { size: 'M' },
      },
    ],
    subtotal: 1198000,
    tax: 0,
    shipping: 15000,
    discount: 0,
    total: 1213000,
    currency: 'IDR',
    shippingAddress: {
      firstName: 'Sarah',
      lastName: 'Dewi',
      phone: '+62 812-3456-7890',
      addressLine1: 'Jl. Sudirman No. 123',
      city: 'Jakarta Selatan',
      state: 'DKI Jakarta',
      postalCode: '12190',
      country: 'Indonesia',
    },
    billingAddress: {
      firstName: 'Sarah',
      lastName: 'Dewi',
      phone: '+62 812-3456-7890',
      addressLine1: 'Jl. Sudirman No. 123',
      city: 'Jakarta Selatan',
      state: 'DKI Jakarta',
      postalCode: '12190',
      country: 'Indonesia',
    },
    shippingMethod: mockShippingMethods[0],
    paymentMethod: {
      id: 'pay-1',
      name: 'Bank Transfer BCA',
      type: 'bank_transfer',
      code: 'bca',
    },
    trackingNumber: 'JNE1234567890',
    trackingUrl: 'https://track.jne.co.id/JNE1234567890',
    deliveredAt: '2024-01-20T10:00:00Z',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z',
  },
  {
    id: 'ord-2',
    orderNumber: 'DC-2024-001235',
    userId: 'user-1',
    status: 'shipped',
    paymentStatus: 'paid',
    fulfillmentStatus: 'fulfilled',
    items: [
      {
        id: 'item-2',
        orderId: 'ord-2',
        productId: 'prod-10',
        variantId: 'var-prod-10-s',
        productName: 'Midi Dress Evening',
        variantName: 'Small',
        sku: 'SKU-prod-10-S',
        quantity: 1,
        unitPrice: 999000,
        totalPrice: 999000,
        image: 'https://images.pexels.com/photos/2681252/pexels-photo-2681252.jpeg',
        options: { size: 'S' },
      },
    ],
    subtotal: 999000,
    tax: 0,
    shipping: 35000,
    discount: 0,
    total: 1034000,
    currency: 'IDR',
    shippingAddress: {
      firstName: 'Sarah',
      lastName: 'Dewi',
      phone: '+62 812-3456-7890',
      addressLine1: 'Jl. Sudirman No. 123',
      city: 'Jakarta Selatan',
      state: 'DKI Jakarta',
      postalCode: '12190',
      country: 'Indonesia',
    },
    billingAddress: {
      firstName: 'Sarah',
      lastName: 'Dewi',
      phone: '+62 812-3456-7890',
      addressLine1: 'Jl. Sudirman No. 123',
      city: 'Jakarta Selatan',
      state: 'DKI Jakarta',
      postalCode: '12190',
      country: 'Indonesia',
    },
    shippingMethod: mockShippingMethods[1],
    paymentMethod: {
      id: 'pay-2',
      name: 'GoPay',
      type: 'e_wallet',
      code: 'gopay',
    },
    trackingNumber: 'SICEPAT987654321',
    trackingUrl: 'https://track.sicepat.com/SICEPAT987654321',
    estimatedDelivery: '2024-01-28T18:00:00Z',
    createdAt: '2024-01-25T14:30:00Z',
    updatedAt: '2024-01-26T09:00:00Z',
  },
  {
    id: 'ord-3',
    orderNumber: 'DC-2024-001236',
    userId: 'user-1',
    status: 'processing',
    paymentStatus: 'paid',
    fulfillmentStatus: 'unfulfilled',
    items: [
      {
        id: 'item-3',
        orderId: 'ord-3',
        productId: 'prod-7',
        variantId: 'var-prod-7-l',
        productName: 'Oversized Blazer',
        variantName: 'Large',
        sku: 'SKU-prod-7-L',
        quantity: 1,
        unitPrice: 899000,
        totalPrice: 899000,
        image: 'https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg',
        options: { size: 'L' },
      },
      {
        id: 'item-4',
        orderId: 'ord-3',
        productId: 'prod-4',
        variantId: 'var-prod-4-m',
        productName: 'Wide Leg Pants Classic',
        variantName: 'Medium',
        sku: 'SKU-prod-4-M',
        quantity: 1,
        unitPrice: 549000,
        totalPrice: 549000,
        image: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg',
        options: { size: 'M' },
      },
    ],
    subtotal: 1448000,
    tax: 0,
    shipping: 0,
    discount: 144800,
    total: 1303200,
    currency: 'IDR',
    shippingAddress: {
      firstName: 'Sarah',
      lastName: 'Dewi',
      phone: '+62 812-3456-7890',
      addressLine1: 'Jl. Sudirman No. 123',
      city: 'Jakarta Selatan',
      state: 'DKI Jakarta',
      postalCode: '12190',
      country: 'Indonesia',
    },
    billingAddress: {
      firstName: 'Sarah',
      lastName: 'Dewi',
      phone: '+62 812-3456-7890',
      addressLine1: 'Jl. Sudirman No. 123',
      city: 'Jakarta Selatan',
      state: 'DKI Jakarta',
      postalCode: '12190',
      country: 'Indonesia',
    },
    shippingMethod: { ...mockShippingMethods[0], price: 0 },
    paymentMethod: {
      id: 'pay-3',
      name: 'Kartu Kredit Visa',
      type: 'credit_card',
      code: 'visa',
    },
    createdAt: '2024-01-27T11:00:00Z',
    updatedAt: '2024-01-27T11:30:00Z',
  },
];

// ============================================
// Payment Methods Available
// ============================================

export const mockPaymentMethods = [
  {
    id: 'bank-bca',
    name: 'Bank Transfer BCA',
    type: 'bank_transfer' as const,
    code: 'bca',
    icon: '/icons/bank/bca.svg',
  },
  {
    id: 'bank-mandiri',
    name: 'Bank Transfer Mandiri',
    type: 'bank_transfer' as const,
    code: 'mandiri',
    icon: '/icons/bank/mandiri.svg',
  },
  {
    id: 'bank-bni',
    name: 'Bank Transfer BNI',
    type: 'bank_transfer' as const,
    code: 'bni',
    icon: '/icons/bank/bni.svg',
  },
  {
    id: 'ewallet-gopay',
    name: 'GoPay',
    type: 'e_wallet' as const,
    code: 'gopay',
    icon: '/icons/ewallet/gopay.svg',
  },
  {
    id: 'ewallet-ovo',
    name: 'OVO',
    type: 'e_wallet' as const,
    code: 'ovo',
    icon: '/icons/ewallet/ovo.svg',
  },
  {
    id: 'ewallet-dana',
    name: 'DANA',
    type: 'e_wallet' as const,
    code: 'dana',
    icon: '/icons/ewallet/dana.svg',
  },
  {
    id: 'cc-visa',
    name: 'Kartu Kredit Visa',
    type: 'credit_card' as const,
    code: 'visa',
    icon: '/icons/card/visa.svg',
  },
  {
    id: 'cc-mastercard',
    name: 'Kartu Kredit Mastercard',
    type: 'credit_card' as const,
    code: 'mastercard',
    icon: '/icons/card/mastercard.svg',
  },
];

// ============================================
// Helper functions
// ============================================

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const getDateFromStatus = (status: OrderStatus): string | null => {
  switch (status) {
    case 'delivered':
      return 'Delivered on Jan 20, 2024';
    case 'shipped':
      return 'Estimated arrival: Jan 28, 2024';
    case 'processing':
      return 'Processing';
    case 'confirmed':
      return 'Order confirmed';
    case 'pending':
      return 'Awaiting payment';
    default:
      return null;
  }
};
