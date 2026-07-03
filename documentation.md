# PROJECT DOCUMENTATION — Premium Fashion E-Commerce (Portfolio Project)

> Dokumen ini adalah sumber kebenaran (source of truth) untuk konteks AI/asisten coding selama development. Selalu rujuk dokumen ini sebelum membuat keputusan teknis baru, agar tidak keluar dari arah project (out of context).

---

## 1. RINGKASAN PROJECK

| Item | Detail |
|---|---|
| Nama Project | (isi nama brand/project kamu) |
| Tujuan | Portofolio developer — menunjukkan kemampuan fullstack & integrasi sistem enterprise (ERP) |
| Tipe Bisnis | E-commerce fashion, **single brand, multi-product** |
| Target Demo | Di-deploy ke Vercel untuk keperluan showcase (bukan production sungguhan) |
| Status | Frontend UI sudah dibuat (mock data), tahap selanjutnya: integrasi ERP & payment |

---

## 2. STACK TEKNOLOGI

### Frontend
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Context API / Zustand (untuk cart) — *(pilih salah satu, dokumentasikan keputusan akhir di sini setelah implementasi)*
- **Image Optimization**: `next/image`
- **Hosting**: Vercel

### Backend / ERP
- **Sistem ERP**: Odoo **Online (SaaS)**, plan **One App Free** — BUKAN Community Edition self-hosted, BUKAN Docker
- **Modul Odoo yang dipakai**: **Sales saja** (gratis selamanya). Inventory tidak diaktifkan karena versi multi-modul di Odoo Online hanya trial 15 hari lalu berbayar.
- **Protokol API**: XML-RPC / JSON-RPC (built-in Odoo)
- **Peran Odoo**: berfungsi sebagai **admin panel + database produk + manajemen stok dasar**, BUKAN sebagai frontend customer-facing, dan BUKAN tempat nyimpen data User/Akun (lihat bagian User & Auth di bawah)
- **Environment hosting Odoo**: Odoo Online (SaaS), sudah di-hosting oleh Odoo — tidak perlu install/maintain server sendiri, langsung bisa diakses via internet (cocok untuk demo portofolio tanpa tunneling).

### Backend Logic (API Layer)
- **Pendekatan**: **Next.js API Routes** sepenuhnya — TIDAK pakai Express atau backend server terpisah
- **Alasan**: satu deployment di Vercel (gak perlu hosting kedua), cukup powerful untuk handle semua kebutuhan (koneksi Odoo, Supabase, payment gateway), dan menghindari kompleksitas tambahan (CORS, auth lintas server) yang tidak sebanding manfaatnya untuk project portofolio
- Semua logic backend (fetch/update Odoo, auth Supabase, proses payment) ditulis sebagai API Routes (`app/api/...`) atau Server Actions di Next.js

### User & Authentication
- **Sistem**: **Supabase** (Auth + Database/Postgres)
- **Alasan**: data User & Address (akun customer, alamat pengiriman) **TIDAK disimpan di Odoo** — karena modul Contacts (`res.partner`) di Odoo ternyata ikut terhitung sebagai modul tambahan yang memicu trial 15 hari, bukan otomatis included gratis bersama Sales
- **Pembagian tanggung jawab data**:
  - **Supabase**: User, Auth (login/register), Address
  - **Odoo (Sales)**: Produk, harga, varian, stok
  - **Order**: dikirim ke Odoo sebagai Sales Order (data customer dikirim sebagai data dasar/teks, bukan membuat relasi Contact penuh di Odoo)

### Payment (Rencana, belum diimplementasi)
- **Gateway**: Midtrans atau Xendit (sandbox/testing mode)
- **Catatan**: layer payment logic dipisah dari UI agar mudah diganti/diintegrasikan nanti

### Data Sementara (Development/Demo Phase)
- **DummyJSON** / **Fake Store API** — dipakai sementara sebelum koneksi Odoo aktif
- **Unsplash/Pexels** — sumber foto produk untuk preview visual (karena fokus desain premium fashion)

---

## 3. ARSITEKTUR SISTEM

