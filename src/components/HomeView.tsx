import React, { useState } from 'react';
import { AulaInfo, Booking } from '../types';
import { StorageService } from '../services/store';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface HomeViewProps {
  aula: AulaInfo;
  bookings: Booking[];
  onBookDate: (dateStr: string) => void;
  onNavigateBooking: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  aula,
  bookings,
  onBookDate,
  onNavigateBooking,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const fmtDate = (d: Date) => d.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(fmtDate(today));

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(fmtDate(now));
  };

  // Build calendar matrix
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isPast: boolean; status: 'free' | 'partial' | 'full'; isToday: boolean }[] = [];

  // Empty cells before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({
      dateStr: `empty-${i}`,
      dayNum: 0,
      isCurrentMonth: false,
      isPast: true,
      status: 'free',
      isToday: false,
    });
  }

  // Days in month
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(year, month, d);
    dt.setHours(0, 0, 0, 0);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const isPast = dt.getTime() < today.getTime();
    const status = StorageService.getDateStatus(dateStr);
    const isToday = dt.getTime() === today.getTime();

    days.push({
      dateStr,
      dayNum: d,
      isCurrentMonth: true,
      isPast,
      status,
      isToday,
    });
  }

  const selectedSlots = StorageService.getSlotsForDate(selectedDate);
  const selectedStatus = StorageService.getDateStatus(selectedDate);
  const availableHours = StorageService.getAvailableHours(selectedDate);

  const formatDisplayDate = (str: string) => {
    if (!str) return '';
    const [y, m, d] = str.split('-');
    const mIndex = parseInt(m, 10) - 1;
    return `${d} ${monthNames[mIndex]} ${y}`;
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fitur PWA + Offline Support & Real-time Booking</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.15]">
            Sistem Reservasi <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400">
              Aula Fakultas Sains & Teknologi
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Ajukan peminjaman ruangan dengan mudah, pantau status persetujuan, dan
            kelola jadwal acara Anda dalam satu platform modern yang terintegrasi.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onNavigateBooking}
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
            >
              <span>📋 Booking Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#ketersediaan"
              className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <span>📅 Cek Ketersediaan</span>
            </a>
          </div>

          {/* Hero Stats */}
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="custom-card p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-4xl font-extrabold text-blue-400 font-mono">
                {aula.capacity}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Kapasitas Kursi
              </div>
            </div>
            <div className="custom-card p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-4xl font-extrabold text-indigo-400 font-mono">
                {aula.facilities.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Fasilitas Utama
              </div>
            </div>
            <div className="custom-card p-4 sm:p-6 text-center">
              <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                {bookings.length}
              </div>
              <div className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
                Total Kegiatan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Availability Section */}
      <section id="ketersediaan" className="max-w-7xl mx-auto px-4 scroll-mt-20">
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
            <CalendarIcon className="w-4 h-4" />
            <span>Kalender Jadwal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Cek Ketersediaan Aula FST
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Pantau jadwal penggunaan Aula FST secara real-time sebelum mengajukan peminjaman.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Calendar Card */}
          <div className="lg:col-span-7 custom-card p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-extrabold text-base sm:text-lg text-slate-100 min-w-36 text-center">
                  {monthNames[month]} {year}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleGoToday}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-colors"
              >
                Hari Ini
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-[11px] sm:text-xs font-bold text-slate-400 uppercase">
              <span>Min</span>
              <span>Sen</span>
              <span>Sel</span>
              <span>Rab</span>
              <span>Kam</span>
              <span>Jum</span>
              <span>Sab</span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {days.map((item, idx) => {
                if (!item.isCurrentMonth) {
                  return <div key={idx} className="cal-day empty" />;
                }

                let classes = 'cal-day';
                if (item.isPast) classes += ' past';
                else if (item.status === 'full') classes += ' full';
                else if (item.status === 'partial') classes += ' partial';
                else classes += ' available';

                if (item.isToday) classes += ' today';
                if (item.dateStr === selectedDate) classes += ' selected';

                return (
                  <div
                    key={item.dateStr}
                    onClick={() => {
                      if (!item.isPast && item.status !== 'full') {
                        setSelectedDate(item.dateStr);
                      }
                    }}
                    className={classes}
                    title={
                      item.isPast
                        ? 'Tanggal lewat'
                        : item.status === 'full'
                        ? 'Aula Penuh'
                        : item.status === 'partial'
                        ? 'Sebagian Jam Terisi'
                        : 'Aula Tersedia Penuh'
                    }
                  >
                    <span>{item.dayNum}</span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500/40 border border-emerald-500" />
                <span>Tersedia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500/40 border border-amber-500" />
                <span>Sebagian Terisi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/40 border border-rose-500" />
                <span>Penuh</span>
              </div>
            </div>
          </div>

          {/* Day Schedule Detail Card */}
          <div className="lg:col-span-5 custom-card p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-slate-400 font-medium">Jadwal Penggunaan</span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {selectedDate}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-100 mb-3">
                {formatDisplayDate(selectedDate)}
              </h3>

              {/* Status Alert */}
              {selectedStatus === 'free' ? (
                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <div>
                    <span className="font-bold">Aula Masih Kosong!</span> Seluruh slot waktu (07:00 – 17:00) tersedia untuk dipesan.
                  </div>
                </div>
              ) : selectedStatus === 'partial' ? (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <div>
                    <span className="font-bold">Sebagian Waktu Terisi.</span> Periksa jadwal di bawah untuk memilih jam yang masih kosong.
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <div>
                    <span className="font-bold">Aula Penuh.</span> Tidak ada slot waktu tersisa pada tanggal ini.
                  </div>
                </div>
              )}

              {/* Hourly Slot Visualizer */}
              <div className="mt-5">
                <div className="text-xs font-semibold text-slate-300 mb-2">
                  Slot Jam Operasional (07:00 – 17:00):
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {availableHours.map(({ hour, booked }) => (
                    <div
                      key={hour}
                      className={`p-2 rounded-lg text-center text-xs font-mono transition-colors ${
                        booked
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                      title={booked ? `Pukul ${hour}:00 - ${hour + 1}:00 Terisi` : `Pukul ${hour}:00 - ${hour + 1}:00 Kosong`}
                    >
                      <div className="font-bold">{String(hour).padStart(2, '0')}:00</div>
                      <div className="text-[10px] opacity-75">{booked ? 'Terisi' : 'Kosong'}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Existing Bookings List */}
              {selectedSlots.length > 0 && (
                <div className="mt-5 space-y-2">
                  <div className="text-xs font-semibold text-slate-300">
                    Daftar Kegiatan Terjadwal:
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-200">{slot.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{slot.org}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            {String(slot.startTime).padStart(2, '0')}:00 - {String(slot.endTime).padStart(2, '0')}:00
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 text-center">
              <button
                disabled={selectedStatus === 'full'}
                onClick={() => onBookDate(selectedDate)}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedStatus === 'full'
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:scale-[1.01]'
                }`}
              >
                <span>Pesan di Tanggal Ini</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Aula Information Section */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="custom-card p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100">
              🏢 Informasi Fasilitas Aula FST
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Spesifikasi ruangan dan inventaris resmi yang tersedia untuk pengguna.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Lokasi</div>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5">
                    {aula.location}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Kapasitas Maksimal</div>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5">
                    {aula.capacity} Orang (Format Teater / Kursi Rapat)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-medium">Jam Operasional Resmi</div>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5 font-mono">
                    {String(aula.openHour).padStart(2, '0')}:00 – {String(aula.closeHour).padStart(2, '0')}:00 WIB
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Fasilitas & Inventaris Tersedia
              </div>
              <div className="flex flex-wrap gap-2">
                {aula.facilities.map((fac) => (
                  <div
                    key={fac}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 border border-white/10 text-slate-200 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    <span>{fac}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 leading-relaxed">
                ℹ️ Untuk perlengkapan tambahan di luar daftar inventaris (misal: sound tambahan, lighting panggung), silakan cantumkan pada kolom catatan permohonan.
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
