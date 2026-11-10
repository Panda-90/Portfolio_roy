// Check if user is logged in
const isLoggedIn = localStorage.getItem('isAdminLoggedIn');

// Get the current page path
const currentPath = window.location.pathname;

// Allow access to login page even if not logged in
const isLoginPage = currentPath.endsWith('login.html');

if (!isLoggedIn && !isLoginPage) {
    // If not logged in and trying to access a protected page
    
    // Redirect logic depending on folder depth
    if (currentPath.includes('/pages/')) {
        window.location.href = 'login.html';
    } else {
        window.location.href = 'pages/login.html';
    }
} else if (isLoggedIn && isLoginPage) {
    // If logged in and trying to access login page, redirect to dashboard
    window.location.href = '../index.html';
}

// Function to handle logout
function logout() {
    localStorage.removeItem('isAdminLoggedIn');
    
    if (currentPath.includes('/pages/')) {
        window.location.href = 'login.html';
    } else {
        window.location.href = 'pages/login.html';
    }
}
