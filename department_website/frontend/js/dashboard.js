const token = localStorage.getItem("access_token");
const cachedUser = localStorage.getItem("user");

const API_BASE = (window.location.protocol === 'http:' || window.location.protocol === 'https:') && window.location.port === "8001"
    ? ""
    : "http://127.0.0.1:8001";

function renderUserData(user) {
    if (!user) return;
    if (document.getElementById("userName")) document.getElementById("userName").textContent = user.full_name || "Student";
    if (document.getElementById("userFullName")) document.getElementById("userFullName").textContent = user.full_name || "Student";
    if (document.getElementById("userCourse")) document.getElementById("userCourse").textContent = user.course || "Computer Science";
    if (document.getElementById("userEmail")) document.getElementById("userEmail").textContent = user.email || "student@dept.edu";
    if (document.getElementById("userPhone")) document.getElementById("userPhone").textContent = user.phone || "+91 9876543210";
}

// Display cached user immediately if available
if (cachedUser) {
    try {
        renderUserData(JSON.parse(cachedUser));
    } catch (e) {}
} else if (!token) {
    // Demo user for offline demonstration
    renderUserData({
        full_name: "Chanchal Roy",
        course: "Computer Science",
        email: "chanchal@dept.edu",
        phone: "+91 9876543210"
    });
}

// Get authenticated user
async function loadUser() {
    if (!token) return;

    try {

        const response = await fetch(`${API_BASE}/me`, {

            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`
            }

        });

        if (!response.ok) {
            // Keep cached user if offline
            return;
        }

        const user = await response.json();
        renderUserData(user);

    } catch (error) {
        console.warn("Could not fetch user from backend, using cached profile.", error);
    }
}


loadUser();


// Logout
function logout() {

    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}

if (document.getElementById("logoutBtn")) {
    document.getElementById("logoutBtn").addEventListener("click", logout);
}

if (document.getElementById("logoutBtn2")) {
    document.getElementById("logoutBtn2").addEventListener("click", logout);
}