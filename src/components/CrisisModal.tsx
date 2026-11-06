import React, { useState, useEffect } from 'react';
import { X, Phone, MessageSquare, ExternalLink, Heart, Wind } from 'lucide-react';

interface CrisisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ isOpen, onClose }) => {
  const [breathingStep, setBreathingStep] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathingCount, setBreathingCount] = useState(4);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  useEffect(() => {
    if (!isBreathingActive) return;

    let timer: NodeJS.Timeout;
    if (breathingStep === 'Inhale') {
      if (breathingCount > 1) {
        timer = setTimeout(() => setBreathingCount(c => c - 1), 1000);
      } else {
        setBreathingStep('Hold');
        setBreathingCount(7);
      }
    } else if (breathingStep === 'Hold') {
      if (breathingCount > 1) {
        timer = setTimeout(() => setBreathingCount(c => c - 1), 1000);
      } else {
        setBreathingStep('Exhale');
        setBreathingCount(8);
      }
    } else if (breathingStep === 'Exhale') {
      if (breathingCount > 1) {
        timer = setTimeout(() => setBreathingCount(c => c - 1), 1000);
      } else {
        setBreathingStep('Inhale');
        setBreathingCount(4);
      }
    }

    return () => clearTimeout(timer);
  }, [breathingStep, breathingCount, isBreathingActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Heart className="w-5 h-5 fill-rose-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Immediate Crisis &amp; Safety Support</h2>
            <p className="text-xs text-slate-500">Free, confidential support available 24 hours a day, 7 days a week.</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          DilSeSunn is a peer-to-peer compassionate space, but we are not licensed crisis counselors. If you or someone you know is in acute danger or distress, please connect with specialized free lifelines immediately:
        </p>

        {/* Lifeline Cards - India-Specific Helplines */}
        <div className="space-y-3 mb-6">
          {/* Tele-MANAS - Primary Govt of India Mental Health Helpline */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-rose-900 text-sm">Tele-MANAS (Govt. of India)</span>
                <span className="text-[10px] bg-rose-200/80 text-rose-950 font-bold px-1.5 py-0.5 rounded">Toll-Free 24/7</span>
              </div>
              <div className="text-xs text-rose-700 mt-0.5">
                National Tele Mental Health Programme · 20+ Indian languages · 14416
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:14416"
                className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Call 14416
              </a>
              <a
                href="tel:18008914416"
                className="px-3 py-1.5 bg-white text-rose-700 border border-rose-300 rounded-lg text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5 transition-colors"
                title="Toll-Free alternative: 1800-891-4416"
              >
                <Phone className="w-3.5 h-3.5" /> 1800-891-4416
              </a>
            </div>
          </div>

          {/* KIRAN Helpline */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900 text-sm">KIRAN Mental Health Helpline</div>
              <div className="text-xs text-slate-600">Govt. Ministry of Social Justice &amp; Empowerment · 13 Languages · 24/7</div>
            </div>
            <a
              href="tel:18005990019"
              className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Call 1800-599-0019
            </a>
          </div>

          {/* Vandrevala Foundation - Call and WhatsApp support */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900 text-sm">Vandrevala Foundation</div>
              <div className="text-xs text-slate-600">Free, confidential 24/7 crisis intervention &amp; emotional counseling</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:+919999666555"
                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Call 9999 666 555
              </a>
              <a
                href="https://wa.me/919999666555"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </a>
            </div>
          </div>

          {/* National Emergency Services (India) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900 text-sm">National Emergency Helpline (India)</div>
              <div className="text-xs text-slate-600">Police, Ambulance, Fire &amp; Disaster immediate response · 112</div>
            </div>
            <a
              href="tel:112"
              className="px-3 py-1.5 bg-rose-700 text-white rounded-lg text-xs font-semibold hover:bg-rose-800 flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Call 112
            </a>
          </div>

          {/* International Support */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <div className="font-medium text-slate-800 text-xs">Outside India? Worldwide Helplines (Befrienders)</div>
              <div className="text-[11px] text-slate-500">Confidential emotional support directory in 32+ countries</div>
            </div>
            <a
              href="https://www.befrienders.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 flex items-center gap-1.5 shrink-0 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Find Local Line
            </a>
          </div>
        </div>

        {/* Calming 4-7-8 Breathing Guide */}
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 text-center">
          <div className="flex items-center justify-center gap-2 mb-2 text-indigo-900 font-semibold text-xs">
            <Wind className="w-4 h-4 text-indigo-600" />
            <span>Need to ground yourself right now? Try 4-7-8 calming breath</span>
          </div>
          {isBreathingActive ? (
            <div className="py-3">
              <div className="text-2xl font-bold text-indigo-950 mb-1">{breathingStep}</div>
              <div className="text-3xl font-mono tabular-nums text-indigo-600 font-bold mb-3">{breathingCount}</div>
              <button
                onClick={() => setIsBreathingActive(false)}
                className="text-xs text-indigo-700 hover:text-indigo-900 underline cursor-pointer"
              >
                Stop Breathing Exercise
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsBreathingActive(true);
                setBreathingStep('Inhale');
                setBreathingCount(4);
              }}
              className="mt-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Start Grounding Breathing
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Return to DilSeSunn
          </button>
        </div>
      </div>
    </div>
  );
};