### Konsep Dasar
Project ini menggunakan **headless architecture + hybrid stock logic + split data ownership**. Frontend (Next.js) terhubung ke 2 sumber data berbeda: **Odoo** (produk, harga, stok, order) dan **Supabase** (user, auth, address) — saling terhubung lewat API. Manajemen stok di Odoo memakai pendekatan **hybrid** (lihat Section 3.1).

### Diagram Arsitektur (Text-based)

```
┌──────────────────────────────────────────────┐
│              Next.js (Vercel hosting)         │
│  - Storefront UI, Cart, Checkout, Dashboard   │
│  - Semua backend logic via API Routes         │
│    (TIDAK ada Express/server terpisah)        │
└─────────────┬───────────────────┬─────────────┘
              │                   │
    fetch/write API        fetch/write API
              │                   │
              ▼                   ▼
 ┌─────────────────────┐  ┌─────────────────────┐
 │  Odoo (ERP - Sales)  │  │      Supabase        │
 │  (Odoo Online SaaS)  │  │  (Auth + Postgres)    │
 │ - Manajemen Produk   │  │ - Data User           │
 │ - Harga & Varian     │  │ - Login/Register      │
 │ - Field Stok Dasar   │  │ - Data Address         │
 │ - Sales Order        │  │ (multiple per user)    │
 └─────────────────────┘  └─────────────────────┘
              │
              │ fetch (saat checkout)
              ▼
 ┌─────────────────────┐
 │  Payment Gateway      │
 │  (Midtrans/Xendit)    │
 │  - Proses pembayaran  │
 │  - Webhook callback   │
 └─────────────────────┘
```

### 3.1 Hybrid Stock Management (PENTING — khusus untuk data Produk di Odoo)

Karena hanya modul **Sales** yang dipakai (bukan Inventory, demi tetap gratis selamanya), pengurangan stok **tidak otomatis** ditangani Odoo. Maka digunakan pendekatan hybrid:

| Tanggung Jawab | Ditangani Oleh |
|---|---|
| Data produk, harga, deskripsi, varian (size/warna) | **Odoo (Sales)** — single source of truth |
| Jumlah stok per varian (nilai awal) | **Odoo (Sales)** — field stok dasar, diisi manual saat input produk |
| Pengecekan stok saat checkout | **Next.js custom logic** — cek field stok dari data yang sudah di-fetch dari Odoo |
| Pengurangan stok setelah order sukses | **Next.js custom logic** — kirim API call (write/update) ke Odoo untuk update angka stok terbaru |
| Validasi race condition (2 user checkout barang sama bersamaan) | **Next.js custom logic** — perlu ditangani di server-side (API Route), idealnya dengan locking/transaction sederhana |

**Alasan pendekatan ini dipilih**: modul Inventory Odoo hanya tersedia di plan berbayar (trial 15 hari), sedangkan Sales saja gratis selamanya (One App Free).

**Catatan untuk AI/asisten coding**: pendekatan hybrid ini KHUSUS untuk data Produk/Stok — tetap di Odoo, JANGAN dipindah ke Supabase atau database lain. Supabase HANYA dipakai untuk data User/Auth/Address (lihat Section 3.2), bukan untuk produk.

### 3.2 Split Data Ownership: Mengapa User/Auth Pindah ke Supabase

Awalnya direncanakan data User & Address juga disimpan di Odoo (lewat modul Contacts/`res.partner`), tapi ternyata modul Contacts ikut terhitung sebagai modul tambahan yang memicu trial 15 hari — bukan otomatis gratis bersama Sales seperti dugaan awal. Karena itu:

- **User, Auth (login/register), Address** → dipindah ke **Supabase**
- **Produk, Harga, Varian, Stok** → tetap di **Odoo**
- **Order** → dikirim ke Odoo sebagai Sales Order, dengan data customer (nama, email, alamat) dikirim sebagai data teks dasar — TANPA membuat relasi Contact penuh di Odoo

Ini juga sejalan dengan praktik umum di banyak sistem ecommerce production: data auth/akun sering dipisah dari ERP (pakai Auth0/Firebase/Supabase), sementara ERP fokus ke transaksi & produk.




