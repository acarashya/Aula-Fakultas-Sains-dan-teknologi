import React, { useState, useEffect } from 'react';
import { Booking, BookingType } from '../types';
import { StorageService } from '../services/store';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface BookingViewProps {
  initialDate?: string;
  onSuccess: (booking: Booking) => void;
  onNavigateStatus: (bookingId: string) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const BookingView: React.FC<BookingViewProps> = ({
  initialDate,
  onSuccess,
  onNavigateStatus,
  onShowToast,
}) => {
  const [step, setStep] = useState<number>(1);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [copied, setCopied] = useState(false);

  // Form Fields
  const [bookingType, setBookingType] = useState<BookingType>('hourly');

  // Step 2 dates & times
  const todayStr = new Date().toISOString().split('T')[0];
  const [hourlyDate, setHourlyDate] = useState<string>(initialDate || todayStr);
  const [hourlyStart, setHourlyStart] = useState<number>(8);
  const [hourlyEnd, setHourlyEnd] = useState<number>(12);

  const [dailyDate, setDailyDate] = useState<string>(initialDate || todayStr);

  const [weeklyStartDate, setWeeklyStartDate] = useState<string>(initialDate || todayStr);
  const [weeklyDurationWeeks, setWeeklyDurationWeeks] = useState<number>(2);
  const [weeklyDays, setWeeklyDays] = useState<number[]>([1, 3]); // Monday, Wednesday
  const [weeklyStartHour, setWeeklyStartHour] = useState<number>(9);
  const [weeklyEndHour, setWeeklyEndHour] = useState<number>(12);

  // Conflict validation state
  const [conflictMsg, setConflictMsg] = useState<string>('');

  // Step 3 details
  const [kegiatan, setKegiatan] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [organization, setOrganization] = useState('');
  const [noHp, setNoHp] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // File upload
  const [fileName, setFileName] = useState<string>('');
  const [fileData, setFileData] = useState<string | null>(null);

  useEffect(() => {
    if (initialDate) {
      setHourlyDate(initialDate);
      setDailyDate(initialDate);
      setWeeklyStartDate(initialDate);
    }
  }, [initialDate]);

  // Generate dates array based on type
  const getSelectedDates = (): string[] => {
    if (bookingType === 'hourly') return [hourlyDate];
    if (bookingType === 'daily') return [dailyDate];

    // Weekly calculation
    const dates: string[] = [];
    const start = new Date(weeklyStartDate);
    const totalDays = weeklyDurationWeeks * 7;
    for (let i = 0; i < totalDays; i++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + i);
      if (weeklyDays.includes(cur.getDay())) {
        dates.push(cur.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const getEffectiveTimes = (): { start: number; end: number } => {
    if (bookingType === 'daily') {
      return { start: 7, end: 17 };
    }
    if (bookingType === 'weekly') {
      return { start: weeklyStartHour, end: weeklyEndHour };
    }
    return { start: hourlyStart, end: hourlyEnd };
  };

  // Check conflicts whenever time or dates change
  useEffect(() => {
    const dates = getSelectedDates();
    const { start, end } = getEffectiveTimes();

    if (!dates.length || start >= end) {
      setConflictMsg(start >= end ? 'Jam selesai harus lebih besar dari jam mulai.' : '');
      return;
    }

    const check = StorageService.checkConflict(dates, start, end);
    if (check.conflict) {
      setConflictMsg(check.message);
    } else {
      setConflictMsg('');
    }
  }, [
    bookingType,
    hourlyDate,
    hourlyStart,
    hourlyEnd,
    dailyDate,
    weeklyStartDate,
    weeklyDurationWeeks,
    weeklyDays,
    weeklyStartHour,
    weeklyEndHour,
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      onShowToast('Hanya file proposal PDF yang diperbolehkan.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onShowToast('Ukuran file maksimal 5MB.', 'error');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFileData(reader.result as string);
      onShowToast(`File ${file.name} berhasil diunggah.`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const validateStep3 = () => {
    if (!kegiatan.trim()) {
      onShowToast('Nama kegiatan wajib diisi.', 'error');
      return false;
    }
    if (!penanggungJawab.trim()) {
      onShowToast('Nama penanggung jawab wajib diisi.', 'error');
      return false;
    }
    if (!organization.trim()) {
      onShowToast('Organisasi/instansi wajib diisi.', 'error');
      return false;
    }
    if (!noHp.trim()) {
      onShowToast('Nomor WhatsApp wajib diisi.', 'error');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const dates = getSelectedDates();
    const { start, end } = getEffectiveTimes();

    // Final conflict check
    const check = StorageService.checkConflict(dates, start, end);
    if (check.conflict) {
      onShowToast(check.message, 'error');
      return;
    }

    try {
      const newBkg = StorageService.addBooking({
        bookingType,
        dates,
        startTime: start,
        endTime: end,
        name: penanggungJawab.trim(),
        penanggung_jawab: penanggungJawab.trim(),
        organization: organization.trim(),
        kegiatan: kegiatan.trim(),
        purpose: kegiatan.trim(),
        phone: noHp.trim(),
        no_hp: noHp.trim(),
        email: email.trim() || undefined,
        notes: notes.trim() || undefined,
        dokumen: fileData || null,
        dokumenName: fileName || (fileData ? 'Proposal_Kegiatan.pdf' : null),
      });

      setCreatedBooking(newBkg);
      onSuccess(newBkg);
      onShowToast('Permohonan booking berhasil dikirim!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal membuat reservasi';
      onShowToast(msg, 'error');
    }
  };

  const handleCopyId = () => {
    if (!createdBooking) return;
    navigator.clipboard.writeText(createdBooking.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast('ID Booking berhasil disalin ke clipboard!', 'info');
  };

  const resetForm = () => {
    setCreatedBooking(null);
    setStep(1);
    setKegiatan('');
    setPenanggungJawab('');
    setOrganization('');
    setNoHp('');
    setEmail('');
    setNotes('');
    setFileName('');
    setFileData(null);
  };

  // SUCCESS STATE VIEW
  if (createdBooking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center animate-in fade-in zoom-in-95">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-4xl mx-auto mb-6 shadow-xl shadow-emerald-500/10">
          🎉
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Booking Berhasil Dikirim!
        </h2>
        <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          Permohonan reservasi Aula FST Anda telah tersimpan dan menunggu persetujuan
          dari pihak pengelola. Simpan ID booking berikut untuk melacak status.
        </p>

        <div className="mt-8 p-6 rounded-2xl bg-blue-500/10 border border-blue-500/30 max-w-sm mx-auto shadow-inner">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
            ID Booking Resmi
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-blue-400 tracking-wider">
            {createdBooking.id}
          </div>
          <button
            onClick={handleCopyId}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600/30 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 flex items-center gap-2 mx-auto transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin!' : 'Salin ID Booking'}</span>
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigateStatus(createdBooking.id)}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            🔍 Cek Status Reservasi
          </button>
          <button
            onClick={resetForm}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all cursor-pointer"
          >
            📋 Ajukan Booking Lagi
          </button>
        </div>
      </div>
    );
  }

  const selectedDatesList = getSelectedDates();
  const effectiveTimes = getEffectiveTimes();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          📋 Formulir Reservasi Aula FST
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Ikuti langkah mudah di bawah untuk mengajukan peminjaman ruangan aula.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[
          { num: 1, label: 'Tipe' },
          { num: 2, label: 'Waktu' },
          { num: 3, label: 'Detail' },
          { num: 4, label: 'Konfirmasi' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-xl border text-center transition-all ${
              step === s.num
                ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-md shadow-blue-500/10'
                : step > s.num
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-white/[0.02] border-white/5 text-slate-500'
            }`}
          >
            <div className="text-xs font-mono font-bold">Langkah {s.num}</div>
            <div className="text-xs font-semibold mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="custom-card p-6 sm:p-8 shadow-2xl">
        {/* STEP 1: Tipe Booking */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-100">
              Pilih Tipe Peminjaman
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Hourly */}
              <div
                onClick={() => setBookingType('hourly')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  bookingType === 'hourly'
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/15'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-2">⏱️</div>
                <div className="font-extrabold text-slate-100">Per Jam</div>
                <div className="text-xs text-slate-400 mt-1">
                  Pilih jam mulai dan jam selesai dalam 1 hari tertentu.
                </div>
              </div>

              {/* Daily */}
              <div
                onClick={() => setBookingType('daily')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  bookingType === 'daily'
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/15'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-2">📅</div>
                <div className="font-extrabold text-slate-100">Per Hari</div>
                <div className="text-xs text-slate-400 mt-1">
                  Seharian penuh dari jam 07:00 hingga 17:00 WIB.
                </div>
              </div>

              {/* Weekly */}
              <div
                onClick={() => setBookingType('weekly')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  bookingType === 'weekly'
                    ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/15'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                }`}
              >
                <div className="text-2xl mb-2">📆</div>
                <div className="font-extrabold text-slate-100">Per Minggu</div>
                <div className="text-xs text-slate-400 mt-1">
                  Peminjaman berulang mingguan (1–4 minggu) untuk program rutin.
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut: Tentukan Waktu</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Tanggal & Waktu */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-100">
              Pilih Tanggal & Jam Peminjaman
            </h3>

            {/* Type: Hourly */}
            {bookingType === 'hourly' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tanggal Kegiatan
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={hourlyDate}
                    onChange={(e) => setHourlyDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Jam Mulai
                    </label>
                    <select
                      value={hourlyStart}
                      onChange={(e) => setHourlyStart(parseInt(e.target.value))}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, '0')}:00 WIB
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Jam Selesai
                    </label>
                    <select
                      value={hourlyEnd}
                      onChange={(e) => setHourlyEnd(parseInt(e.target.value))}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, '0')}:00 WIB
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Type: Daily */}
            {bookingType === 'daily' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Tanggal Kegiatan (Seharian Penuh)
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={dailyDate}
                    onChange={(e) => setDailyDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                  📅 Waktu booking harian otomatis dimulai dari pukul 07:00 hingga 17:00 WIB (10 jam).
                </div>
              </div>
            )}

            {/* Type: Weekly */}
            {bookingType === 'weekly' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tanggal Mulai Periode
                    </label>
                    <input
                      type="date"
                      min={todayStr}
                      value={weeklyStartDate}
                      onChange={(e) => setWeeklyStartDate(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Durasi Minggu
                    </label>
                    <select
                      value={weeklyDurationWeeks}
                      onChange={(e) => setWeeklyDurationWeeks(parseInt(e.target.value))}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      <option value={1}>1 Minggu</option>
                      <option value={2}>2 Minggu</option>
                      <option value={3}>3 Minggu</option>
                      <option value={4}>4 Minggu</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Pilih Hari dalam Seminggu
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { day: 0, label: 'Min' },
                      { day: 1, label: 'Sen' },
                      { day: 2, label: 'Sel' },
                      { day: 3, label: 'Rab' },
                      { day: 4, label: 'Kam' },
                      { day: 5, label: 'Jum' },
                      { day: 6, label: 'Sab' },
                    ].map(({ day, label }) => {
                      const selected = weeklyDays.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            if (selected) {
                              if (weeklyDays.length > 1) {
                                setWeeklyDays(weeklyDays.filter((d) => d !== day));
                              }
                            } else {
                              setWeeklyDays([...weeklyDays, day]);
                            }
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                            selected
                              ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                              : 'bg-white/[0.03] text-slate-400 border-white/10 hover:border-white/20'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Jam Mulai
                    </label>
                    <select
                      value={weeklyStartHour}
                      onChange={(e) => setWeeklyStartHour(parseInt(e.target.value))}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, '0')}:00 WIB
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Jam Selesai
                    </label>
                    <select
                      value={weeklyEndHour}
                      onChange={(e) => setWeeklyEndHour(parseInt(e.target.value))}
                      className="w-full p-3 rounded-xl bg-slate-900 border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((h) => (
                        <option key={h} value={h}>
                          {String(h).padStart(2, '0')}:00 WIB
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  Total tanggal terpilih: <span className="font-bold text-blue-400">{selectedDatesList.length} hari</span> ({selectedDatesList.join(', ')})
                </div>
              </div>
            )}

            {/* Conflict Alert Banner */}
            {conflictMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{conflictMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-white/10 flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <button
                disabled={Boolean(conflictMsg)}
                onClick={() => setStep(3)}
                className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer ${
                  conflictMsg
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                }`}
              >
                <span>Lanjut: Data Pemohon</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Detail Kegiatan & Pemohon */}
        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-100">
              Detail Kegiatan & Identitas Pemohon
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Kegiatan / Agenda *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Seminar Nasional Kecerdasan Buatan 2026"
                value={kegiatan}
                onChange={(e) => setKegiatan(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Penanggung Jawab Acara *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Penanggung Jawab"
                  value={penanggungJawab}
                  onChange={(e) => setPenanggungJawab(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Organisasi / Lembaga / Himpunan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: BEM FST / HIMATIF / Dosen"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Nomor WhatsApp Aktif *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="08xxxxxxxxxx"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="kontak@fst.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Catatan Tambahan (Opsional)
              </label>
              <textarea
                rows={2}
                placeholder="Kebutuhan khusus seperti susunan kursi, proyektor, atau mic tambahan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Document Upload */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Surat Permohonan / Proposal (PDF, Maks 5MB)
              </label>
              <div className="p-4 rounded-xl border-2 border-dashed border-white/15 hover:border-blue-500/50 bg-white/[0.02] text-center transition-colors">
                <input
                  type="file"
                  id="pdfUpload"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="pdfUpload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <Upload className="w-6 h-6 text-blue-400" />
                  <span className="text-xs font-medium text-slate-300">
                    {fileName ? (
                      <span className="text-emerald-400 font-bold">📄 {fileName}</span>
                    ) : (
                      'Klik untuk memilih file PDF atau drag & drop file ke sini'
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Format .pdf maksimal 5MB
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-white/10 flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <button
                onClick={() => {
                  if (validateStep3()) setStep(4);
                }}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut: Review Konfirmasi</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Konfirmasi */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-100">
              Ringkasan & Konfirmasi Reservasi
            </h3>

            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-500">Tipe Booking:</div>
                  <div className="font-bold text-slate-200 capitalize mt-0.5">
                    {bookingType === 'hourly' ? 'Per Jam' : bookingType === 'daily' ? 'Per Hari' : 'Per Minggu'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Waktu Pelaksanaan:</div>
                  <div className="font-bold text-blue-400 mt-0.5 font-mono">
                    {String(effectiveTimes.start).padStart(2, '0')}:00 – {String(effectiveTimes.end).padStart(2, '0')}:00 WIB
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Tanggal Terpilih ({selectedDatesList.length} hari):</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedDatesList.map((d) => (
                    <span
                      key={d}
                      className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono text-xs font-semibold"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500">Kegiatan: </span>
                  <span className="font-bold text-slate-200">{kegiatan}</span>
                </div>
                <div>
                  <span className="text-slate-500">Organisasi: </span>
                  <span className="font-semibold text-slate-200">{organization}</span>
                </div>
                <div>
                  <span className="text-slate-500">Penanggung Jawab: </span>
                  <span className="font-semibold text-slate-200">{penanggungJawab} ({noHp})</span>
                </div>
                {email && (
                  <div>
                    <span className="text-slate-500">Email: </span>
                    <span className="text-slate-300">{email}</span>
                  </div>
                )}
                {notes && (
                  <div>
                    <span className="text-slate-500">Catatan: </span>
                    <span className="text-slate-300 italic">{notes}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Lampiran Dokumen: </span>
                  <span className="text-slate-300">
                    {fileName ? `📄 ${fileName}` : 'Tidak dilampirkan'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Dengan menekan tombol di bawah, permohonan akan diteruskan kepada tim pengelola Aula FST untuk proses verifikasi.
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 border border-white/10 flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Kembali</span>
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-500/30 flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <span>Kirim Permohonan Booking</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
