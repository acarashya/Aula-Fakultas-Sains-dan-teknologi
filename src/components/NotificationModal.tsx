import React from 'react';
import { NotificationItem } from '../types';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  const formatTimeAgo = (iso: string) => {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'Baru saja';
    if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-14 w-80 sm:w-96 custom-card-solid shadow-2xl border border-white/10 rounded-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-3.5 px-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Notifikasi</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
              {notifications.filter((n) => !n.read).length} baru
            </span>
          </div>
          <button
            onClick={onMarkAllRead}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Tandai Semua Dibaca
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Tidak ada notifikasi
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={`p-3.5 flex gap-3 hover:bg-white/[0.04] transition-colors cursor-pointer ${
                  !n.read ? 'bg-blue-500/[0.06]' : ''
                }`}
              >
                <div className="mt-0.5">{getIcon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {n.title}
                    </p>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {formatTimeAgo(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {n.body}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 self-center shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};