### Prinsip Arsitektur Penting
1. **Separation of concerns**: Next.js HANYA bertugas menampilkan UI dan mengelola interaksi user. Logic bisnis (stok, harga, kategori) dikelola di Odoo.
2. **API layer abstraction**: Semua pemanggilan data (baik dari DummyJSON sekarang, atau Odoo nanti) HARUS melalui satu layer terpisah (misal `lib/api/products.ts`), bukan dipanggil langsung di komponen. Tujuannya agar saat sumber data berganti (dummy → Odoo), tidak perlu mengubah UI/komponen.
3. **ERP-ready design**: Struktur data (types/interface produk) dirancang generic, bukan disesuaikan dengan satu sumber data tertentu saja.

---

## 4. STRUKTUR DATA PRODUK (Generic Type)

Gunakan struktur ini sebagai acuan, agar kompatibel baik dengan dummy data maupun data dari Odoo:

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  season: string[]; // contoh: ["Winter", "Autumn"] — produk bisa cocok lebih dari 1 musim
  price: number;
  images: string[];
  variants: {
    size: string;
    color: string;
    stock: number;
  }[];
  createdAt: string;
}
```

### Catatan Implementasi Season
- Season **BUKAN attribute/varian** (size/color), melainkan **Product Tag** di Odoo — karena season adalah label/filter, bukan varian fisik produk yang berbeda
- Di Odoo: dibuat lewat **Sales > Configuration > Product Tags** (Winter, Autumn, Spring, Summer)
- Di Next.js: dipakai untuk filter produk per musim di halaman Listing/Homepage (misal: "New Arrivals - Winter Collection")

### Struktur Data User & Address (Generic Type — disimpan di Supabase)

```typescript
interface User {
  id: string; // UUID dari Supabase Auth
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string; // URL foto profil
  addresses: Address[];
  defaultShippingAddressId?: string;
  defaultBillingAddressId?: string;
  createdAt: string;
  updatedAt: string;
}

