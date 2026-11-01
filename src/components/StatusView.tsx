import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { StorageService } from '../services/store';
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  AlertTriangle,
  Download,
} from 'lucide-react';

interface StatusViewProps {
  initialSearchId?: string;
  onShowToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const StatusView: React.FC<StatusViewProps> = ({
  initialSearchId = '',
  onShowToast,
}) => {
  const [searchId, setSearchId] = useState(initialSearchId);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (initialSearchId) {
      setSearchId(initialSearchId);
      doSearch(initialSearchId);
    }
  }, [initialSearchId]);

  const doSearch = (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setIsSearching(true);
    setNotFound(false);

    try {
      const result = StorageService.trackBooking(idToSearch.trim());
      setBooking(result);
    } catch {
      setBooking(null);
      setNotFound(true);
      onShowToast('Reservasi tidak ditemukan. Pastikan ID booking Anda benar.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(searchId);
  };

  const allBookings = StorageService.getBookings();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Search Header Card */}
      <div className="custom-card p-6 sm:p-8 text-center shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-3xl mx-auto mb-4">
          🔍
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Cek Status Reservasi
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Masukkan ID Booking Anda (contoh: BKG-DEMO001 atau ID yang didapatkan saat pendaftaran).
        </p>

        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              required
              placeholder="BKG-XXXX-XXXX"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 font-mono text-sm focus:border-blue-500 focus:outline-none uppercase tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{isSearching ? 'Mencari...' : 'Cari Reservasi'}</span>
          </button>
        </form>

        {/* Quick Demo ID helper */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-400">
          <span>Contoh ID:</span>
          {allBookings.slice(0, 3).map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setSearchId(b.id);
                doSearch(b.id);
              }}
              className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-blue-400 border border-white/10 font-mono transition-colors"
            >
              {b.id}
            </button>
          ))}
        </div>
      </div>

      {/* Not Found Alert */}
      {notFound && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-sm text-center animate-in fade-in">
          <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-rose-400" />
          <span className="font-bold">ID Booking tidak ditemukan.</span>
          <p className="text-xs text-rose-300/80 mt-1">
            Silakan periksa kembali kombinasi karakter ID yang tercantum pada bukti pendaftaran Anda.
          </p>
        </div>
      )}

      {/* Result Card */}
      {booking && (
        <div className="custom-card p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-white/10">
            <div>
              <div className="text-xs text-slate-400 font-medium">Nomor Reservasi</div>
              <div className="text-lg sm:text-xl font-extrabold font-mono text-blue-400 tracking-wider">
                {booking.id}
              </div>
            </div>

            {/* Status Badge */}
            <div>
              {booking.status === 'pending' && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Menunggu Verifikasi</span>
                </div>
              )}
              {booking.status === 'approved' && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reservasi Disetujui</span>
                </div>
              )}
              {booking.status === 'rejected' && (
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reservasi Ditolak</span>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="py-2">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {/* Step 1: Diajukan */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                <span>1. Diajukan</span>
              </div>

              {/* Step 2: Verifikasi */}
              <div
                className={`p-3 rounded-xl border font-semibold ${
                  booking.status === 'pending'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}
              >
                <Clock className="w-4 h-4 mx-auto mb-1" />
                <span>2. Verifikasi Admin</span>
              </div>

              {/* Step 3: Keputusan */}
              <div
                className={`p-3 rounded-xl border font-semibold ${
                  booking.status === 'approved'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : booking.status === 'rejected'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-white/[0.02] border-white/5 text-slate-500'
                }`}
              >
                {booking.status === 'approved' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                    <span>3. Disetujui</span>
                  </>
                ) : booking.status === 'rejected' ? (
                  <>
                    <XCircle className="w-4 h-4 mx-auto mb-1 text-rose-400" />
                    <span>3. Ditolak</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                    <span>3. Keputusan</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Rejection Alert If Rejected */}
          {booking.status === 'rejected' && booking.alasan_penolakan && (
            <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-200 text-xs sm:text-sm">
              <div className="font-bold flex items-center gap-1.5 mb-1 text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Alasan Penolakan:</span>
              </div>
              <p className="leading-relaxed">{booking.alasan_penolakan}</p>
            </div>
          )}

          {/* Booking Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
              <div className="font-bold text-slate-200 text-sm">Informasi Kegiatan</div>
              <div>
                <span className="text-slate-400">Nama Acara: </span>
                <span className="font-semibold text-slate-200">{booking.kegiatan}</span>
              </div>
              <div>
                <span className="text-slate-400">Organisasi: </span>
                <span className="font-semibold text-slate-200">{booking.organization}</span>
              </div>
              <div>
                <span className="text-slate-400">Tipe Booking: </span>
                <span className="font-semibold text-slate-200 capitalize">
                  {booking.bookingType === 'hourly' ? 'Per Jam' : booking.bookingType === 'daily' ? 'Per Hari' : 'Per Minggu'}
                </span>
              </div>
              {booking.notes && (
                <div>
                  <span className="text-slate-400">Catatan: </span>
                  <span className="text-slate-300 italic">{booking.notes}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2.5">
              <div className="font-bold text-slate-200 text-sm">Jadwal & Waktu</div>
              <div>
                <span className="text-slate-400">Jam Pelaksanaan: </span>
                <span className="font-mono font-semibold text-blue-400">
                  {String(booking.startTime).padStart(2, '0')}:00 – {String(booking.endTime).padStart(2, '0')}:00 WIB
                </span>
              </div>
              <div>
                <span className="text-slate-400">Tanggal ({booking.dates.length} hari):</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {booking.dates.map((d) => (
                    <span
                      key={d}
                      className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono text-[11px]"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-slate-400">Penanggung Jawab: </span>
                <span className="text-slate-200 font-semibold">{booking.penanggung_jawab} ({booking.no_hp})</span>
              </div>
            </div>
          </div>

          {/* Document Section */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-blue-400" />
              <div className="text-xs">
                <span className="text-slate-400">Dokumen Lampiran: </span>
                <span className="font-semibold text-slate-200">
                  {booking.dokumenName || (booking.dokumen ? 'Proposal_Kegiatan.pdf' : 'Tidak dilampirkan')}
                </span>
              </div>
            </div>

            {booking.dokumen ? (
              <a
                href={booking.dokumen}
                download={booking.dokumenName || 'Proposal_Kegiatan.pdf'}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Dokumen</span>
              </a>
            ) : (
              <span className="text-slate-500 text-xs italic">-</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
