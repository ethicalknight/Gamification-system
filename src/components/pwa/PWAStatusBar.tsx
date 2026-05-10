'use client';

import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Download, WifiOff, X } from 'lucide-react';
import { useState } from 'react';

export function PWAStatusBar() {
  const { isInstallable, promptInstall } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500/90 text-black text-xs font-semibold px-4 py-1.5 flex items-center justify-center gap-2 backdrop-blur-sm">
        <WifiOff className="w-3.5 h-3.5" />
        <span>You are offline. Some features may be unavailable.</span>
      </div>
    );
  }

  if (isInstallable && !dismissed) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] bg-primary/90 text-primary-foreground text-xs font-medium px-4 py-2 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          <span>Install SYSTEM for offline access</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={promptInstall}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-1 rounded-md transition-colors"
          >
            Install
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-white/20 rounded-md transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
