/**
 * Platform and environment detection helpers for DilSeSunn
 */

/**
 * Checks if the current environment is running inside the DilSeSunn native Android WebView app.
 * The Android app injects "DilSeSunnApp" into navigator.userAgent.
 */
export function isDilSeSunnAndroidApp(): boolean {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }
  const ua = window.navigator.userAgent || '';
  return ua.includes('DilSeSunnApp');
}

/**
 * React hook to reactively check whether app-download and install promotions should be hidden.
 * When running inside our Android app (navigator.userAgent includes "DilSeSunnApp"),
 * all install prompts, "App" buttons, and app download modals must be hidden.
 */
export function useIsAndroidApp(): boolean {
  // In browser/webview, userAgent is static per session
  return isDilSeSunnAndroidApp();
}
