import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { isDilSeSunnAndroidApp } from '../utils/platform';
import {
  X,
  Smartphone,
  Apple,
  Globe,
  Download,
  Copy,
  Check,
  ExternalLink,
  Share2,
  PlusSquare,
  ShieldCheck,
  FileCode,
  Package,
  AlertTriangle,
  Info
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'iphone' | 'weblink'>('android');
  const [copied, setCopied] = useState(false);

  // If inside native Android wrapper app or closed, do not render
  if (!isOpen || isDilSeSunnAndroidApp()) return null;

  const activeUrl = typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
    ? window.location.origin
    : (typeof window !== 'undefined' ? window.location.href : '');

  const handleCopyLink = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Download className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Get DilSeSunn App</h2>
            <p className="text-xs text-slate-500">
              Android APK, iPhone Home Screen App &amp; Weblink
            </p>
          </div>
        </div>

        {/* Platform Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'android'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android APK</span>
          </button>

          <button
            onClick={() => setActiveTab('iphone')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'iphone'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iPhone App</span>
          </button>

          <button
            onClick={() => setActiveTab('weblink')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'weblink'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Weblink</span>
          </button>
        </div>

        {/* TAB 1: ANDROID APK */}
        {activeTab === 'android' && (
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Direct WebAPK Install */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <h3 className="font-bold text-emerald-950 text-sm mb-1 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>1. Direct Install on Android Phone (Easiest — Official WebAPK)</span>
              </h3>
              <p className="text-xs text-emerald-800 mb-3 leading-relaxed">
                Android natively compiles DilSeSunn into an installed <strong>WebAPK</strong> on your phone. It adds the official app icon to your phone screen and app drawer with no browser frame and complete offline support.
              </p>
              {isInstallable ? (
                <button
                  onClick={handleNativeInstall}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Install DilSeSunn on Android Now</span>
                </button>
              ) : (
                <div className="bg-emerald-100/70 p-2.5 rounded-lg text-[11px] text-emerald-900 space-y-1">
                  <div className="font-semibold flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-emerald-700" />
                    <span>How to install directly from your phone:</span>
                  </div>
                  <p>
                    Open this link on your phone in <strong>Chrome</strong> or <strong>Samsung Internet</strong> &rarr; tap the <strong>⋮ (three dots)</strong> menu &rarr; tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Direct APK Package ZIP Download */}
            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-2.5">
              <h3 className="font-bold text-indigo-950 text-sm flex items-center gap-1.5">
                <Package className="w-4 h-4 text-indigo-600" />
                <span>2. Download Android APK &amp; TWA Package (.zip)</span>
              </h3>
              <p className="text-xs text-indigo-900 leading-relaxed">
                Download the complete, ready-to-build Android package containing the verified <code>manifest.json</code>, Bubblewrap Trusted Web Activity config, high-resolution app icons, and offline launcher.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href="/api/download-apk-package"
                  download="DilSeSunn-Android-APK-Package.zip"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Android Package (.zip)</span>
                </a>
                <a
                  href="/api/download-manifest"
                  download="manifest.json"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold transition-colors"
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span>Download manifest.json</span>
                </a>
              </div>
            </div>

            {/* PWABuilder / Manifest explanation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Why did PWABuilder say &ldquo;Manifest description is missing&rdquo;?</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When online tools like PWABuilder or web crawlers fetch Google Cloud Run URLs, Google shows a security check: <em>&ldquo;The page you were on is trying to send you to...&rdquo;</em>. Automated bots cannot pass that screen, so they read Google&rsquo;s warning page instead of DilSeSunn and report that the manifest or description is missing.
              </p>
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <div className="font-semibold text-slate-900">How to generate .APK via PWABuilder:</div>
                <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-600">
                  <li>Click <strong>&ldquo;Download manifest.json&rdquo;</strong> above.</li>
                  <li>Open <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold underline">pwabuilder.com</a> and choose <strong>Upload Manifest</strong>.</li>
                  <li>Select the downloaded <code>manifest.json</code>.</li>
                  <li>Click <strong>Package for Stores</strong> &rarr; <strong>Android</strong> &rarr; <strong>Generate APK</strong>.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IPHONE APP */}
        {activeTab === 'iphone' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
              <div className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-slate-200" />
                <h3 className="font-bold text-sm">How to Install on iPhone / iPad (iOS Safari)</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Apple does not require the App Store to install DilSeSunn. You can install it directly to your iOS Home Screen with zero browser bars:
              </p>

              <div className="space-y-2.5 pt-1 text-xs text-slate-200">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-bold shrink-0">1</div>
                  <div>
                    Open the link in <strong>Safari</strong> on your iPhone.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-bold shrink-0">2</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Tap the</span>
                    <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-100">
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </span>
                    <span>button in Safari&rsquo;s bottom toolbar.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-bold shrink-0">3</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span>Scroll down and tap</span>
                    <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded font-semibold text-slate-100">
                      <PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px] font-bold shrink-0">4</div>
                  <div>
                    Tap <strong>&ldquo;Add&rdquo;</strong> in the top right corner.
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Once added, DilSeSunn opens as a full-screen native iOS app with high-resolution app icon, offline caching, and native audio calling support.
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: WEBLINK */}
        {activeTab === 'weblink' && (
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-slate-600 leading-relaxed">
              DilSeSunn is cloud-hosted and accessible from any web browser worldwide on mobile, tablet, and desktop computers.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold uppercase text-emerald-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>1. Active Live Link (Use This Link)</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">Online &amp; Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activeUrl}
                    className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-lg text-xs font-mono text-slate-800 focus:outline-none"
                  />
                  <button
                    onClick={() => handleCopyLink(activeUrl)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5 text-slate-900">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Seamless Cross-Platform Access</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                DilSeSunn runs natively in modern mobile and desktop browsers with responsive touch controls, real-time WebRTC audio signaling, and offline caching.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            DilSeSunn · Standalone PWA Architecture
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
