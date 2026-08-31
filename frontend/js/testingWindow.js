// Owner-only testing gate. Prompts for the secret key configured in
// the backend's .env (SECRET_KEY) and navigates to the protected
// /testing route. The backend checks the key — this file just collects
// it and does a plain page navigation, no fetch involved.
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("testingBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const key = prompt("Enter secret key:");
    if (!key) return; // cancelled or empty, do nothing
    window.location.href = "/testing?key=" + encodeURIComponent(key.trim());
  });
});