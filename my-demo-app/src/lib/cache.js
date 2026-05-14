/**
 * Cache Management Utility
 * Handles clearing stale caches and service worker updates
 * Prevents users from seeing outdated content after a browser refresh
 */

export const cacheManager = {
  /**
   * Clear all caches and force a fresh session restore
   * Call this on app initialization to prevent stale content
   */
  async initializeClean() {
    try {
      console.log('[Cache] Initializing...');

      // Clear all service worker caches
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          console.log(`[Cache] Found ${cacheNames.length} cache(s)`);
          
          await Promise.all(
            cacheNames.map(cacheName => {
              console.log(`[Cache] Clearing cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
          );
          console.log('[Cache] Service worker caches cleared');
        } catch (cacheErr) {
          console.warn('[Cache] Failed to clear caches:', cacheErr.message);
        }
      }

      // Unregister old service workers
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          console.log(`[Cache] Found ${registrations.length} service worker(s)`);
          
          for (const registration of registrations) {
            console.log('[Cache] Unregistering service worker');
            await registration.unregister();
          }
        } catch (swErr) {
          console.warn('[Cache] Failed to unregister service workers:', swErr.message);
        }
      }

      // Don't clear localStorage - it might contain important session data
      console.log('[Cache] Initialization complete');
    } catch (err) {
      console.error('[Cache] Initialization error:', err.message);
      // Don't throw — this shouldn't block app startup
    }
  },

  /**
   * Manually clear session data (called on logout)
   */
  clearSessionData() {
    try {
      console.log('[Cache] Clearing session data...');
      
      // Clear session-related localStorage
      const sessionKeys = ['activeClinic', 'lastRoute', 'userData'];
      sessionKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear sessionStorage
      sessionStorage.clear();

      console.log('[Cache] Session data cleared');
    } catch (err) {
      console.error('[Cache] Failed to clear session data:', err);
    }
  },

  /**
   * Register for updates to refresh the app when new version is available
   */
  registerForUpdates() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[Cache] New service worker activated, reloading...');
        window.location.reload();
      });
    }
  },
};

export default cacheManager;
