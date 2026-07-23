'use client';

import React, { useState, useEffect } from 'react';
import { RotateCw, X } from 'lucide-react';

export const OrientationPrompt: React.FC = () => {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      const isMobileSize = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobileSize && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleForceLandscape = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if (typeof screen !== 'undefined' && screen.orientation && 'lock' in screen.orientation) {
        await (screen.orientation as any).lock('landscape');
      }
    } catch {
      // Fallback
    }
  };

  if (!isPortraitMobile || dismissed) return null;

  return (
    <div className="z-50 bg-amber-500/10 border-b border-amber-500/30 px-3 py-1.5 backdrop-blur-md flex items-center justify-between text-xs text-amber-200">
      <div className="flex items-center space-x-2">
        <RotateCw className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
        <span>Rotate phone for optimal landscape card table view</span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleForceLandscape}
          className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 rounded text-[11px] font-bold text-amber-300"
        >
          Rotate
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:text-white text-amber-400"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
