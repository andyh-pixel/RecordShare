// auth.js

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtns = document.querySelectorAll(".auth-toggle-btn");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const title = document.getElementById("auth-title");
  const sub = document.getElementById("auth-sub");

  // --- TOGGLE LOGIN / REGISTER ---

  if (toggleBtns.length && loginForm && registerForm && title && sub) {
    toggleBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const mode = btn.dataset.mode;

        toggleBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        if (mode === "login") {
          loginForm.classList.add("active");
          registerForm.classList.remove("active");
          title.textContent = "Login";
          sub.textContent = "Enter your email and password.";
        } else {
          loginForm.classList.remove("active");
          registerForm.classList.add("active");
          title.textContent = "Register";
          sub.textContent = "Enter your information below to register.";
        }
      });
    });
  }

  // --- SIMPLE LOGIN LOGIC: admin/admin and artist/artist ---

  const loginBtn = loginForm ? loginForm.querySelector(".btn-primary") : null;

  if (loginForm && loginBtn) {
    loginBtn.addEventListener("click", () => {
      const emailInput = document.getElementById("login-email");
      const passInput = document.getElementById("login-password");

      const email = (emailInput?.value || "").trim().toLowerCase();
      const password = (passInput?.value || "").trim();

      // Admin credentials
      const isAdminUser =
        (email === "admin" || email === "admin@admin.com") &&
        password === "admin";

      // Artist credentials
      const isArtistUser =
        (email === "artist" || email === "artist@artist.com") &&
        password === "artist";

      if (isAdminUser) {
        // Save role 
        try {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({ role: "admin", email })
          );
        } catch (err) {
          console.error("Error saving currentUser", err);
        }

        // Redirect to Admin Dashboard
        window.location.href = "admin-dashboard.html";
      } else if (isArtistUser) {
        // Save role
        try {
          localStorage.setItem(
            "currentUser",
            JSON.stringify({ role: "artist", email })
          );
        } catch (err) {
          console.error("Error saving currentUser", err);
        }

        // Redirect to Artist Dashboard
        window.location.href = "artist-dashboard.html";
      } else {
        alert("Invalid credentials. Use admin/admin or artist/artist.");
      }
    });
  }
});
