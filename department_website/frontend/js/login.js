const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const API_BASE = (window.location.protocol === 'http:' || window.location.protocol === 'https:') && window.location.port === "8001"
    ? ""
    : "http://127.0.0.1:8001";

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(`${API_BASE}/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })

        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem(
                "access_token",
                data.access_token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            loginMessage.textContent = "Login successful!";
            loginMessage.style.color = "green";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 500);

        } else {

            loginMessage.textContent =
                data.detail || "Invalid email or password";

            loginMessage.style.color = "red";
        }

    } catch (error) {

        console.warn("Backend offline, providing demo session...", error);
        localStorage.setItem("access_token", "demo-token-dept");
        localStorage.setItem("user", JSON.stringify({
            id: 1,
            full_name: "Chanchal Roy",
            course: "Computer Science",
            email: email || "chanchal@dept.edu",
            phone: "+91 9876543210"
        }));
        loginMessage.textContent = "Backend offline — Logged in with Demo Account!";
        loginMessage.style.color = "#0284c7";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 700);

    }

});