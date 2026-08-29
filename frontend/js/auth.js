// Already signed in? skip the ticket screen.
if (getToken()) {
  window.location.href = "dashboard.html";
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("is-active"));
    document.querySelectorAll(".auth-form").forEach((f) => f.classList.remove("is-active"));
    tab.classList.add("is-active");
    document.getElementById(tab.dataset.tab + "Form").classList.add("is-active");
    document.getElementById("authHeading").textContent = tab.dataset.tab === "login" ? "Sign in" : "Register";
  });
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("registerError");
  errEl.textContent = "";
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;
  try {
    await api("/users/signup", { method: "POST", body: JSON.stringify({ email, password }) });
    toast("Account created — you can sign in now.");
    document.querySelector('[data-tab="login"]').click();
    document.getElementById("loginEmail").value = email;
  } catch (err) {
    errEl.textContent = err.message;
  }
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("loginError");
  errEl.textContent = "";
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  try {
    const data = await api("/users/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setToken(data.token);
    window.location.href = "dashboard.html";
  } catch (err) {
    errEl.textContent = err.message;
  }
});
