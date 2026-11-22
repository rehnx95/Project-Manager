const STORAGE_KEY = "depot_pending_profile";

export function getPendingProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function savePendingProfile(profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearPendingProfile() {
  localStorage.removeItem(STORAGE_KEY);
}
