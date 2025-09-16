# Sistem Informasi Apotek Sehat

Sistem informasi berbasis web untuk manajemen apotek yang mencakup pengelolaan stok obat, transaksi penjualan, dan pelaporan harian.

## 🚀 Fitur Utama

### 🔐 Sistem Autentikasi

- Login/logout untuk admin dan kasir
- Registrasi pengguna dengan role-based access
- Middleware untuk proteksi route

### 💊 Manajemen Obat (Admin Only)

- CRUD obat lengkap (Create, Read, Update, Delete)
- Pencarian dan filter obat
- Tracking stok dan tanggal kedaluwarsa
- Alert untuk stok menipis dan obat kedaluwarsa

### 🛒 Sistem Transaksi Penjualan

- Interface point-of-sale yang user-friendly
- Keranjang belanja dengan manajemen quantity
- Pencarian obat real-time
- Generate struk transaksi otomatis
- Support multiple payment methods

### 📊 Dashboard & Pelaporan

- Dashboard dengan statistik real-time
- Laporan penjualan harian
- Riwayat transaksi lengkap
- Analisis obat terlaris
- Export laporan ke CSV

### 🚨 Sistem Alert

- Notifikasi stok menipis
- Peringatan obat akan kedaluwarsa
- Alert center terpusat
- Prioritas alert berdasarkan tingkat kritis

## 🛠️ Teknologi yang Digunakan

- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 📋 Persyaratan Sistem

- Node.js 18+
- npm atau yarn
- Akun Supabase
- Browser modern (Chrome, Firefox, Safari, Edge)

## 🚀 Instalasi dan Setup

### 1. Clone Repository

\`\`\`bash
git clone <repository-url>
cd apotek-sehat
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install

# atau

yarn install
\`\`\`

### 3. Setup Environment Variables

Buat file `.env.local` dan tambahkan:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

### 4. Setup Database

1. Buka Supabase Dashboard
2. Jalankan script SQL dari folder `scripts/` secara berurutan:
   - `001_create_users_table.sql`
   - `002_create_drugs_table.sql`
   - `003_create_sales_table.sql`
   - `004_create_sale_items_table.sql`
   - `005_create_functions_and_triggers.sql`
   - `006_seed_sample_data.sql`
   - `007_add_generate_transaction_function.sql`

### 5. Jalankan Development Server

\`\`\`bash
npm run dev

# atau

yarn dev
\`\`\`

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 👥 User Roles

### Admin

- Akses penuh ke semua fitur
- Manajemen obat (CRUD)
- Transaksi penjualan
- Laporan dan analytics
- Manajemen user

### Kasir

- Transaksi penjualan
- View laporan
- Dashboard statistik
- Tidak bisa mengelola obat

## 📱 Cara Penggunaan

### Login Pertama Kali

1. Akses halaman login
2. Daftar akun baru dengan memilih role (Admin/Kasir)
3. Konfirmasi email
4. Login dengan kredensial yang telah dibuat

### Mengelola Obat (Admin)

1. Masuk ke menu "Manajemen Obat"
2. Klik "Tambah Obat" untuk menambah obat baru
3. Isi form dengan lengkap (nama, kategori, harga, stok, dll.)
4. Gunakan fitur pencarian untuk mencari obat
5. Edit/hapus obat sesuai kebutuhan

### Melakukan Transaksi Penjualan

1. Masuk ke menu "Transaksi Penjualan"
2. Klik "Tambah Obat" untuk mencari dan menambah obat ke keranjang
3. Atur quantity sesuai kebutuhan
4. Isi nama pelanggan (opsional)
5. Pilih metode pembayaran
6. Klik "Proses Transaksi"
7. Cetak struk jika diperlukan

### Melihat Laporan

1. Masuk ke menu "Laporan"
2. Pilih rentang tanggal
3. Lihat laporan harian, riwayat transaksi, atau obat terlaris
4. Export ke CSV jika diperlukan

### Monitoring Alert

1. Perhatikan badge notifikasi di header
2. Klik icon alert untuk membuka Alert Center
3. Lihat peringatan berdasarkan prioritas
4. Ambil tindakan yang diperlukan

## 🗂️ Struktur Project

\`\`\`
apotek-sehat/
├── app/ # Next.js App Router
│ ├── auth/ # Authentication pages
│ ├── dashboard/ # Dashboard page
│ ├── drugs/ # Drug management pages
│ ├── sales/ # Sales transaction pages
│ ├── reports/ # Reporting pages
│ └── layout.tsx # Root layout
├── components/ # Reusable components
│ ├── alerts/ # Alert system components
│ ├── drugs/ # Drug-related components
│ ├── layout/ # Layout components
│ ├── sales/ # Sales-related components
│ └── ui/ # UI components (shadcn/ui)
├── lib/ # Utility libraries
│ ├── supabase/ # Supabase client configuration
│ └── utils.ts # Utility functions
├── scripts/ # Database scripts
└── README.md
\`\`\`

## 🔧 Konfigurasi Database

### Tables

- `users` - Data pengguna dengan role
- `drugs` - Master data obat
- `sales` - Header transaksi penjualan
- `sale_items` - Detail item transaksi

### Functions

- `generate_transaction_number()` - Generate nomor transaksi otomatis
- `update_drug_stock()` - Update stok otomatis setelah transaksi
- `handle_new_user()` - Handle user baru dari auth

### Triggers

- Auto-update stok setelah transaksi
- Auto-create user profile setelah registrasi

## 🚀 Deployment

### Deploy ke Vercel

1. Push code ke GitHub
2. Connect repository ke Vercel
3. Set environment variables di Vercel dashboard
4. Deploy otomatis

### Environment Variables untuk Production

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
\`\`\`

## 🔒 Keamanan

- Row Level Security (RLS) enabled di semua tabel
- Role-based access control
- Password encryption via Supabase Auth
- Protected API routes dengan middleware
- Input validation dan sanitization

## 🐛 Troubleshooting

### Database Connection Issues

- Pastikan environment variables sudah benar
- Check Supabase project status
- Verify RLS policies

### Authentication Problems

- Clear browser cache dan cookies
- Check email confirmation
- Verify user role di database

### Performance Issues

- Check database indexes
- Monitor Supabase usage
- Optimize queries jika diperlukan

## 📞 Support

Jika mengalami masalah atau butuh bantuan:

1. Check dokumentasi ini terlebih dahulu
2. Lihat console browser untuk error messages
3. Check Supabase logs untuk database issues
4. Contact developer team

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Apotek Sehat** - Sistem Informasi Apotek Modern untuk Manajemen yang Efisien