interface Address {
  id: string;
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
  label?: string; // misal: "Rumah", "Kantor"
}
```

**Catatan implementasi:**
- Data ini disimpan di **Supabase** (Postgres + Auth bawaan Supabase), BUKAN di Odoo
- 1 User bisa punya banyak Address (relasi one-to-many di tabel Supabase)
- Dipakai di halaman **User Profile** (kelola alamat) dan **Checkout** (pilih alamat pengiriman/penagihan)
- Saat checkout berhasil, data User & Address dikirim sebagai bagian dari **Sales Order** ke Odoo (sebagai data teks dasar: nama, email, alamat) — TANPA membuat relasi Contact (`res.partner`) penuh di Odoo, untuk menghindari modul tambahan yang memicu trial 15 hari

---

## 5. HALAMAN & FITUR (FULL FLOW)

| No | Halaman | Fungsi Utama |
|---|---|---|
| 1 | Homepage | Hero banner, featured collection, kategori unggulan, new arrivals, **section per season (Winter/Autumn/Spring/Summer)** |
| 2 | Product Listing | Grid produk per kategori, filter (size/warna/harga/**season**), sorting |
| 3 | Product Detail | Galeri foto, pilih varian, deskripsi, related products |
| 4 | Cart | Slide-over drawer/halaman, update qty, hapus item, subtotal |
| 5 | Checkout | Form alamat, pilihan pengiriman, ringkasan order (multi-step) |
| 6 | Payment | Pilih metode bayar, ringkasan final, status pembayaran |
| 7 | User Profile | Edit data diri, kelola alamat (multi-alamat), ganti password |
| 8 | User Dashboard | Riwayat order, status, tracking pengiriman |

---

## 6. GAYA DESAIN (Design System)

### Tema: Premium / Luxury Fashion

- **Palet warna**: netral (putih, hitam, off-white/cream, beige) + 1 aksen gelap (navy atau maroon)
- **Tipografi**:
  - Heading: serif elegan (misal Playfair Display)
  - Body: sans-serif clean (misal Inter)
- **Layout**: banyak whitespace, tidak padat, grid minimalis
- **Foto produk**: jadi fokus utama, full-bleed, ukuran besar
- **Animasi**: halus — fade-in saat scroll, subtle zoom saat hover, smooth page transition
- **Yang dihindari**: warna ramai, shadow tebal, layout padat ala marketplace umum (Shopee/Tokopedia)

### Responsiveness
- Mobile-first wajib
- Mobile: hamburger menu / bottom navigation
- Desktop: navbar horizontal

### Accessibility
- Alt text di semua gambar
- Contrast ratio cukup (WCAG AA minimum)
- Keyboard navigable

---

## 7. INTEGRASI ODOO (RENCANA TEKNIS)

### Status: Belum diimplementasi / Tahap perencanaan

### Langkah Integrasi
1. Daftar **Odoo Online** (gunakan free trial untuk keperluan demo portofolio)
2. Aktifkan modul: Sales, Inventory (opsional: Website/eCommerce)
3. Input data produk dummy fashion (nama, foto, varian, harga, stok)
4. Generate API credentials di Odoo (Settings > Technical > API Keys, atau via XML-RPC auth)
5. Buat layer koneksi di Next.js: `lib/odoo.ts`
   - Fungsi: `getProducts()`, `getProductById()`, `createOrder()`, dll
   - Komunikasi via XML-RPC/JSON-RPC ke endpoint Odoo
6. Ganti seluruh pemanggilan dummy data di komponen dengan fungsi dari `lib/odoo.ts`

### Catatan Penting
- Karena Odoo Online trial bersifat sementara (umumnya 15 hari), dokumentasikan proses (screenshot/screen record) untuk keperluan portofolio sebelum trial berakhir/data reset.
- Vercel (hosting Next.js) dan Odoo (hosting ERP) terpisah — komunikasi dilakukan murni via API call dari server-side Next.js (gunakan API Routes atau Server Actions agar credential Odoo tidak terekspos ke client).

---

## 8. INTEGRASI PAYMENT GATEWAY (RENCANA TEKNIS)

### Status: Belum diimplementasi / Tahap perencanaan

- Gateway pilihan: **Midtrans** atau **Xendit** (gunakan sandbox/testing mode, BUKAN production key)
- Alur:
  1. User checkout → data order dikirim ke Next.js API Route
  2. Next.js API Route membuat transaksi ke payment gateway (sandbox)
  3. User diarahkan ke halaman/metode pembayaran
  4. Payment gateway mengirim webhook callback ke Next.js saat status berubah
  5. Next.js update status order (idealnya juga update balik ke Odoo)
- **Penting**: logic payment harus berada di layer terpisah (`lib/payment.ts`), tidak dicampur dengan komponen UI

---

## 9. KEPUTUSAN TEKNIS YANG SUDAH DIAMBIL

> Bagian ini WAJIB diupdate setiap ada keputusan arsitektur baru, agar AI/asisten coding berikutnya tidak mengulang pertanyaan yang sama atau mengambil pendekatan yang bertentangan.

- [x] Arsitektur: headless (frontend Next.js terpisah dari backend Odoo)
- [x] ERP yang dipakai: **Odoo Online (SaaS)**, plan One App Free — BUKAN Community Edition self-hosted, BUKAN Docker
- [x] Alasan: paling simpel, tidak perlu maintain server/tunneling sendiri, cukup untuk kebutuhan demo portofolio
- [x] Payment gateway: Midtrans/Xendit (lokal Indonesia, sandbox mode untuk demo)
- [x] Data sementara sebelum Odoo aktif: DummyJSON/Fake Store API + foto dari Unsplash
- [x] Modul Odoo yang dipakai: **Sales saja** (Odoo "One App Free" plan, gratis selamanya). Inventory TIDAK dipakai karena versi multi-modul hanya trial 15 hari lalu berbayar.
- [x] Konsekuensi dari keputusan di atas: pengurangan stok TIDAK otomatis dari sistem Odoo. Logic update stok (saat checkout/order berhasil) di-handle manual di layer API Next.js (`lib/odoo.ts`), dengan cara update field stok produk di Odoo lewat API setelah order sukses.
- [x] Modul Contacts (`res.partner`) di Odoo TERNYATA ikut menghitung sebagai modul tambahan (memicu trial 15 hari), TIDAK otomatis gratis bersama Sales seperti dugaan awal.
- [x] Karena itu, data **User & Address dipindah keluar dari Odoo**, disimpan di **Supabase** (Auth + Postgres) — lihat Section 4 untuk struktur datanya
- [x] Pembagian data final: Supabase = User/Auth/Address. Odoo = Produk/Harga/Varian/Stok. Order dikirim ke Odoo sebagai Sales Order dengan data customer minimal (teks biasa, bukan relasi Contact penuh)
- [x] Backend logic: **Next.js API Routes saja**, TIDAK pakai Express atau server backend terpisah — alasan: cukup untuk semua kebutuhan (Odoo, Supabase, payment), satu deployment di Vercel, hindari overhead CORS/hosting kedua
- [ ] State management cart: **(belum final — isi setelah diputuskan: Context API atau Zustand)**
- [x] Final hosting Odoo: Odoo Online, plan One App Free (Sales only), gratis selamanya

---

## 10. HAL YANG TIDAK BOLEH DIASUMSIKAN ULANG OLEH AI

Agar konteks tidak melenceng, AI/asisten yang membantu project ini harus mengikuti batasan berikut:

1. JANGAN menyarankan Docker untuk setup Odoo — sudah diputuskan pakai Odoo Online (SaaS).
2. JANGAN menyarankan Odoo Community Edition (self-hosted) — sempat dipertimbangkan tapi DIBATALKAN karena perlu maintain server/tunneling sendiri. Final pakai Odoo Online.
3. JANGAN menyarankan aktivasi modul Inventory — sudah diputuskan hanya pakai Sales (plan One App Free, gratis selamanya). Logic stok ditangani manual (hybrid) di layer API Next.js.
4. JANGAN menyarankan menyimpan data User/Auth/Address di Odoo (via Contacts/res.partner) — sudah dipindah ke Supabase karena modul Contacts ikut memicu trial 15 hari. Odoo HANYA dipakai untuk data Produk dan Sales Order.
5. JANGAN menyarankan Express.js atau backend server terpisah — sudah diputuskan pakai Next.js API Routes saja untuk semua backend logic.
6. JANGAN mengubah tema desain ke gaya colorful/playful — tema yang dipakai adalah premium/luxury, palet netral.
7. JANGAN menyatukan logic payment dengan komponen UI — harus tetap di layer terpisah.
8. Project ini untuk **portofolio/demo**, bukan production bisnis nyata — keputusan teknis boleh mengutamakan kesederhanaan & kecepatan demo, bukan skalabilitas enterprise penuh.

---

## 11. TODO / NEXT STEPS

- [x] Setup akun Odoo Online (trial, lalu pastikan downgrade/pilih plan One App Free - Sales)
- [x] Konfigurasi modul Sales
- [x] Input produk dummy fashion ke Odoo
- [x] Generate API credentials Odoo
- [x] Buat layer `lib/odoo.ts` untuk fetch data dari Odoo + custom stock logic (hybrid)
- [x] Ganti dummy data di frontend dengan data dari Odoo
- [ ] Setup project Supabase (Auth + tabel `users` & `addresses`)
- [ ] Implementasi auth (login/register) pakai Supabase Auth
- [ ] Buat layer `lib/supabase.ts` untuk CRUD User & Address
- [ ] Hubungkan User Profile & Checkout ke data Supabase
- [ ] Setup sandbox akun Midtrans/Xendit
- [ ] Implementasi payment flow (checkout → payment → webhook)
- [ ] Implementasi pengiriman Sales Order ke Odoo saat checkout sukses (data customer minimal, bukan Contact penuh)
- [ ] Deploy final ke Vercel
- [ ] Dokumentasikan proses (screenshot/video) untuk keperluan portofolio

---

*Dokumen ini harus terus diupdate seiring progres development agar tetap menjadi referensi konteks yang akurat.*