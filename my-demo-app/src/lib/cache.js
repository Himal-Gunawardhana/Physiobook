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
      console.log('[Cache] Initializing clean cache state...');

      // Clear all service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        console.log(`[Cache] Found ${cacheNames.length} cache(s):`, cacheNames);
        
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log(`[Cache] Clearing cache: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
        console.log('[Cache] All service worker caches cleared');
      }

      // Unregister old service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`[Cache] Found ${registrations.length} service worker(s)`);
        
        for (const registration of registrations) {
          console.log('[Cache] Unregistering service worker:', registration.scope);
          await registration.unregister();
        }
      }

      // Clear potentially stale local storage
      const keysToPreserve = ['theme', 'language', 'onboarded']; // Add any keys you want to keep
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!keysToPreserve.includes(key)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        console.log(`[Cache] Clearing localStorage: ${key}`);
        localStorage.removeItem(key);
      });

      console.log('[Cache] Initialization complete');
    } catch (err) {
      console.error('[Cache] Initialization failed:', err);
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
