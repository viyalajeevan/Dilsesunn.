import React, { useState } from 'react';
import { AnonymousUser, SupportRole } from '../types';
import { generateAnonymousIdentity, saveStoredUser } from '../utils/identity';
import { X, RefreshCw, Sparkles, Heart, Headphones, MessageCircle, Shield } from 'lucide-react';

interface IdentityModalProps {
  isOpen: boolean;
  user: AnonymousUser;
  onUpdateUser: (updated: AnonymousUser) => void;
  onClose: () => void;
}

const PALETTES = [
  { name: 'Indigo Dusk', hex: '#6366f1', gradient: 'from-indigo-500 to-slate-800' },
  { name: 'Sage Haven', hex: '#10b981', gradient: 'from-emerald-500 to-teal-800' },
  { name: 'Amber Hearth', hex: '#f59e0b', gradient: 'from-amber-500 to-orange-800' },
  { name: 'Sky Calm', hex: '#0ea5e9', gradient: 'from-sky-500 to-blue-800' },
  { name: 'Rose Solace', hex: '#f43f5e', gradient: 'from-rose-400 to-pink-800' },
  { name: 'Violet Peace', hex: '#8b5cf6', gradient: 'from-purple-500 to-indigo-900' }
];

export const IdentityModal: React.FC<IdentityModalProps> = ({
  isOpen,
  user,
  onUpdateUser,
  onClose
}) => {
  if (!isOpen) return null;

  const handleReroll = () => {
    const fresh = generateAnonymousIdentity();
    // preserve karma hugs
    fresh.karmaHugsReceived = user.karmaHugsReceived;
    fresh.listenedCount = user.listenedCount;
    fresh.supportRole = user.supportRole;
    saveStoredUser(fresh);
    onUpdateUser(fresh);
  };

  const handleSelectAura = (palette: typeof PALETTES[0]) => {
    const updated: AnonymousUser = {
      ...user,
      auraColor: palette.hex,
      auraGradient: palette.gradient
    };
    saveStoredUser(updated);
    onUpdateUser(updated);
  };

  const handleSelectRole = (role: SupportRole) => {
    const updated: AnonymousUser = {
      ...user,
      supportRole: role
    };
    saveStoredUser(updated);
    onUpdateUser(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pb-2">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold shadow-md transition-all"
            style={{ backgroundColor: user.auraColor }}
          >
            {user.alias.slice(0, 1)}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{user.alias}</h2>
          <div className="inline-block mt-1 font-mono text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
            {user.uniqueTag}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Your identity is 100% undisclosed. No real name, phone, or location is ever tied to this device.
          </p>
        </div>

        {/* Action: Re-roll */}
        <div className="mt-4">
          <button
            onClick={handleReroll}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Generate New Anonymous Pseudonym</span>
          </button>
        </div>

        {/* Aura Color Picker */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Choose Your Aura Presence
          </label>
          <div className="flex items-center justify-between gap-2">
            {PALETTES.map((p) => (
              <button
                key={p.name}
                onClick={() => handleSelectAura(p)}
                title={p.name}
                className={`w-8 h-8 rounded-full transition-transform cursor-pointer ${
                  user.auraColor === p.hex ? 'scale-125 ring-2 ring-slate-900 ring-offset-2' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: p.hex }}
              />
            ))}
          </div>
        </div>

        {/* Default Role Stance */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            What brings you here today?
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleSelectRole('sharer')}
              className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                user.supportRole === 'sharer'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-semibold mb-0.5">Need Shoulder</div>
              <div className="text-[11px] opacity-80">I want to share</div>
            </button>

            <button
              onClick={() => handleSelectRole('listener')}
              className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                user.supportRole === 'listener'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-semibold mb-0.5">Be a Shoulder</div>
              <div className="text-[11px] opacity-80">I want to listen</div>
            </button>

            <button
              onClick={() => handleSelectRole('open')}
              className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                user.supportRole === 'open'
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="font-semibold mb-0.5">Open to Both</div>
              <div className="text-[11px] opacity-80">Either is fine</div>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-around text-center text-xs">
          <div>
            <div className="font-bold text-slate-900 text-base tabular-nums flex items-center justify-center gap-1">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span>{user.karmaHugsReceived}</span>
            </div>
            <div className="text-[11px] text-slate-500">Warm Hugs Received</div>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <div className="font-bold text-slate-900 text-base tabular-nums flex items-center justify-center gap-1">
              <Headphones className="w-4 h-4 text-indigo-600" />
              <span>{user.listenedCount}</span>
            </div>
            <div className="text-[11px] text-slate-500">Listening Sessions</div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            Save &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
};
