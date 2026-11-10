document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
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

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const phone = document.getElementById("phone").value.trim();
    const department = document.getElementById("department").value.trim();
    const position = document.getElementById("position").value.trim();
    const role = document.getElementById("role").value;

    if (password.length < 6) {
      showAlert("Password must be at least 6 characters long.");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";

    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone || null,
          department: department || null,
          position: position || null,
          role
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed. Please check your data.");
      }

      showAlert("Registration successful! Redirecting to login...", false);
      form.reset();

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);

    } catch (err) {
      showAlert(err.message, true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Register Account";
    }
  });
});
