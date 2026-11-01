import React, { useState, useEffect } from 'react';
import { AdminTab, Booking, Stats } from '../types';
import { StorageService } from '../services/store';
import {
  Lock,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  Settings,
  XCircle,
  Trash2,
  Eye,
  FileText,
  Search,
  Filter,
  RefreshCw,
  KeyRound,
  Download,
} from 'lucide-react';

interface AdminViewProps {
  onShowToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onShowToast }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(StorageService.isAdminLoggedIn());
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin tabs
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<Stats>(StorageService.getStats());

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  // Settings
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const refreshData = () => {
    setBookings(StorageService.getBookings());
    setStats(StorageService.getStats());
  };

  useEffect(() => {
    if (isLoggedIn) {
      refreshData();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = StorageService.adminLogin(loginUser.trim(), loginPass);
    if (success) {
      setIsLoggedIn(true);
      onShowToast('Login admin berhasil.', 'success');
    } else {
      setLoginError('Username atau password salah.');
      onShowToast('Login gagal. Periksa username dan password.', 'error');
    }
  };

  const handleLogout = () => {
    StorageService.adminLogout();
    setIsLoggedIn(false);
    onShowToast('Anda telah logout dari panel admin.', 'info');
  };

  const handleApprove = (id: string) => {
    try {
      StorageService.updateBookingStatus(id, 'approved');
      refreshData();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(StorageService.trackBooking(id));
      }
      onShowToast(`Reservasi ${id} berhasil disetujui!`, 'success');
    } catch {
      onShowToast('Gagal menyetujui reservasi.', 'error');
    }
  };

  const openRejectModal = (id: string) => {
    setRejectingBookingId(id);
    setRejectReason('');
  };

  const confirmReject = () => {
    if (!rejectingBookingId) return;
    if (!rejectReason.trim()) {
      onShowToast('Wajib memberikan alasan penolakan.', 'warning');
      return;
    }

    try {
      StorageService.updateBookingStatus(rejectingBookingId, 'rejected', rejectReason.trim());
      refreshData();
      if (selectedBooking && selectedBooking.id === rejectingBookingId) {
        setSelectedBooking(StorageService.trackBooking(rejectingBookingId));
      }
      setRejectingBookingId(null);
      setRejectReason('');
      onShowToast(`Reservasi ${rejectingBookingId} berhasil ditolak.`, 'info');
    } catch {
      onShowToast('Gagal menolak reservasi.', 'error');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Yakin ingin menghapus reservasi ${id} secara permanen?`)) {
      StorageService.deleteBooking(id);
      refreshData();
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(null);
      }
      onShowToast(`Reservasi ${id} telah dihapus.`, 'info');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onShowToast('Konfirmasi password baru tidak cocok.', 'error');
      return;
    }

    try {
      StorageService.changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onShowToast('Password admin berhasil diubah!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah password.';
      onShowToast(msg, 'error');
    }
  };

  // If NOT Logged In, Render Login Page
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="custom-card p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl mx-auto mb-3 shadow-lg shadow-amber-500/10">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">
              Admin Login Aula FST
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Masuk untuk memverifikasi dan mengelola permohonan reservasi.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                placeholder="admin"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              Masuk ke Dashboard
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-slate-400">
            <p>
              Akun default: <span className="font-mono text-blue-400">admin</span> / <span className="font-mono text-blue-400">admin123</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filtered bookings
  const filteredBookings = bookings.filter((b) => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchQuery =
      !q ||
      b.id.toLowerCase().includes(q) ||
      b.kegiatan.toLowerCase().includes(q) ||
      b.organization.toLowerCase().includes(q) ||
      b.penanggung_jawab.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Subnav */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
              activeTab === 'bookings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Semua Reservasi</span>
            {pendingBookings.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-[10px] font-black flex items-center justify-center">
                {pendingBookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Pengaturan</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            title="Segarkan data"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="custom-card p-5 border-l-4 border-l-blue-500">
              <div className="text-xs text-slate-400 font-medium">Total Reservasi</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono mt-1">
                {stats.total}
              </div>
              <div className="text-[11px] text-blue-400 mt-1">Keseluruhan arsip</div>
            </div>

            <div className="custom-card p-5 border-l-4 border-l-amber-500">
              <div className="text-xs text-slate-400 font-medium">Menunggu Verifikasi</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-1">
                {stats.pending}
              </div>
              <div className="text-[11px] text-amber-300 mt-1">Perlu tindakan</div>
            </div>

            <div className="custom-card p-5 border-l-4 border-l-emerald-500">
              <div className="text-xs text-slate-400 font-medium">Disetujui</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono mt-1">
                {stats.approved}
              </div>
              <div className="text-[11px] text-emerald-300 mt-1">Jadwal aktif</div>
            </div>

            <div className="custom-card p-5 border-l-4 border-l-rose-500">
              <div className="text-xs text-slate-400 font-medium">Ditolak</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono mt-1">
                {stats.rejected}
              </div>
              <div className="text-[11px] text-rose-300 mt-1">Tidak memenuhi syarat</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 6-Month Usage Bar Chart */}
            <div className="custom-card p-5 sm:p-6">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center justify-between">
                <span>Tren Penggunaan (6 Bulan Terakhir)</span>
                <span className="text-xs font-normal text-slate-400">Total Reservasi</span>
              </h3>

              <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
                {stats.monthlyUsage.map((m) => {
                  const maxCount = Math.max(...stats.monthlyUsage.map((x) => x.count), 4);
                  const heightPct = Math.max(Math.round((m.count / maxCount) * 100), 12);
                  return (
                    <div key={m.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {m.count}
                      </span>
                      <div
                        style={{ height: `${heightPct}%` }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-blue-600/40 to-blue-500 transition-all duration-300"
                      />
                      <span className="text-[11px] text-slate-400 font-medium">
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Distribution Donut Chart */}
            <div className="custom-card p-5 sm:p-6 flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-200 mb-4">
                Distribusi Status Reservasi
              </h3>

              <div className="flex items-center justify-around py-4">
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    {/* Background Circle */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="3.5"
                    />
                    {/* Approved slice */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray={`${(stats.approved / (stats.total || 1)) * 94.2} 94.2`}
                      strokeDashoffset="0"
                    />
                    {/* Pending slice */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeDasharray={`${(stats.pending / (stats.total || 1)) * 94.2} 94.2`}
                      strokeDashoffset={`-${(stats.approved / (stats.total || 1)) * 94.2}`}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <div className="text-xl font-extrabold font-mono text-slate-100">
                      {stats.total}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Total</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-300">Disetujui:</span>
                    <span className="font-bold text-emerald-400">{stats.approved}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-slate-300">Menunggu:</span>
                    <span className="font-bold text-amber-400">{stats.pending}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-slate-300">Ditolak:</span>
                    <span className="font-bold text-rose-400">{stats.rejected}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
                Penggunaan hari ini: <span className="text-blue-400 font-bold">{stats.todayBookings} acara</span>
              </div>
            </div>
          </div>

          {/* Recent Pending Table */}
          <div className="custom-card p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-200">
                Reservasi Baru (Menunggu Verifikasi)
              </h3>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Lihat Semua Reservasi →
              </button>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                🎉 Tidak ada reservasi yang menunggu verifikasi saat ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">Waktu & Tanggal</th>
                      <th className="py-3 px-2">Kegiatan & Penanggung Jawab</th>
                      <th className="py-3 px-2">Dokumen</th>
                      <th className="py-3 px-2 text-right">Aksi Cepat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-white/[0.02]">
                        <td className="py-3 px-2 font-mono text-blue-400 font-bold whitespace-nowrap">
                          {b.id}
                        </td>
                        <td className="py-3 px-2 whitespace-nowrap">
                          <div className="font-mono text-slate-200">
                            {b.dates[0]} {b.dates.length > 1 ? `(+${b.dates.length - 1} hr)` : ''}
                          </div>
                          <div className="text-slate-500 text-[11px]">
                            {String(b.startTime).padStart(2, '0')}:00 – {String(b.endTime).padStart(2, '0')}:00 WIB
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-bold text-slate-200">{b.kegiatan}</div>
                          <div className="text-slate-400 text-[11px]">
                            {b.organization} • {b.penanggung_jawab}
                          </div>
                        </td>
                        <td className="py-3 px-2 whitespace-nowrap">
                          {b.dokumen ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-medium">
                              <FileText className="w-3.5 h-3.5" /> Ada
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                              title="Lihat Detail"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleApprove(b.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 font-bold"
                            >
                              Setujui
                            </button>
                            <button
                              onClick={() => openRejectModal(b.id)}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 font-bold"
                            >
                              Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SEMUA RESERVASI */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari ID, kegiatan, organisasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-48 p-2.5 rounded-xl bg-slate-900 border border-white/15 text-slate-100 text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Semua Status ({bookings.length})</option>
                <option value="pending">Menunggu ({stats.pending})</option>
                <option value="approved">Disetujui ({stats.approved})</option>
                <option value="rejected">Ditolak ({stats.rejected})</option>
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="custom-card p-5 sm:p-6 shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">ID</th>
                  <th className="py-3 px-2">Jadwal & Waktu</th>
                  <th className="py-3 px-2">Kegiatan & Pemohon</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Tidak ada reservasi yang cocok dengan filter atau kata kunci.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-2 font-mono text-blue-400 font-bold whitespace-nowrap">
                        {b.id}
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <div className="font-mono text-slate-200">
                          {b.dates[0]} {b.dates.length > 1 ? `(+${b.dates.length - 1} hr)` : ''}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {String(b.startTime).padStart(2, '0')}:00 – {String(b.endTime).padStart(2, '0')}:00 WIB
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-bold text-slate-200">{b.kegiatan}</div>
                        <div className="text-slate-400 text-[11px]">
                          {b.organization} • {b.penanggung_jawab} ({b.no_hp})
                        </div>
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        {b.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            ⏳ Menunggu
                          </span>
                        )}
                        {b.status === 'approved' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            ✅ Disetujui
                          </span>
                        )}
                        {b.status === 'rejected' && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                            ❌ Ditolak
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                            title="Detail"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {b.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(b.id)}
                                className="px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 font-bold"
                              >
                                Setujui
                              </button>
                              <button
                                onClick={() => openRejectModal(b.id)}
                                className="px-2 py-1 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 font-bold"
                              >
                                Tolak
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PENGATURAN */}
      {activeTab === 'settings' && (
        <div className="max-w-md mx-auto space-y-6 animate-in fade-in">
          <div className="custom-card p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
              <KeyRound className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-slate-100">
                Ubah Password Admin
              </h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Password Lama
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Password Baru (Min 6 karakter)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1.5">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer mt-2"
              >
                Simpan Perubahan Password
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="custom-card-solid max-w-lg w-full p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <div className="text-xs text-slate-400 font-mono">Detail Reservasi</div>
                <div className="text-base font-extrabold text-blue-400 font-mono">
                  {selectedBooking.id}
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">Kegiatan: </span>
                <span className="font-bold text-slate-100 text-sm block mt-0.5">
                  {selectedBooking.kegiatan}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-slate-400">Organisasi:</span>
                  <div className="font-semibold text-slate-200">{selectedBooking.organization}</div>
                </div>
                <div>
                  <span className="text-slate-400">Penanggung Jawab:</span>
                  <div className="font-semibold text-slate-200">{selectedBooking.penanggung_jawab}</div>
                </div>
                <div>
                  <span className="text-slate-400">WhatsApp:</span>
                  <div className="font-semibold text-blue-400 font-mono">{selectedBooking.no_hp}</div>
                </div>
                <div>
                  <span className="text-slate-400">Email:</span>
                  <div className="font-semibold text-slate-300">{selectedBooking.email || '-'}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400">Jadwal:</span>
                <div className="font-mono text-slate-200 mt-0.5">
                  {String(selectedBooking.startTime).padStart(2, '0')}:00 – {String(selectedBooking.endTime).padStart(2, '0')}:00 WIB
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedBooking.dates.map((d) => (
                    <span
                      key={d}
                      className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono text-[11px]"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <span className="text-slate-400">Catatan Pemohon:</span>
                  <p className="text-slate-300 italic mt-0.5 bg-white/[0.02] p-2.5 rounded-lg border border-white/5">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {selectedBooking.alasan_penolakan && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300">
                  <span className="font-bold">Alasan Penolakan: </span>
                  <span>{selectedBooking.alasan_penolakan}</span>
                </div>
              )}

              <div>
                <span className="text-slate-400">Lampiran Dokumen:</span>
                <div className="mt-1">
                  {selectedBooking.dokumen ? (
                    <a
                      href={selectedBooking.dokumen}
                      download={selectedBooking.dokumenName || 'Proposal.pdf'}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30 hover:bg-blue-600/30"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{selectedBooking.dokumenName || 'Unduh Dokumen PDF'}</span>
                    </a>
                  ) : (
                    <span className="text-slate-500 italic">Tidak ada lampiran dokumen</span>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={() => handleDelete(selectedBooking.id)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedBooking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => openRejectModal(selectedBooking.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 cursor-pointer"
                    >
                      Tolak
                    </button>
                    <button
                      onClick={() => handleApprove(selectedBooking.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      Setujui Reservasi
                    </button>
                  </>
                )}
                {selectedBooking.status !== 'pending' && (
                  <button
                    onClick={() => setSelectedBooking(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 text-slate-200 cursor-pointer"
                  >
                    Tutup
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {rejectingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="custom-card-solid max-w-md w-full p-6 rounded-2xl border border-white/10 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>Tolak Reservasi {rejectingBookingId}</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Silakan tuliskan alasan penolakan secara jelas agar pemohon memahami alasan keputusan ini:
            </p>

            <textarea
              rows={3}
              required
              placeholder="Contoh: Jadwal bertabrakan dengan agenda resmi dekanat, atau proposal permohonan belum ditandatangani pembina..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-white/[0.05] border border-white/15 text-slate-100 text-xs focus:border-rose-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingBookingId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmReject}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-500/20"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
