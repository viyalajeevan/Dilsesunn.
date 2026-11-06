import React from 'react';
import { X, ShieldCheck, HeartHandshake, Lock, AlertTriangle, Users } from 'lucide-react';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close guidelines"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">DilSeSunn Community Covenant</h2>
            <p className="text-xs text-slate-500">Our collective pledge for a safe, judgment-free sanctuary.</p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-slate-700 mb-6">
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 text-sm">1. Absolutely Not a Dating or Fling App</h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  DilSeSunn exists solely to support people through vulnerable emotional moments, loneliness, health challenges, and personal dilemmas. Any romantic solicitation, flirting, sexual comments, or "looking for hookups" will result in an immediate permanent ban.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">2. Complete Anonymity</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Your identity remains undisclosed under your unique pseudonym tag (e.g. #calm-wanderer-914). Never ask for or reveal real names, phone numbers, social media handles, or physical locations.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <HeartHandshake className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">3. Listen Before Fixing</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Check whether the person needs gentle advice or just wants to be heard. Often, the kindest response is simply acknowledging someone’s pain without rushing to give unsolicited advice.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">4. Zero Judgments &amp; Safe Boundaries</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  People come here from every walk of life. Be respectful, refrain from condescending remarks, and feel free to end any chat or call instantly if you ever feel uncomfortable.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            I Accept the Covenant &amp; Pledge Empathy
          </button>
        </div>
      </div>
    </div>
  );
};
