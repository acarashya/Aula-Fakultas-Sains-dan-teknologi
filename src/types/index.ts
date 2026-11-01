export type BookingType = 'hourly' | 'daily' | 'weekly';
export type BookingStatus = 'pending' | 'approved' | 'rejected';

export interface AulaInfo {
  name: string;
  capacity: number;
  location: string;
  facilities: string[];
  openHour: number;
  closeHour: number;
}

export interface Booking {
  id: string;
  bookingType: BookingType;
  dates: string[];
  startTime: number;
  endTime: number;
  name: string;
  kegiatan: string;
  organization: string;
  penanggung_jawab: string;
  phone: string;
  no_hp: string;
  email?: string;
  purpose?: string;
  notes?: string;
  dokumen?: string | null;
  dokumenName?: string | null;
  status: BookingStatus;
  alasan_penolakan?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface NotificationItem {
  id: number;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

export interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  todayBookings: number;
  monthBookings: number;
  monthlyUsage: { month: string; year: number; label: string; count: number }[];
  dayCount: number[];
  aulaName: string;
}

export type ActiveTab = 'home' | 'booking' | 'status' | 'admin';
export type AdminTab = 'dashboard' | 'bookings' | 'settings';
