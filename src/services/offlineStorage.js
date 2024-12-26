// src/services/offlineStorage.js
import axios from "axios";

class OfflineStorageService {
  constructor() {
    this.STORAGE_KEY = "offline_problems";
  }

  async saveOfflineProblem(problemData) {
    try {
      const problems = await this.getOfflineProblems();
      problems.push({
        ...problemData,
        id: Date.now(),
        status: "pending_sync",
      });
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(problems));
      return true;
    } catch (error) {
      console.error("Error saving offline problem:", error);
      return false;
    }
  }

  async getOfflineProblems() {
    try {
      const problems = localStorage.getItem(this.STORAGE_KEY);
      return problems ? JSON.parse(problems) : [];
    } catch (error) {
      console.error("Error getting offline problems:", error);
      return [];
    }
  }

  async syncOfflineProblems() {
    try {
      const problems = await this.getOfflineProblems();
      const syncedProblems = [];

      for (const problem of problems) {
        if (problem.status === "pending_sync") {
          try {
            await axios.post("/api/problems", problem, {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            syncedProblems.push(problem.id);
          } catch (error) {
            console.error("Error syncing problem:", error);
          }
        }
      }

      // Remove synced problems from storage
      const updatedProblems = problems.filter(
        (problem) => !syncedProblems.includes(problem.id)
      );
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedProblems));

      return syncedProblems.length;
    } catch (error) {
      console.error("Error syncing offline problems:", error);
      return 0;
    }
  }

  clearOfflineProblems() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const OfflineStorage = new OfflineStorageService();

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

// Register service worker
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/service-worker.js"
      );
      console.log("Service Worker registered:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }
  return null;
};
