// src/services/offlineSync.js
export const registerBackgroundSync = async () => {
  try {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register("sync-problems");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error registering background sync:", error);
    return false;
  }
};

export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js",
        {
          scope: "/",
        }
      );
      console.log("Service Worker registration successful:", registration);

      // Set up background sync when service worker is ready
      if ("sync" in registration) {
        await registerBackgroundSync();
      }

      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }
  return null;
};

// Add status check function
export const checkOnlineStatus = () => {
  return new Promise((resolve) => {
    if (typeof navigator.onLine !== "undefined") {
      resolve(navigator.onLine);
    } else {
      // If navigator.onLine is not supported, assume online
      resolve(true);
    }
  });
};

// Add listener setup for online/offline events
export const setupNetworkListeners = (onOnline, onOffline) => {
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);

  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
};
