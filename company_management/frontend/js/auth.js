// API Base URL (FastAPI server)
const API_BASE = (window.location.protocol === 'http:' || window.location.protocol === 'https:') && window.location.port === "8000"
  ? window.location.origin
  : "http://127.0.0.1:8000";

function getToken() {
  return localStorage.getItem("token");
}

function getUserRole() {
  return localStorage.getItem("user_role");
}

function getUserName() {
  return localStorage.getItem("user_name");
}

function setSession(token, role, name) {
  localStorage.setItem("token", token);
  localStorage.setItem("user_role", role);
  localStorage.setItem("user_name", name);
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user_role");
  localStorage.removeItem("user_name");
}

function logout() {
  clearSession();
  window.location.href = "login.html";
}

// Authenticated fetch helper
async function authFetch(endpoint, options = {}) {
  const token = getToken();
  if (!token) {
    clearSession();
    window.location.href = "login.html";
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    clearSession();
    window.location.href = "login.html";
    return null;
  }

  return response;
}

// Protect pages based on required role
function requireAuth(allowedRole = null) {
  const token = getToken();
  const role = getUserRole();

  if (!token) {
    window.location.href = "login.html";
    return false;
  }

  if (allowedRole && role?.toLowerCase() !== allowedRole.toLowerCase()) {
    // Redirect to proper dashboard based on current role
    if (role?.toLowerCase() === "admin") {
      window.location.href = "admin-dashboard.html";
    } else {
      window.location.href = "employee-dashboard.html";
    }
    return false;
  }

  return true;
}
