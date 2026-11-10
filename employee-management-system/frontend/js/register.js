// =======================================================================
// EMPLOYEE REGISTRATION VIA AJAX & JSON (NO PAGE REFRESH)
// =======================================================================

const employeeForm = document.getElementById("employeeForm");
const toastContainer = document.getElementById("toastContainer");

employeeForm.addEventListener("submit", function (event) {
    // 1. Prevent standard browser form submission to eliminate page refresh
    event.preventDefault();

    const submitBtn = employeeForm.querySelector("button[type='submit']");
    const originalBtnHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Registering...`;

    // 2. Gather form data into a structured JavaScript object
    const employeeData = {
        employeeId: document.getElementById("employeeId").value.trim(),
        fullName: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        department: document.getElementById("department").value,
        position: document.getElementById("position").value.trim(),
        joiningDate: document.getElementById("joiningDate").value
    };

    // 3. Create AJAX Request using XMLHttpRequest (Classic Asynchronous JavaScript and XML)
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:8003/employees", true);

    // 4. Set headers for JSON transmission
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Accept", "application/json");

    // 5. Handle the asynchronous server response
    xhr.onload = function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;

        let responseData = null;
        try {
            responseData = JSON.parse(xhr.responseText);
        } catch (e) {
            console.error("Failed to parse JSON response:", xhr.responseText);
        }

        if (xhr.status >= 200 && xhr.status < 300) {
            // SUCCESS: Process JSON response & clear form without page reload
            showToast("Employee registered successfully via AJAX!", "success");
            employeeForm.reset();
            console.log("AJAX Success [200]:", responseData);
        } else {
            // ERROR: Display error message returned by server
            const errorMsg = (responseData && responseData.detail) || "Failed to register employee.";
            showToast(errorMsg, "error");
            console.warn(`AJAX Error [${xhr.status}]:`, responseData);
        }
    };

    // 6. Handle network errors
    xhr.onerror = function () {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;
        showToast("Could not connect to backend server (http://127.0.0.1:8003).", "error");
        console.error("AJAX network error occurred.");
    };

    // 7. Send the JSON-serialized payload asynchronously
    xhr.send(JSON.stringify(employeeData));
});

// Toast notification helper for seamless in-page feedback without reloading
function showToast(message, type = "success") {
    if (!toastContainer) {
        alert(message);
        return;
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let icon = "fa-circle-check";
    if (type === "error") icon = "fa-circle-xmark";
    if (type === "info") icon = "fa-circle-info";

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(110%)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}