import React, { useState } from 'react';
import { AnonymousUser } from '../types';
import { MatchingStats } from '../types/peerSupport';
import { isDilSeSunnAndroidApp } from '../utils/platform';
import {
  ShieldCheck,
  HeartHandshake,
  Headphones,
  Heart,
  Smartphone,
  Menu,
  X,
  LifeBuoy,
  Layers,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  user: AnonymousUser;
  stats: MatchingStats;
  activeTab: 'sanctuary' | 'rooms' | 'resources';
  onSelectTab: (tab: 'sanctuary' | 'rooms' | 'resources') => void;
  onOpenMatchmaker: () => void;
  onOpenListenerPortal: () => void;
  onOpenIdentityModal: () => void;
  onOpenGuidelinesModal: () => void;
  onOpenCrisisModal: () => void;
  onOpenInstallModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  stats,
  activeTab,
  onSelectTab,
  onOpenMatchmaker,
  onOpenListenerPortal,
  onOpenIdentityModal,
  onOpenGuidelinesModal,
  onOpenCrisisModal,
  onOpenInstallModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAndroidNativeApp = isDilSeSunnAndroidApp();

  const handleTabClick = (tab: 'sanctuary' | 'rooms' | 'resources') => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 w-full overflow-hidden">
      {/* Primary Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Wordmark & Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); handleTabClick('sanctuary'); }}
            className="flex items-center gap-2 group min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform shrink-0">
              <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-300" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate">
                DilSeSunn
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide -mt-1 hidden lg:inline truncate">
                Anonymous Empathetic Peer Support
              </span>
            </div>
          </a>
        </div>

        {/* Desktop Navigation (visible on md: 768px and up) */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs lg:text-sm font-medium text-slate-600">
          <button
            onClick={() => onSelectTab('sanctuary')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'sanctuary'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            Sanctuary Wall
          </button>

          <button
            onClick={() => onSelectTab('rooms')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer ${
              activeTab === 'rooms'
                ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                : 'hover:text-slate-900'
            }`}
          >
            Support Topics
          </button>

          <button
            onClick={onOpenListenerPortal}
            className="whitespace-nowrap hover:text-slate-900 transition-colors py-1 flex items-center gap-1.5 cursor-pointer text-indigo-700 font-medium"
          >
            <Headphones className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-indigo-600 shrink-0" />
            <span>Be a Shoulder ({stats.availableListenersCount})</span>
          </button>

          <button
            onClick={onOpenGuidelinesModal}
            className="whitespace-nowrap hover:text-slate-900 transition-colors py-1 flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-600 shrink-0" />
            <span>Covenant</span>
          </button>

          <button
            onClick={onOpenCrisisModal}
            className="whitespace-nowrap text-rose-600 hover:text-rose-700 transition-colors py-1 font-semibold cursor-pointer"
          >
            Crisis (14416)
          </button>
        </nav>

        {/* Right Action Elements */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* App download button: HIDDEN when inside DilSeSunnApp */}
          {!isAndroidNativeApp && (
            <button
              onClick={onOpenInstallModal}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-900 transition-colors text-xs font-semibold cursor-pointer shrink-0"
              title="Install as Android APK or iPhone app, or copy weblink"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Get App</span>
            </button>
          )}

          {/* User Anonymous ID Pill */}
          <button
            onClick={onOpenIdentityModal}
            title="Your anonymous unique ID (click to customize)"
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-[11px] sm:text-xs font-mono font-medium text-slate-700 cursor-pointer shrink-0 max-w-[130px] sm:max-w-none"
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: user.auraColor }}
            />
            <span className="truncate">{user.uniqueTag}</span>
          </button>

          {/* Desktop Primary CTA: "I just need someone to listen" (Hidden under 768px to avoid horizontal overflow) */}
          <button
            onClick={onOpenMatchmaker}
            className="hidden md:flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 text-xs lg:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all hover:scale-[1.01] active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 shrink-0" />
            <span className="hidden xl:inline">I just need someone to listen</span>
            <span className="xl:hidden">Need a Listener</span>
          </button>

          {/* Mobile Quick Listen Heart Button (under 768px) */}
          <button
            onClick={onOpenMatchmaker}
            className="md:hidden flex items-center justify-center p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer shrink-0 transition-transform active:scale-95"
            title="I just need someone to listen"
            aria-label="I just need someone to listen"
          >
            <Heart className="w-4 h-4 fill-white" />
          </button>

          {/* Mobile Hamburger Toggle (under 768px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Horizontal Sub-Navigation Strip (< 768px) */}
      <div className="md:hidden border-t border-slate-100 bg-slate-50/90 px-3 py-1.5 overflow-x-auto scrollbar-none flex items-center gap-1.5 w-full">
        <button
          onClick={() => handleTabClick('sanctuary')}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === 'sanctuary'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          Sanctuary Wall
        </button>

        <button
          onClick={() => handleTabClick('rooms')}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
            activeTab === 'rooms'
              ? 'bg-slate-900 text-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200'
          }`}
        >
          Support Topics
        </button>

        <button
          onClick={onOpenListenerPortal}
          className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer text-indigo-700 bg-indigo-50 border border-indigo-200 flex items-center gap-1"
        >
          <Headphones className="w-3 h-3 text-indigo-600" />
          <span>Be a Shoulder ({stats.availableListenersCount})</span>
        </button>

        <button
          onClick={onOpenCrisisModal}
          className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer text-rose-700 bg-rose-50 border border-rose-200"
        >
          Crisis (14416)
        </button>
      </div>

      {/* Mobile Slide-down Hamburger Menu Drawer (< 768px) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          {/* Mobile Main CTA Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenMatchmaker();
            }}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.99] cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-rose-300 text-rose-300 shrink-0" />
            <span className="truncate">“I just need someone to listen”</span>
          </button>

          {/* Listener Portal CTA */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenListenerPortal();
            }}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-slate-100 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Headphones className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Be a Shoulder ({stats.availableListenersCount} online)</span>
          </button>

          <div className="border-t border-slate-100 pt-2 space-y-1 text-sm font-medium text-slate-700">
            <button
              onClick={() => handleTabClick('sanctuary')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                activeTab === 'sanctuary' ? 'bg-slate-100 font-semibold text-slate-900' : 'hover:bg-slate-50'
              }`}
            >
              <span>Sanctuary Wall</span>
              <span className="text-xs text-slate-400 font-normal">Community stories</span>
            </button>

            <button
              onClick={() => handleTabClick('rooms')}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                activeTab === 'rooms' ? 'bg-slate-100 font-semibold text-slate-900' : 'hover:bg-slate-50'
              }`}
            >
              <span>Support Topics &amp; Rooms</span>
              <span className="text-xs text-slate-400 font-normal">Loneliness, health, grief</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGuidelinesModal();
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Safety Covenant &amp; Non-Dating Policy</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCrisisModal();
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-2 text-rose-600 font-semibold cursor-pointer"
            >
              <LifeBuoy className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Crisis Hotlines (India Tele-MANAS 14416 / 112)</span>
            </button>

            {/* ONLY show App install button if NOT running inside native Android app */}
            {!isAndroidNativeApp && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInstallModal();
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 transition-colors flex items-center gap-2 font-medium cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Get DilSeSunn App (APK / iPhone)</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenIdentityModal();
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-between text-slate-600 cursor-pointer border-t border-slate-100 mt-2 pt-2"
            >
              <span className="text-xs">Your Anonymous Alias:</span>
              <span className="font-mono text-xs text-slate-900 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: user.auraColor }} />
                {user.uniqueTag}
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
