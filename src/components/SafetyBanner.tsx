import React from 'react';
import { ShieldAlert, LifeBuoy } from 'lucide-react';

interface SafetyBannerProps {
  onOpenGuidelines: () => void;
  onOpenCrisis: () => void;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({ onOpenGuidelines, onOpenCrisis }) => {
  return (
    <div className="bg-slate-900 text-slate-200 py-2 px-3 sm:py-2.5 sm:px-6 border-b border-slate-800 text-xs w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 w-full min-w-0">
        <div className="flex items-start gap-2 min-w-0 flex-1">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 leading-snug break-words min-w-0">
            <span className="font-semibold text-white mr-1.5">Not a Dating App:</span>
            <span>DilSeSunn is strictly for anonymous empathetic peer listening. Flirting or asking for personal contacts triggers immediate account ban.</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 text-[11px] sm:text-xs pt-0.5 md:pt-0">
          <button
            onClick={onOpenGuidelines}
            className="text-amber-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            Safety Covenant
          </button>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <button
            onClick={onOpenCrisis}
            className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
          >
            <LifeBuoy className="w-3.5 h-3.5 shrink-0" />
            <span>Crisis Helpline (Free 24/7)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
