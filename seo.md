# SEO.md

## D'Commerce Next.js SEO Guidelines

This guide focuses on Search Engine Optimization best practices tailored specifically for the **Next.js App Router** architecture used in this project.

### 1. The Metadata API
Next.js App Router handles HTML `<head>` tags automatically via the Metadata API. **Do not** manually inject `<title>` or `<meta>` tags in your layouts/pages.

**Static Metadata (e.g., in `layout.tsx` or static pages):**
```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "D'commerce - Premium Fashion",
  description: "Shop the best premium fashion with secure checkout.",
  openGraph: {
    title: "D'commerce - Premium Fashion",
    images: ['/og-image.jpg'],
  }
};
```

**Dynamic Metadata (e.g., for Odoo Products):**
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id);
  return {
    title: `${product.name} | D'commerce`,
    description: product.description,
  };
}
```

---

### 2. Sitemaps (`sitemap.ts`)
Instead of manually creating an XML file, use Next.js `sitemap.ts` in the `app` directory to generate sitemaps dynamically from Odoo products and static routes.

- Generate sitemap dynamically based on Odoo database.
- Exclude private routes (`/account`, `/checkout`, `/admin`).

---

### 3. Robots (`robots.ts`)
Use `app/robots.ts` to programmatically instruct search engine crawlers.

- **Allow:** `/`
- **Disallow:** `/api/`, `/checkout/`, `/account/`
- Link to your dynamic sitemap.

---

### 4. Canonical URLs
Prevent duplicate content penalties by explicitly setting canonical URLs in your Metadata:

```typescript
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://your-domain.com/products/wireless-mouse',
  },
};
```

---

### 5. Semantic HTML & Components
- Use `<h1>` **only once** per page. Next.js will not enforce this, so you must be disciplined in your JSX.
- Follow up with `<h2>`, `<h3>` logically.
- Use Next.js `<Link href="...">` for internal routing. Avoid generic anchor texts like "Click Here"; use "View our Jackets".
- Always provide `alt` text in the `next/image` component: `<Image alt="Product Description" />`.

---

### 6. Structured Data (JSON-LD)
Inject schema markup using the `<script type="application/ld+json">` tag safely in Next.js to help Google understand your products.

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'IDR',
      },
    }),
  }}
/>
```

---

### 7. Custom Error Pages
- Provide a `not-found.tsx` to handle 404s gracefully without dropping users into a generic browser error.
- Next.js automatically sets the 404 HTTP status code.

---

### 8. Pre-Deployment SEO Checklist

- [ ] `export const metadata` is present on all major pages.
- [ ] `sitemap.ts` is configured and successfully fetches Odoo products.
- [ ] `robots.ts` blocks checkout and user account areas.
- [ ] `next/image` is used globally with proper `alt` text.
- [ ] Odoo product pages include JSON-LD Structured Data.
- [ ] OpenGraph (`og:image`) images are optimized and present.

---

### 9. SEO Anti-Patterns to Avoid

- ❌ Manually writing `<title>` in standard JSX (use Metadata API instead).
- ❌ Indexing staging environments or localhost.
- ❌ Using `<a href>` for internal navigation instead of Next.js `<Link>`.
- ❌ Relying purely on client-side rendering (`"use client"`) for heavy content pages (e.g., Blog or Product detail). Use Server Components to ensure HTML is fully readable by crawlers immediately.