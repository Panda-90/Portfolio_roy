document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            try {
                const response = await fetch("http://127.0.0.1:8003/login", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                });

                if (response.ok) {
                    // Login successful
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    window.location.href = '../index.html';
                } else {
                    // Login failed
                    errorMessage.textContent = "Invalid credentials. Please try again.";
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                console.warn("Backend request failed, checking static fallback:", error);
                
                // Fallback for static demo or port mismatch
                if (username === "admin" && password === "admin123") {
                    console.log("Logged in using static fallback.");
                    localStorage.setItem('isAdminLoggedIn', 'true');
                    window.location.href = '../index.html';
                } else {
                    errorMessage.textContent = "Invalid credentials. Please check username and password.";
                    errorMessage.style.display = 'block';
                }
            }
        });
    }
});
