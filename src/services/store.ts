import { AulaInfo, Booking, NotificationItem, Stats } from '../types';

const LS_KEY = 'aula_fst_v3';
const SES_KEY = 'aula_fst_admin_auth';
const THEME_KEY = 'aula_fst_theme';
const NOTIF_KEY = 'aula_fst_notifications';

export const DEFAULT_AULA: AulaInfo = {
  name: 'Aula FST',
  capacity: 100,
  location: 'Gedung Utama Fakultas Sains dan Teknologi, Lantai 2',
  facilities: [
    'AC',
    'Proyektor Epson FHD',
    'Sound System 1000W',
    'High-Speed WiFi',
    'Kursi 100 Unit',
    'Podium Pidato',
    'Whiteboard & Spidol',
  ],
  openHour: 7,
  closeHour: 17,
};

function getInitialData(): { admin: { username: string; password: string }; aula: AulaInfo; bookings: Booking[] } {
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  const d1 = new Date(today); d1.setDate(today.getDate() + 2);
  const d2 = new Date(today); d2.setDate(today.getDate() + 4);
  const d3 = new Date(today); d3.setDate(today.getDate() + 6);

  return {
    admin: { username: 'admin', password: 'admin123' },
    aula: DEFAULT_AULA,
    bookings: [
      {
        id: 'BKG-DEMO001',
        bookingType: 'daily',
        dates: [fmt(d1)],
        startTime: 7,
        endTime: 17,
        name: 'Himpunan Mahasiswa FST',
        kegiatan: 'Rapat Koordinasi Tahunan',
        organization: 'HIMAFST',
        penanggung_jawab: 'Himpunan Mahasiswa FST',
        phone: '081234567890',
        no_hp: '081234567890',
        email: 'hima@fst.ac.id',
        purpose: 'Rapat Koordinasi Tahunan',
        notes: 'Memerlukan meja registrasi dan sound system',
        dokumen: null,
        dokumenName: 'Surat_Permohonan_HIMAFST.pdf',
        status: 'approved',
        alasan_penolakan: null,
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'BKG-DEMO002',
        bookingType: 'hourly',
        dates: [fmt(d2)],
        startTime: 8,
        endTime: 12,
        name: 'Dr. Ahmad Fauzi',
        kegiatan: 'Seminar Nasional IoT & AI',
        organization: 'Prodi Teknologi Informasi',
        penanggung_jawab: 'Dr. Ahmad Fauzi',
        phone: '082345678901',
        no_hp: '082345678901',
        email: 'ahmad@fst.ac.id',
        purpose: 'Seminar Nasional IoT & AI',
        notes: 'Butuh setup proyektor dan 2 mic wireless',
        dokumen: null,
        dokumenName: 'Proposal_Seminar_IoT.pdf',
        status: 'pending',
        alasan_penolakan: null,
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        updated_at: null,
      },
      {
        id: 'BKG-DEMO003',
        bookingType: 'weekly',
        dates: [fmt(d3)],
        startTime: 7,
        endTime: 15,
        name: 'BEM Fakultas',
        kegiatan: 'Latihan Kepemimpinan Mahasiswa',
        organization: 'BEM FST',
        penanggung_jawab: 'BEM Fakultas',
        phone: '083456789012',
        no_hp: '083456789012',
        email: 'bem@fst.ac.id',
        purpose: 'Latihan Kepemimpinan Mahasiswa',
        notes: 'Diselenggarakan bersama panitia inti',
        dokumen: null,
        dokumenName: 'SK_BEM_LKM.pdf',
        status: 'approved',
        alasan_penolakan: null,
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
  };
}

function loadStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      const init = getInitialData();
      localStorage.setItem(LS_KEY, JSON.stringify(init));
      return init;
    }
    return JSON.parse(raw);
  } catch {
    return getInitialData();
  }
}

function saveStorage(data: unknown) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to storage', e);
  }
}

