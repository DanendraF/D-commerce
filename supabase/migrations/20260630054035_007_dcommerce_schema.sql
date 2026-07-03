/*
# D'commerce E-commerce Schema

This migration creates the complete database schema for the D'commerce fashion e-commerce platform.

## Tables Created:
1. `profiles` - User profile data (extends auth.users)
2. `addresses` - User shipping/billing addresses
3. `categories` - Product categories
4. `products` - Product catalog
5. `product_variants` - Product size/color variants
6. `orders` - Customer orders
7. `order_items` - Items within orders
8. `coupons` - Discount codes

## Security:
- RLS enabled on all tables
- Policies restrict data access to authenticated users' own data
- Admin functions can be added later via service role

## Notes:
- Uses auth.uid() for user identification
- Includes indexes for common queries
- Foreign key relations with cascade deletes where appropriate
*/

-- ============================================
-- User Profiles
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY DEFAULT auth.uid(),
    email text NOT NULL,
    first_name text,
    last_name text,
    phone text,
    avatar_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_own_profile" ON profiles;
CREATE POLICY "users_own_profile" ON profiles FOR SELECT
    TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
    TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = id);

-- ============================================
-- Addresses
-- ============================================
CREATE TABLE IF NOT EXISTS addresses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
    label text,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    address_line1 text NOT NULL,
    address_line2 text,
    city text NOT NULL,
    state text NOT NULL,
    postal_code text NOT NULL,
    country text NOT NULL DEFAULT 'Indonesia',
    is_default boolean DEFAULT false,
    is_shipping boolean DEFAULT true,
    is_billing boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_own_addresses" ON addresses;
CREATE POLICY "user_own_addresses" ON addresses FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_addresses" ON addresses;
CREATE POLICY "insert_own_addresses" ON addresses FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_addresses" ON addresses;
CREATE POLICY "update_own_addresses" ON addresses FOR UPDATE
    TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_addresses" ON addresses;
CREATE POLICY "delete_own_addresses" ON addresses FOR DELETE
    TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ============================================
-- Categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    image_url text,
    parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories FOR SELECT
    TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- ============================================
-- Products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sku text UNIQUE NOT NULL,
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    description text,
    short_description text,
    price integer NOT NULL,
    compare_at_price integer,
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    brand text DEFAULT 'D''commerce',
    material text,
    care_instructions text,
    is_featured boolean DEFAULT false,
    is_new boolean DEFAULT false,
    is_active boolean DEFAULT true,
    rating numeric(3,2) DEFAULT 0,
    review_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_public_read" ON products;
CREATE POLICY "products_public_read" ON products FOR SELECT
    TO anon, authenticated USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_new ON products(is_new) WHERE is_new = true;

-- ============================================
-- Product Images
-- ============================================
CREATE TABLE IF NOT EXISTS product_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url text NOT NULL,
    alt text,
    is_primary boolean DEFAULT false,
    position integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_images_public_read" ON product_images;
CREATE POLICY "product_images_public_read" ON product_images FOR SELECT
    TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- ============================================
-- Product Variants
-- ============================================
CREATE TABLE IF NOT EXISTS product_variants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku text UNIQUE NOT NULL,
    name text NOT NULL,
    size text,
    color text,
    price integer NOT NULL,
    stock_quantity integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_variants_public_read" ON product_variants;
CREATE POLICY "product_variants_public_read" ON product_variants FOR SELECT
    TO anon, authenticated USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- ============================================
-- Orders
-- ============================================
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partially_refunded');

CREATE TABLE IF NOT EXISTS orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number text UNIQUE NOT NULL,
    user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
    status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    shipping_first_name text NOT NULL,
    shipping_last_name text NOT NULL,
    shipping_phone text NOT NULL,
    shipping_address_line1 text NOT NULL,
    shipping_address_line2 text,
    shipping_city text NOT NULL,
    shipping_state text NOT NULL,
    shipping_postal_code text NOT NULL,
    shipping_country text DEFAULT 'Indonesia',
    billing_first_name text NOT NULL,
    billing_last_name text NOT NULL,
    billing_phone text NOT NULL,
    billing_address_line1 text NOT NULL,
    billing_address_line2 text,
    billing_city text NOT NULL,
    billing_state text NOT NULL,
    billing_postal_code text NOT NULL,
    billing_country text DEFAULT 'Indonesia',
    subtotal integer NOT NULL,
    shipping_cost integer DEFAULT 0,
    discount integer DEFAULT 0,
    total integer NOT NULL,
    tracking_number text,
    tracking_url text,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_own_read" ON orders;
CREATE POLICY "orders_own_read" ON orders FOR SELECT
    TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_own_insert" ON orders;
CREATE POLICY "orders_own_insert" ON orders FOR INSERT
    TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- ============================================
-- Order Items
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id) ON DELETE SET NULL,
    variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name text NOT NULL,
    variant_name text,
    sku text NOT NULL,
    quantity integer NOT NULL,
    unit_price integer NOT NULL,
    total_price integer NOT NULL,
    image_url text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_own_read" ON order_items;
CREATE POLICY "order_items_own_read" ON order_items FOR SELECT
    TO authenticated USING (EXISTS (
        SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    ));

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================
-- Coupons
-- ============================================
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');

CREATE TABLE IF NOT EXISTS coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    discount_type coupon_type NOT NULL,
    discount_value integer NOT NULL,
    min_order_amount integer DEFAULT 0,
    max_uses integer,
    current_uses integer DEFAULT 0,
    starts_at timestamptz,
    expires_at timestamptz,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "coupons_public_read" ON coupons;
CREATE POLICY "coupons_public_read" ON coupons FOR SELECT
    TO anon, authenticated USING (is_active = true);

-- ============================================
-- Product Tags (for search/filtering)
-- ============================================
CREATE TABLE IF NOT EXISTS product_tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    tag text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(product_id, tag)
);

ALTER TABLE product_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "product_tags_public_read" ON product_tags;
CREATE POLICY "product_tags_public_read" ON product_tags FOR SELECT
    TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_product_tags_product ON product_tags(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tags_tag ON product_tags(tag);

-- ============================================
-- Cart (server-side persistence)
-- ============================================
CREATE TABLE IF NOT EXISTS carts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "carts_own" ON carts;
CREATE POLICY "carts_own" ON carts FOR ALL
    TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS cart_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id uuid REFERENCES products(id) ON DELETE SET NULL,
    variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
    quantity integer NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_items_own" ON cart_items;
CREATE POLICY "cart_items_own" ON cart_items FOR ALL
    TO authenticated USING (EXISTS (
        SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid()
    ));

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- ============================================
-- Helper Functions
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE OR REPLACE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trigger_addresses_updated_at
    BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate order number function
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
    prefix text := 'DC-';
    date_part text := to_char(now(), 'YYYYMMDD');
    seq int;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 13) AS int)), 0) + 1
    INTO seq FROM orders WHERE order_number LIKE prefix || date_part || '%';
    RETURN prefix || date_part || lpad(seq::text, 4, '0');
END;
$$ LANGUAGE plpgsql;
