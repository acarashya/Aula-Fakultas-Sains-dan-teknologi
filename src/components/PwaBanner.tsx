import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const PwaBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('pwa_dismissed')) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    sessionStorage.setItem('pwa_dismissed', '1');
  };

  if (!showBanner || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 max-w-sm custom-card-solid p-3.5 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xl shrink-0">
        🏛️
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-slate-100 truncate">
          Pasang Aplikasi Aula FST
        </div>
        <div className="text-[11px] text-slate-400 mt-0.5 truncate">
          Akses cepat & dukungan offline
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
