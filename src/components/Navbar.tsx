import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { Bell, Sun, Moon, Menu, X, Shield, Search, PlusCircle, Home } from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  unreadCount: number;
  onToggleNotifs: () => void;
  isNotifOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  unreadCount,
  onToggleNotifs,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { tab: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'home', label: 'Beranda', icon: <Home className="w-4 h-4" /> },
    { tab: 'booking', label: 'Booking', icon: <PlusCircle className="w-4 h-4" /> },
    { tab: 'status', label: 'Cek Status', icon: <Search className="w-4 h-4" /> },
    { tab: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-white/10 transition-colors duration-200" style={{ background: 'var(--nav-bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div
            onClick={() => onTabChange('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl shadow-lg shadow-blue-500/10 group-hover:scale-105 transition-transform">
              🏛️
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight leading-none text-slate-100 flex items-center gap-1.5">
                <span>Aula FST</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  v3.0
                </span>
              </div>
              <div className="text-xs text-slate-400 font-medium mt-0.5">
                Sistem Reservasi Modern
              </div>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              const isAdmin = item.tab === 'admin';
              return (
                <button
                  key={item.tab}
                  onClick={() => onTabChange(item.tab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isAdmin
                      ? isActive
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                        : 'text-amber-400/90 hover:bg-amber-500/10 border border-amber-500/20'
                      : isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Actions: Theme & Notifications */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-blue-400" />}
            </button>

            <div className="relative">
              <button
                onClick={onToggleNotifs}
                className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-white/5 relative"
                title="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse shadow-md">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-white/10 space-y-1 bg-slate-950/95 backdrop-blur-xl">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  onTabChange(item.tab);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
};
