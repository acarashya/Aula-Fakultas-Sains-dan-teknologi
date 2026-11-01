import React, { useState, useEffect } from 'react';
import { ActiveTab, AulaInfo, Booking, NotificationItem } from './types';
import { StorageService } from './services/store';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { BookingView } from './components/BookingView';
import { StatusView } from './components/StatusView';
import { AdminView } from './components/AdminView';
import { NotificationModal } from './components/NotificationModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { PwaBanner } from './components/PwaBanner';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>(StorageService.getTheme());
  const [aula, setAula] = useState<AulaInfo>(StorageService.getAulaInfo());
  const [bookings, setBookings] = useState<Booking[]>(StorageService.getBookings());

  // Notification state
  const [notifications, setNotifications] = useState<NotificationItem[]>(StorageService.getNotifications());
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Routing params
  const [bookingPrefilledDate, setBookingPrefilledDate] = useState<string>('');
  const [statusPrefilledId, setStatusPrefilledId] = useState<string>('');

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync theme
  useEffect(() => {
    StorageService.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const reloadData = () => {
    setAula(StorageService.getAulaInfo());
    setBookings(StorageService.getBookings());
    setNotifications(StorageService.getNotifications());
  };

  // Handle book specific date from home calendar
  const handleBookDate = (dateStr: string) => {
    setBookingPrefilledDate(dateStr);
    setActiveTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle navigate to status check
  const handleNavigateStatus = (bookingId: string) => {
    setStatusPrefilledId(bookingId);
    setActiveTab('status');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMarkNotifRead = (id: number) => {
    StorageService.markNotificationRead(id);
    setNotifications(StorageService.getNotifications());
  };

  const handleMarkAllNotifsRead = () => {
    StorageService.markAllNotificationsRead();
    setNotifications(StorageService.getNotifications());
    showToast('Semua notifikasi ditandai telah dibaca.', 'info');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <div className="relative z-40">
        <Navbar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          theme={theme}
          onToggleTheme={toggleTheme}
          unreadCount={unreadCount}
          onToggleNotifs={() => setIsNotifOpen(!isNotifOpen)}
          isNotifOpen={isNotifOpen}
        />

        <div className="max-w-7xl mx-auto px-4 relative">
          <NotificationModal
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            notifications={notifications}
            onMarkRead={handleMarkNotifRead}
            onMarkAllRead={handleMarkAllNotifsRead}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {activeTab === 'home' && (
          <HomeView
            aula={aula}
            bookings={bookings}
            onBookDate={handleBookDate}
            onNavigateBooking={() => {
              setBookingPrefilledDate('');
              setActiveTab('booking');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'booking' && (
          <BookingView
            initialDate={bookingPrefilledDate}
            onSuccess={() => reloadData()}
            onNavigateStatus={handleNavigateStatus}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'status' && (
          <StatusView
            initialSearchId={statusPrefilledId}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView onShowToast={showToast} />
        )}
      </main>

      {/* Connection & Mode Indicator */}
      <div className="fixed bottom-3 right-3 z-30 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-lg pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Sistem Aktif & Terhubung</span>
      </div>

      {/* PWA Promotion */}
      <PwaBanner />

      {/* Toast Overlay */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 px-4 text-center text-xs text-slate-500 bg-black/20">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>🏛️</span>
            <span className="font-semibold text-slate-400">
              Sistem Informasi Reservasi Aula FST
            </span>
            <span>•</span>
            <span>Fakultas Sains dan Teknologi</span>
          </div>
          <div>
            Layanan Reservasi Ruang Modern, Terintegrasi, & Transparan
          </div>
        </div>
      </footer>
    </div>
  );
};
