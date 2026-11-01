import React from 'react';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: number) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const bgColors = {
          success: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200',
          error: 'bg-red-950/90 border-red-500/40 text-red-200',
          warning: 'bg-amber-950/90 border-amber-500/40 text-amber-200',
          info: 'bg-blue-950/90 border-blue-500/40 text-blue-200',
        }[t.type];

        const icons = {
          success: '✅',
          error: '❌',
          warning: '⚠️',
          info: 'ℹ️',
        }[t.type];

        return (
          <div
            key={t.id}
            onClick={() => onRemove(t.id)}
            className={`pointer-events-auto flex items-center gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md cursor-pointer transition-all duration-200 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 ${bgColors}`}
          >
            <span className="text-base">{icons}</span>
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(t.id);
              }}
              className="text-xs opacity-60 hover:opacity-100 px-1"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
