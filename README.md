# Aula FST – Sistem Reservasi Modern

Aplikasi Sistem Informasi Reservasi Aula Fakultas Sains dan Teknologi (FST), ditulis ulang sebagai aplikasi **React (Vite + TypeScript + Tailwind CSS)** dengan arsitektur SPA yang responsif, cepat, dan mendukung operasi offline.

---

## Fitur Utama

1. **Beranda & Cek Ketersediaan Real-Time**
   - Kalender interaktif ketersediaan aula per bulan.
   - Indikator status tanggal: Tersedia (hijau), Sebagian (kuning), dan Penuh (merah).
   - Visualisasi slot jam operasional (07:00 – 17:00 WIB).
   - Tombol cepat *Pesan di Tanggal Ini* yang langsung membuka form pemesanan dengan tanggal terpilih.
   - Ringkasan fasilitas inventaris Aula FST (kapasitas 100 kursi, AC, proyektor, sound system, WiFi, podium, whiteboard).

2. **Formulir Booking Multi-Step (4 Langkah)**
   - **Langkah 1 (Tipe Booking)**: Per Jam (Hourly), Per Hari (Daily), Per Minggu (Weekly berulang 1–4 minggu).
   - **Langkah 2 (Jadwal & Waktu)**: Pemilihan tanggal dan jam dengan validasi deteksi bentrok jadwal secara langsung.
   - **Langkah 3 (Detail Pemohon & Berkas)**: Nama kegiatan, penanggung jawab, organisasi/lembaga, nomor WhatsApp, email, catatan, serta unggah dokumen proposal kegiatan (PDF).
   - **Langkah 4 (Konfirmasi & Submit)**: Ringkasan menyeluruh sebelum pengiriman dan pembuatan ID Booking unik resmi.
   - Halaman status sukses dilengkapi tombol salin ID, tautan cek status, dan buat booking baru.

3. **Pelacakan Status Reservasi (Cek Status)**
   - Pencarian berdasarkan ID Booking (misal `BKG-DEMO001`).
   - Stepper timeline interaktif: Diajukan ➜ Verifikasi Admin ➜ Disetujui / Ditolak.
   - Informasi detail kegiatan, jadwal terkonfirmasi, alasan penolakan (bila ditolak), dan pengunduhan berkas lampiran.

4. **Panel Admin Terintegrasi**
   - Login admin terproteksi (kredensial default: `admin` / `admin123`).
   - Dashboard analitik dengan KPI cards (Total, Pending, Approved, Rejected).
   - Grafik tren penggunaan 6 bulan terakhir dan diagram donat distribusi status.
   - Tabel reservasi baru yang menunggu verifikasi dengan aksi cepat: *Setujui* dan *Tolak* (disertai modal alasan penolakan).
   - Menu *Semua Reservasi* dengan fitur filter status dan pencarian dinamis.
   - Pengaturan akun untuk mengubah kata sandi admin.

5. **Notifikasi & PWA**
   - Notifikasi in-app dengan badge hitungan belum dibaca dan menu popup.
   - Mode gelap (dark mode default) dan mode terang (light mode).
   - Banner instalasi PWA dan dukungan penyimpanan data lokal (`localStorage`).

---

## Menjalankan Aplikasi

```bash
# Menjalankan server pengembangan
npm run dev

# Membangun versi produksi
npm run build
```
