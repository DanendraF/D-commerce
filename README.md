# D'Commerce - Premium Fashion E-Commerce

D'Commerce is a modern, headless e-commerce web application designed as a portfolio project to demonstrate full-stack capabilities, ERP integration, and secure payment processing. It focuses on a premium fashion brand aesthetic with a seamless user experience.

## 🚀 Project Overview

| Attribute | Detail |
|-----------|--------|
| **Type** | Single-brand, multi-product E-Commerce |
| **Focus** | Premium fashion / Luxury aesthetic |
| **Goal** | Developer portfolio demonstrating enterprise integrations (Odoo ERP, Supabase, Payment Gateway) |
| **Deployment** | Vercel (Frontend & API) + Odoo Online SaaS + Supabase |

---

## 💻 Tech Stack

### Frontend (Storefront)
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Premium, minimalistic design)
- **State Management:** Zustand (Cart & User State)
- **Image Optimization:** `next/image`

### Backend & Database (Hybrid Architecture)
- **API Layer:** Next.js API Routes (Serverless, no separate Express server)
- **Authentication & User Data:** **Supabase** (PostgreSQL + Auth). Handles login, registration, and multi-address management securely.
- **Product & Order Management (ERP):** **Odoo Online (SaaS)**. Functions as the headless CMS and inventory source of truth via XML-RPC.
- **Payment Gateway:** **Midtrans** (Sandbox). Handles secure checkouts and webhooks for automated order confirmation.

---

## 🏛️ System Architecture

This project utilizes a **Headless Architecture with Split Data Ownership**:

1. **Next.js (Vercel):** Acts as the central hub. Renders the UI and contains all API routes connecting to external services.
2. **Supabase:** Manages sensitive user data (Credentials, Profile, Addresses) to offload the ERP and maintain high security.
3. **Odoo (Sales Module):** Manages the product catalog, prices, and receives incoming Sales Orders from Next.js.
4. **Midtrans:** Processes payments and sends asynchronous webhooks back to Next.js to confirm Odoo Sales Orders.

### Hybrid Stock Management
To utilize Odoo's "One App Free" plan, only the Sales module is active. Next.js handles stock validation manually during checkout and updates Odoo via API upon successful payment, effectively managing inventory without requiring Odoo's paid Inventory module.

---

## ✨ Key Features

- **Premium UI/UX:** High-quality imagery, clean typography (serif headings, sans-serif body), and smooth micro-interactions.
- **Dynamic Product Catalog:** Fetched directly from Odoo ERP in real-time or via ISR (Incremental Static Regeneration).
- **Advanced Cart:** Persistent cart state using Zustand.
- **Multi-Address Management:** Users can save and manage multiple shipping/billing addresses via Supabase.
- **Integrated Checkout:** Seamless multi-step checkout flowing directly into the Midtrans Snap payment popup.
- **Automated Order Processing:** Successful payments trigger webhooks that automatically confirm Sales Orders in Odoo.

---

## 🛠️ Local Development Setup

To run this project locally, you will need Node.js installed on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/dcommerce.git
cd dcommerce
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and populate it with the required keys for Supabase, Midtrans, and Odoo. *(Contact the repository owner for sandbox keys if necessary).*

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Midtrans
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_SERVER_KEY=your_midtrans_server_key

# Odoo
ODOO_URL=your_odoo_url
ODOO_DB=your_odoo_db
ODOO_USERNAME=your_odoo_email
ODOO_PASSWORD=your_odoo_xmlrpc_password
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛡️ Security & Performance
This project strictly adheres to modern web standards:
- **Security:** RLS (Row Level Security) in Supabase, parameterized queries, strict CORS, and secure HTTP-only cookies.
- **Performance:** Optimized images (`next/image`), server-side rendering (SSR/RSC) for fast initial loads, and CDN caching for static assets.
- **SEO:** Dynamic `sitemap.ts`, automatic Metadata API generation, and semantic HTML to ensure excellent lighthouse scores.

---

*Designed and developed as a comprehensive full-stack e-commerce portfolio.*
