
// Simple analytics wrapper used across the app
// Provides a safe `track(eventName, payload)` function that falls back 
// to console logging when GA/gtag isn't available.

function safeGtag(eventName, payload) {
  try {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, payload || {});
      return true;
    }
  } catch (e) {
    // ignore
  }
  return false;
}

function safeGa4Calling(type, data) {
  try {
    if (typeof window !== 'undefined' && typeof window.ga4_calling === 'function') {
      window.ga4_calling(type, data);
      return true;
    }
  } catch (e) {}
  return false;
}

export default {
  track: (eventName, payload = {}) => {
    // Normalize payload to plain object
    const data = payload || {};

    // Prefer gtag if available
    if (safeGtag(eventName, data)) return;

    // Fallback to ga4_calling example if present
    if (safeGa4Calling(eventName, JSON.stringify(data))) return;

    // Final fallback: console
    try {
      console.log(`[Analytics Track] ${eventName}:`, data);
    } catch (e) {}
  }
};
