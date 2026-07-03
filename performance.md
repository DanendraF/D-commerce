# PERFORMANCE.md

## D'Commerce Web Application Performance Guide

This guide outlines performance best practices tailored for the **Next.js**, **Supabase**, and **Odoo** architecture used in this project.

### 1. Frontend (Next.js)

**Images & Assets:**
- Use `<Image>` component from `next/image` for automatic WebP/AVIF conversion, resizing, and lazy loading.
- Avoid oversized raw images; ensure proper `width` and `height` attributes to prevent Cumulative Layout Shift (CLS).
- Preload critical above-the-fold assets (e.g., hero images).

**Fonts & CSS:**
- Use `next/font` for automatic font optimization and zero layout shift.
- Limit font families and weights.
- Avoid large global CSS imports; utilize Tailwind CSS which automatically purges unused styles in production.

**JavaScript & Components:**
- Utilize React Server Components (RSC) where possible to reduce client-side JS bundle size.
- Dynamically import heavy non-critical components using `next/dynamic`.
- Keep third-party scripts (e.g., Google Analytics) out of the main thread using `next/script` with `strategy="worker"` or `lazyOnload`.

---

### 2. API & Data Fetching

**Supabase:**
- Select only the specific columns needed (e.g., `.select('id, name')` instead of `.select('*')`).
- Use pagination (`.range(0, 9)`) for large lists (like Products).
- Cache frequent queries using React Query or Next.js fetch caching (`{ next: { revalidate: 60 } }`).

**Odoo (XML-RPC):**
- Odoo XML-RPC calls can be slow. Cache product catalogs and static data statically at build time or using Incremental Static Regeneration (ISR).
- Avoid chaining multiple sequential Odoo API calls on the server; use `Promise.all()` to run them in parallel if possible.
- Paginate large Odoo datasets.

---

### 3. Caching Strategy

**Next.js App Router Caching:**
- Leverage **Full Route Cache** for static pages (e.g., About Us, Contact).
- Leverage **Data Cache** for Odoo product queries that don't change every second (e.g., `revalidate: 3600` for 1-hour cache).
- Use **Router Cache** for instant client-side navigation.

**Edge CDN (Vercel/Hosting):**
- Ensure static assets (CSS, JS, Images) are served via CDN.
- Use Edge Functions for lightweight, globally distributed tasks if necessary.

---

### 4. Core Web Vitals Targets

Aim to meet or exceed Google's Core Web Vitals thresholds:

| Metric | Target |
|---------|--------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5 s |
| **INP** (Interaction to Next Paint) | ≤ 200 ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 |
| **FCP** (First Contentful Paint) | ≤ 1.8 s |
| **TTFB** (Time to First Byte) | ≤ 800 ms |

---

### 5. Lighthouse Targets

Aim for the following scores during regular audits:
- **Performance:** ≥ 90
- **Accessibility:** ≥ 90
- **Best Practices:** ≥ 90
- **SEO:** ≥ 90

---

### 6. Performance Anti-Patterns

**Never do the following:**
- ❌ Import giant utility libraries (e.g., full Lodash) instead of specific methods.
- ❌ Fetch data directly from Odoo in a Client Component without a server proxy/caching layer.
- ❌ Render massive lists without virtualization or pagination.
- ❌ Ignore React dependency arrays in `useEffect` (causing infinite re-renders).
- ❌ Store large blobs or base64 images in Supabase Database; use Supabase Storage instead.

---

### 7. Before Deployment Checklist

- [ ] Run `npm run build` locally to check bundle sizes.
- [ ] Ensure all images use `next/image`.
- [ ] Verify ISR/Data caching is enabled for slow Odoo endpoints.
- [ ] Test the site using Lighthouse (Incognito Mode).
- [ ] Monitor Vercel Analytics / Speed Insights after deployment.