export const StorageService = {
  getAulaInfo(): AulaInfo {
    const data = loadStorage();
    return data.aula || DEFAULT_AULA;
  },

  getBookings(): Booking[] {
    const data = loadStorage();
    return data.bookings || [];
  },

  getActiveBookings(): Booking[] {
    return this.getBookings().filter((b) => b.status !== 'rejected');
  },

  getSlotsForDate(dateStr: string) {
    return this.getActiveBookings()
      .filter((b) => b.dates && b.dates.includes(dateStr))
      .map((b) => ({
        id: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        name: b.kegiatan || b.name,
        status: b.status,
        org: b.organization,
      }));
  },

  getDateStatus(dateStr: string): 'free' | 'partial' | 'full' {
    const slots = this.getSlotsForDate(dateStr);
    if (!slots.length) return 'free';
    const total = slots.reduce((s, x) => s + (x.endTime - x.startTime), 0);
    return total >= 10 ? 'full' : 'partial';
  },

  getAvailableHours(dateStr: string): { hour: number; booked: boolean }[] {
    const busy = new Array(10).fill(false);
    this.getActiveBookings().forEach((b) => {
      if (b.dates && b.dates.includes(dateStr)) {
        for (let h = b.startTime; h < b.endTime; h++) {
          if (h >= 7 && h < 17) busy[h - 7] = true;
        }
      }
    });
    return busy.map((booked, i) => ({ hour: i + 7, booked }));
  },

  checkConflict(dates: string[], startTime: number, endTime: number, excludeId?: string | null) {
    const active = this.getActiveBookings().filter((b) => b.id !== excludeId);
    for (const date of dates) {
      for (const b of active) {
        if (b.dates && b.dates.includes(date)) {
          if (startTime < b.endTime && endTime > b.startTime) {
            return {
              conflict: true,
              booking: b,
              date,
              message: `Konflik jadwal pada ${date} dengan kegiatan "${b.kegiatan || b.name}" (${b.startTime}:00–${b.endTime}:00)`,
            };
          }
        }
      }
    }
    return { conflict: false, message: '' };
  },

  addBooking(bookingData: Omit<Booking, 'id' | 'status' | 'created_at' | 'updated_at' | 'alasan_penolakan'>): Booking {
    const data = loadStorage();
    const id = 'BKG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newBooking: Booking = {
      ...bookingData,
      id,
      status: 'pending',
      alasan_penolakan: null,
      created_at: new Date().toISOString(),
      updated_at: null,
    };

    data.bookings.unshift(newBooking);
    saveStorage(data);

    this.addNotification(
      'Reservasi Baru Masuk',
      `Reservasi ${newBooking.id} diajukan oleh ${newBooking.organization} untuk "${newBooking.kegiatan}".`,
      'info'
    );

    return newBooking;
  },

  updateBookingStatus(id: string, status: 'approved' | 'rejected', reason?: string | null): Booking {
    const data = loadStorage();
    const idx = data.bookings.findIndex((b: Booking) => b.id === id);
    if (idx === -1) throw new Error('Reservasi tidak ditemukan.');

    data.bookings[idx].status = status;
    data.bookings[idx].alasan_penolakan = status === 'rejected' ? (reason || 'Ditolak oleh admin.') : null;
    data.bookings[idx].updated_at = new Date().toISOString();
    const updated = data.bookings[idx];
    saveStorage(data);

    const title = status === 'approved' ? 'Reservasi Disetujui! ✅' : 'Reservasi Ditolak ❌';
    const body = status === 'approved'
      ? `Reservasi ${updated.id} (${updated.kegiatan}) telah disetujui oleh admin.`
      : `Reservasi ${updated.id} (${updated.kegiatan}) ditolak. Alasan: ${updated.alasan_penolakan}`;
    this.addNotification(title, body, status === 'approved' ? 'success' : 'error');

    return updated;
  },

  deleteBooking(id: string) {
    const data = loadStorage();
    data.bookings = data.bookings.filter((b: Booking) => b.id !== id);
    saveStorage(data);
  },

  trackBooking(id: string): Booking {
    const data = loadStorage();
    const b = data.bookings.find((item: Booking) => item.id.toUpperCase() === id.trim().toUpperCase());
    if (!b) throw new Error('Reservasi tidak ditemukan. Pastikan ID booking yang dimasukkan benar.');
    return b;
  },

  getStats(): Stats {
    const bookings = this.getBookings();
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    const monthlyUsage = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const count = bookings.filter((b) => b.dates && b.dates.some((date) => date.startsWith(ym))).length;
      monthlyUsage.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
        count,
      });
    }

    const dayCount = [0, 0, 0, 0, 0, 0, 0];
    bookings.forEach((b) => {
      if (b.dates) {
        b.dates.forEach((d) => {
          dayCount[new Date(d).getDay()]++;
        });
      }
    });

    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'pending').length,
      approved: bookings.filter((b) => b.status === 'approved').length,
      rejected: bookings.filter((b) => b.status === 'rejected').length,
      todayBookings: bookings.filter((b) => b.dates && b.dates.includes(today)).length,
      monthBookings: bookings.filter((b) => (b.created_at || '').substring(0, 7) === currentMonth).length,
      monthlyUsage,
      dayCount,
      aulaName: 'Aula FST',
    };
  },

  // Auth
  adminLogin(username: string, password: string): boolean {
    const data = loadStorage();
    const admin = data.admin || { username: 'admin', password: 'admin123' };
    if (username === admin.username && password === admin.password) {
      sessionStorage.setItem(SES_KEY, '1');
      return true;
    }
    return false;
  },

  isAdminLoggedIn(): boolean {
    return sessionStorage.getItem(SES_KEY) === '1';
  },

  adminLogout() {
    sessionStorage.removeItem(SES_KEY);
  },

  changePassword(oldPass: string, newPass: string): boolean {
    const data = loadStorage();
    const admin = data.admin || { username: 'admin', password: 'admin123' };
    if (oldPass !== admin.password) {
      throw new Error('Password lama salah.');
    }
    if (newPass.length < 6) {
      throw new Error('Password baru minimal 6 karakter.');
    }
    data.admin.password = newPass;
    saveStorage(data);
    return true;
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    try {
      const raw = localStorage.getItem(NOTIF_KEY);
      if (!raw) {
        const initialNotifs: NotificationItem[] = [
          {
            id: Date.now() - 3600000 * 2,
            title: 'Selamat Datang di Aula FST',
            body: 'Sistem reservasi siap digunakan dengan ketersediaan real-time.',
            type: 'info',
            read: false,
            timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
        ];
        localStorage.setItem(NOTIF_KEY, JSON.stringify(initialNotifs));
        return initialNotifs;
      }
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  addNotification(title: string, body: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const list = this.getNotifications();
    list.unshift({
      id: Date.now(),
      title,
      body,
      type,
      read: false,
      timestamp: new Date().toISOString(),
    });
    if (list.length > 50) list.length = 50;
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
  },

  markNotificationRead(id: number) {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) item.read = true;
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
  },

  markAllNotificationsRead() {
    const list = this.getNotifications();
    list.forEach((n) => (n.read = true));
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list));
  },

  getTheme(): 'dark' | 'light' {
    const saved = localStorage.getItem(THEME_KEY);
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  },

  setTheme(theme: 'dark' | 'light') {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },
};
