# User Guide - Sistem Informasi Apotek Sehat

## Daftar Isi
1. [Pengenalan](#pengenalan)
2. [Login dan Registrasi](#login-dan-registrasi)
3. [Dashboard](#dashboard)
4. [Manajemen Obat](#manajemen-obat)
5. [Transaksi Penjualan](#transaksi-penjualan)
6. [Laporan](#laporan)
7. [Sistem Alert](#sistem-alert)
8. [Tips dan Trik](#tips-dan-trik)
9. [FAQ](#faq)

## Pengenalan

Sistem Informasi Apotek Sehat adalah aplikasi web yang dirancang untuk membantu apotek dalam mengelola stok obat, memproses transaksi penjualan, dan menghasilkan laporan harian. Sistem ini memiliki dua jenis pengguna:

- **Admin**: Memiliki akses penuh ke semua fitur
- **Kasir**: Dapat melakukan transaksi dan melihat laporan

## Login dan Registrasi

### Registrasi Akun Baru

1. **Akses Halaman Registrasi**
   - Buka aplikasi di browser
   - Klik "Daftar di sini" di halaman login

2. **Isi Form Registrasi**
   - **Nama Lengkap**: Masukkan nama lengkap Anda
   - **Email**: Gunakan email yang valid dan aktif
   - **Role**: Pilih "Admin" atau "Kasir"
   - **Password**: Minimal 8 karakter
   - **Konfirmasi Password**: Harus sama dengan password

3. **Konfirmasi Email**
   - Cek email untuk link konfirmasi
   - Klik link untuk mengaktifkan akun
   - Kembali ke halaman login

### Login ke Sistem

1. **Masukkan Kredensial**
   - Email yang sudah terdaftar
   - Password yang benar

2. **Akses Dashboard**
   - Setelah login berhasil, Anda akan diarahkan ke dashboard

## Dashboard

Dashboard adalah halaman utama yang menampilkan ringkasan informasi penting:

### Kartu Statistik
- **Total Obat**: Jumlah jenis obat yang tersedia
- **Stok Menipis**: Obat yang stoknya di bawah minimum
- **Pendapatan Hari Ini**: Total penjualan hari ini
- **Akan Kedaluwarsa**: Obat yang akan kedaluwarsa dalam 30 hari

### Peringatan Kritis
- Ditampilkan jika ada obat yang memerlukan perhatian segera
- Berisi informasi obat yang stoknya habis atau akan kedaluwarsa
- Klik "Kelola Stok Obat" untuk mengatasi masalah

### Navigasi
Gunakan sidebar untuk berpindah antar menu:
- **Dashboard**: Halaman utama
- **Manajemen Obat**: Kelola data obat (Admin only)
- **Transaksi Penjualan**: Proses penjualan
- **Laporan**: Lihat laporan dan statistik

## Manajemen Obat (Admin Only)

### Menambah Obat Baru

1. **Akses Menu Manajemen Obat**
   - Klik "Manajemen Obat" di sidebar

2. **Klik Tombol "Tambah Obat"**
   - Terletak di pojok kanan atas

3. **Isi Form Obat**
   - **Nama Obat**: Nama dagang obat (wajib)
   - **Nama Generik**: Nama generik (opsional)
   - **Produsen**: Nama perusahaan farmasi (wajib)
   - **Kategori**: Pilih dari dropdown (wajib)
   - **Satuan**: Pilih satuan (tablet, botol, dll.) (wajib)
   - **Harga**: Harga per satuan dalam Rupiah (wajib)
   - **Stok**: Jumlah stok saat ini (wajib)
   - **Stok Minimum**: Batas minimum untuk alert (wajib)
   - **Tanggal Kedaluwarsa**: Tanggal kedaluwarsa (wajib)
   - **Nomor Batch**: Nomor batch produksi (opsional)
   - **Deskripsi**: Keterangan tambahan (opsional)

4. **Simpan Data**
   - Klik "Simpan" untuk menyimpan
   - Klik "Batal" untuk membatalkan

### Mencari dan Memfilter Obat

1. **Gunakan Kotak Pencarian**
   - Ketik nama obat, generik, produsen, atau kategori
   - Hasil akan difilter secara real-time

2. **Lihat Status Stok**
   - **Tersedia**: Stok normal (hijau)
   - **Menipis**: Stok di bawah minimum (kuning)
   - **Habis**: Stok kosong (merah)

3. **Perhatikan Tanggal Kedaluwarsa**
   - Obat yang akan kedaluwarsa ditandai dengan warna merah
   - Terdapat keterangan "Segera kedaluwarsa"

### Mengedit Obat

1. **Cari Obat yang Ingin Diedit**
   - Gunakan pencarian atau scroll tabel

2. **Klik Tombol "Edit"**
   - Terletak di kolom "Aksi"

3. **Ubah Data yang Diperlukan**
   - Form akan terisi dengan data saat ini
   - Ubah field yang diperlukan

4. **Simpan Perubahan**
   - Klik "Update" untuk menyimpan
   - Klik "Batal" untuk membatalkan

### Menghapus Obat

1. **Cari Obat yang Ingin Dihapus**
2. **Klik Tombol "Hapus"**
3. **Konfirmasi Penghapusan**
   - Sistem akan meminta konfirmasi
   - Klik "OK" untuk menghapus
   - Klik "Batal" untuk membatalkan

⚠️ **Peringatan**: Data yang dihapus tidak dapat dikembalikan!

## Transaksi Penjualan

### Memulai Transaksi Baru

1. **Akses Menu Transaksi Penjualan**
   - Klik "Transaksi Penjualan" di sidebar

2. **Tambah Obat ke Keranjang**
   - Klik "Tambah Obat"
   - Cari obat yang diinginkan
   - Atur jumlah dengan tombol +/-
   - Klik "Tambah" untuk memasukkan ke keranjang

### Mengelola Keranjang

1. **Mengubah Jumlah**
   - Gunakan tombol +/- di kolom "Jumlah"
   - Jumlah tidak boleh melebihi stok yang tersedia

2. **Menghapus Item**
   - Klik tombol "Hapus" di kolom "Aksi"

3. **Melihat Subtotal**
   - Subtotal dihitung otomatis (jumlah × harga)

### Menyelesaikan Transaksi

1. **Isi Informasi Pelanggan**
   - **Nama Pelanggan**: Opsional, bisa dikosongkan
   - **Metode Pembayaran**: Pilih dari dropdown
     - Tunai
     - Kartu Debit
     - Kartu Kredit
     - Transfer Bank

2. **Periksa Total**
   - Pastikan total sudah benar
   - Lihat jumlah item yang dibeli

3. **Proses Transaksi**
   - Klik "Proses Transaksi"
   - Tunggu hingga proses selesai

### Struk Transaksi

1. **Struk Otomatis Muncul**
   - Berisi detail lengkap transaksi
   - Nomor transaksi unik
   - Daftar obat yang dibeli
   - Total pembayaran

2. **Cetak Struk**
   - Klik "Cetak Struk" untuk mencetak
   - Struk akan terbuka di tab baru
   - Gunakan Ctrl+P untuk mencetak

3. **Tutup Struk**
   - Klik "Tutup" untuk menutup dialog
   - Keranjang akan kosong untuk transaksi baru

## Laporan

### Filter Laporan

1. **Pilih Rentang Tanggal**
   - **Dari Tanggal**: Tanggal mulai laporan
   - **Sampai Tanggal**: Tanggal akhir laporan
   - Laporan akan otomatis ter-update

2. **Export ke CSV**
   - Klik "Export CSV" untuk download
   - File akan tersimpan di folder Download

### Jenis Laporan

#### 1. Laporan Harian
- **Total Transaksi**: Jumlah transaksi per hari
- **Total Pendapatan**: Pendapatan per hari
- **Item Terjual**: Jumlah item yang terjual
- **Rata-rata per Transaksi**: Nilai rata-rata transaksi

#### 2. Riwayat Transaksi
- **Detail Lengkap**: Semua transaksi dalam periode
- **Informasi Kasir**: Siapa yang melayani
- **Metode Pembayaran**: Cara pembayaran
- **Item yang Dibeli**: Daftar obat per transaksi

#### 3. Obat Terlaris
- **Ranking**: Urutan berdasarkan jumlah terjual
- **Jumlah Terjual**: Total unit yang terjual
- **Total Pendapatan**: Pendapatan dari obat tersebut
- **Top 10**: Hanya menampilkan 10 teratas

### Membaca Laporan

1. **Kartu Ringkasan**
   - Lihat total pendapatan, transaksi, dan item terjual
   - Periode sesuai filter tanggal

2. **Tabel Detail**
   - Gunakan scroll untuk melihat data lengkap
   - Klik header kolom untuk sorting (jika tersedia)

3. **Analisis Data**
   - Bandingkan performa antar hari
   - Identifikasi obat yang laris
   - Monitor tren penjualan

## Sistem Alert

### Mengakses Alert

1. **Lihat Badge Notifikasi**
   - Terletak di header, sebelah profil user
   - Angka menunjukkan jumlah alert

2. **Buka Alert Center**
   - Klik icon notifikasi
   - Dialog alert akan terbuka

### Jenis Alert

#### 1. Stok Menipis/Habis
- **Prioritas Tinggi**: Stok habis (0)
- **Prioritas Sedang**: Stok sangat menipis (1-5)
- **Prioritas Rendah**: Stok di bawah minimum

#### 2. Obat Kedaluwarsa
- **Prioritas Tinggi**: Kedaluwarsa dalam 7 hari
- **Prioritas Sedang**: Kedaluwarsa dalam 14 hari
- **Prioritas Rendah**: Kedaluwarsa dalam 30 hari

#### 3. Sudah Kedaluwarsa
- **Prioritas Tinggi**: Obat yang sudah lewat tanggal kedaluwarsa

### Mengatasi Alert

1. **Stok Menipis**
   - Beli stok baru dari supplier
   - Update stok di menu Manajemen Obat

2. **Akan Kedaluwarsa**
   - Prioritaskan penjualan obat tersebut
   - Berikan diskon jika perlu
   - Hubungi supplier untuk tukar barang

3. **Sudah Kedaluwarsa**
   - Jangan jual obat tersebut
   - Hapus dari sistem atau set stok ke 0
   - Lakukan disposal sesuai prosedur

## Tips dan Trik

### Efisiensi Kerja

1. **Gunakan Shortcut Keyboard**
   - Enter untuk submit form
   - Esc untuk menutup dialog
   - Tab untuk navigasi antar field

2. **Manfaatkan Pencarian**
   - Ketik sebagian nama obat
   - Gunakan nama generik untuk pencarian
   - Cari berdasarkan produsen

3. **Monitor Alert Secara Rutin**
   - Cek alert setiap pagi
   - Prioritaskan obat dengan alert tinggi
   - Set reminder untuk restock

### Manajemen Stok

1. **Set Stok Minimum yang Realistis**
   - Pertimbangkan lead time supplier
   - Hitung rata-rata penjualan harian
   - Tambahkan buffer untuk safety stock

2. **Rotasi Stok FIFO**
   - First In, First Out
   - Jual obat dengan tanggal kedaluwarsa lebih dekat
   - Update batch number secara konsisten

3. **Review Berkala**
   - Evaluasi obat yang jarang terjual
   - Pertimbangkan untuk tidak restock
   - Analisis tren penjualan

### Transaksi Penjualan

1. **Double Check Sebelum Proses**
   - Pastikan obat dan jumlah sudah benar
   - Konfirmasi metode pembayaran
   - Cek nama pelanggan jika diperlukan

2. **Cetak Struk Selalu**
   - Berikan struk kepada pelanggan
   - Simpan copy untuk arsip
   - Gunakan untuk rekonsiliasi harian

3. **Komunikasi dengan Pelanggan**
   - Jelaskan cara penggunaan obat
   - Ingatkan tanggal kedaluwarsa
   - Berikan informasi efek samping jika perlu

## FAQ (Frequently Asked Questions)

### Q: Bagaimana jika lupa password?
**A**: Saat ini belum ada fitur reset password. Hubungi administrator sistem untuk reset manual.

### Q: Bisakah mengubah role user setelah registrasi?
**A**: Ya, admin dapat mengubah role user melalui database atau hubungi developer.

### Q: Bagaimana jika stok obat tidak akurat?
**A**: Admin dapat mengedit stok melalui menu Manajemen Obat. Pastikan melakukan stock opname berkala.

### Q: Bisakah membatalkan transaksi yang sudah diproses?
**A**: Saat ini belum ada fitur pembatalan transaksi. Lakukan refund manual dan catat di sistem terpisah.

### Q: Bagaimana backup data?
**A**: Data tersimpan di Supabase dengan backup otomatis. Untuk backup manual, export laporan secara berkala.

### Q: Bisakah menggunakan barcode scanner?
**A**: Saat ini belum support barcode. Fitur ini bisa ditambahkan di versi mendatang.

### Q: Bagaimana jika internet terputus?
**A**: Sistem memerlukan koneksi internet. Pastikan koneksi stabil atau gunakan mobile hotspot sebagai backup.

### Q: Bisakah mengatur diskon atau promosi?
**A**: Saat ini belum ada fitur diskon otomatis. Lakukan penyesuaian harga manual jika diperlukan.

### Q: Bagaimana menambah kategori obat baru?
**A**: Kategori saat ini fixed di sistem. Hubungi developer untuk menambah kategori baru.

### Q: Bisakah melihat laporan per kasir?
**A**: Ya, di laporan riwayat transaksi terdapat kolom kasir yang menunjukkan siapa yang melayani.

---

**Butuh bantuan lebih lanjut?**
Hubungi tim support atau administrator sistem Anda.
