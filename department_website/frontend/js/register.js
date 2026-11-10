const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");

const API_BASE = (window.location.protocol === 'http:' || window.location.protocol === 'https:') && window.location.port === "8001"
    ? ""
    : "http://127.0.0.1:8001";

registerForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const full_name = document.getElementById("full_name").value;
    const course = document.getElementById("course-select").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(`${API_BASE}/register`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                full_name: full_name,
                course: course,
                email: email,
                phone: phone,
                password: password
            })

        });

        const data = await response.json();

        if (response.ok) {

            message.textContent = data.message;
            message.style.color = "green";

            registerForm.reset();

        } else {

            message.textContent = data.detail || "Registration failed";
            message.style.color = "red";

        }

    } catch (error) {

        console.warn("Backend offline, storing demo registration...", error);
        localStorage.setItem("user", JSON.stringify({
            id: Date.now(),
            full_name: full_name,
            course: course,
            email: email,
            phone: phone
        }));
        localStorage.setItem("access_token", "demo-token-dept");
        message.textContent = "Registration recorded locally (Backend Offline)! Redirecting to login...";
        message.style.color = "green";

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);
    }

});