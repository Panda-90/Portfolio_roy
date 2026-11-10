document.addEventListener("DOMContentLoaded", () => {
  // If already logged in, redirect
  const token = getToken();
  const role = getUserRole();
  if (token && role) {
    if (role.toLowerCase() === "admin") {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "employee-dashboard.html";
    }
    return;
  }

  const form = document.getElementById("loginForm");
  const alertBox = document.getElementById("alertBox");
  const submitBtn = document.getElementById("submitBtn");

  function showAlert(msg, isError = true) {
    alertBox.textContent = msg;
    alertBox.className = isError ? "alert alert-danger" : "alert alert-success";
    alertBox.style.display = "block";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing In...";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Invalid email or password");
      }

      setSession(data.access_token, data.role, data.name);

      showAlert("Login successful! Redirecting...", false);

      setTimeout(() => {
        if (data.role.toLowerCase() === "admin") {
          window.location.href = "admin-dashboard.html";
        } else {
          window.location.href = "employee-dashboard.html";
        }
      }, 700);

    } catch (err) {
      showAlert(err.message, true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Sign In";
    }
  });
});
