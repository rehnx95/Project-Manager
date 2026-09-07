// Owner-only testing gate. Exchange the configured key for a short-lived
// HttpOnly cookie before navigating to the protected testing console.
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("testingBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const key = prompt("Enter secret key:");
    if (!key) return; // cancelled or empty, do nothing
    fetch("/testing/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key.trim() }),
    })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Owner access denied");
        }
        window.location.href = "/testing";
      })
      .catch((error) => {
        alert(error.message);
      });
  });
});