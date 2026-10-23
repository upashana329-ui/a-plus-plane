import { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  X,
  Share2,
  MoreVertical,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Button from './ui/Button';

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already running in standalone (installed PWA) mode
    const checkStandalone = () => {
      const isRunningStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isRunningStandalone);
    };

    checkStandalone();

    // Check if user dismissed banner this session
    const dismissed = sessionStorage.getItem('aplus_pwa_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }

    // Capture Chrome's beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Capture app installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 5000);
    };

    // Custom event listener so other components (e.g. Navbar, Sidebar) can open the guide
    const handleOpenModal = () => setShowGuideModal(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('open-pwa-install-modal', handleOpenModal);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install-modal', handleOpenModal);
    };
  }, []);

  // Trigger native Chrome install dialog
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setDeferredPrompt(null);
          setIsDismissed(true);
        }
      } catch (err) {
        console.warn('Install prompt error:', err);
        setShowGuideModal(true);
      }
    } else {
      // If browser doesn't expose deferredPrompt, show step-by-step guide
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('aplus_pwa_dismissed', 'true');
  };

  // If already installed and running standalone, don't show the bottom banner
  const showBanner = !isStandalone && !isDismissed;

  const currentHostUrl = typeof window !== 'undefined' ? window.location.origin : 'http://10.248.194.244:5173';

  return (
    <>
      {/* Success banner if just installed */}
      {justInstalled && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 flex items-center gap-2.5 rounded-full bg-emerald-600 px-5 py-2.5 text-white shadow-xl animate-bounce">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-semibold">A+ Plane is now installed on your device!</span>
        </div>
      )}

      {/* Floating Bottom PWA Banner for Android & Mobile */}
      {showBanner && (
        <aside
          aria-label="Install A+ Plane App"
          className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-xl animate-fade-in sm:left-auto sm:right-6 sm:bottom-6"
        >
          <div className="relative overflow-hidden rounded-2xl border border-brand-200/80 bg-white/95 p-4 shadow-2xl backdrop-blur-md ring-1 ring-slate-900/5 sm:p-5">
            {/* Top Accent Gradient */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-600 via-indigo-500 to-sky-400" />

            <div className="flex items-start gap-3.5">
              {/* App Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-md shadow-brand-500/25">
                <Smartphone className="h-6 w-6 text-white" />
              </div>

              {/* Text info */}
              <div className="flex-1 pr-6">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-slate-900">Install A+ Plane App</h2>
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                    Android PWA
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Add to your Android home screen for instant full-screen campus access, faster speeds, and quick grievance tracking.
                </p>

                {/* Actions */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-brand-700 active:scale-95 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {deferredPrompt ? 'Install App' : 'Add to Home Screen'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowGuideModal(true)}
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                  >
                    How to install?
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Close button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-3.5 right-3.5 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                aria-label="Dismiss install banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Detailed Android Step-by-Step Installation Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Add A+ Plane to Android Home Screen
                  </h3>
                  <p className="text-xs text-slate-500">Standalone Progressive Web App (PWA)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="max-h-[75vh] overflow-y-auto px-6 py-5 space-y-4">
              <p className="text-sm text-slate-600">
                You can install <strong className="text-slate-900">A+ Plane</strong> directly onto your Android phone as a standalone application without using the Google Play Store:
              </p>

              {/* Instant install button if prompt is available */}
              {deferredPrompt && (
                <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-brand-900">Direct One-Click Install Available</p>
                    <p className="text-xs text-brand-700">Chrome is ready to add A+ Plane now.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700"
                  >
                    <Download className="h-4 w-4" /> Install Now
                  </button>
                </div>
              )}

              {/* Visual Step by Step Guide */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Step-by-Step Chrome Instructions
                </h4>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    1
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Open in Chrome for Android</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Open <code className="rounded bg-slate-200 px-1 py-0.5 text-brand-700 font-mono">{currentHostUrl}</code> on your Android phone's Google Chrome browser.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    2
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      Tap the Three Dots Menu <MoreVertical className="h-4 w-4 text-slate-700 inline" />
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tap the three vertical dots (⋮) in the top-right corner of Chrome.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    3
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Tap &ldquo;Add to Home screen&rdquo; or &ldquo;Install app&rdquo;
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select <strong>&ldquo;Install app&rdquo;</strong> (or <strong>&ldquo;Add to Home screen&rdquo;</strong>) from the Chrome menu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    4
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Launch A+ Plane as a Standalone App
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      The <strong>A+ Plane</strong> icon will appear on your phone&rsquo;s home screen and app drawer, opening in clean full-screen mode just like a native Android application!
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits Checklist */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Benefits of the Android App:
                </p>
                <ul className="text-xs text-slate-600 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Full-screen experience with no address bar
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    One-tap instant launch directly from home screen
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Fast cached loading with offline support
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-3.5 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowGuideModal(false)}
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
