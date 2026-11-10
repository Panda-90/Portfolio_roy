// =======================================================================
// EMPLOYEE MANAGEMENT - AJAX / JSON OPERATIONS WITHOUT PAGE REFRESH
// =======================================================================

const employeeTableBody = document.getElementById("employeeTableBody");
const searchInput = document.getElementById("searchInput");
const toastContainer = document.getElementById("toastContainer");

// Edit Modal Elements
const editModal = document.getElementById("editModal");
const editEmployeeForm = document.getElementById("editEmployeeForm");
const editEmployeeId = document.getElementById("editEmployeeId");
const editFullName = document.getElementById("editFullName");
const editEmail = document.getElementById("editEmail");
const editPhone = document.getElementById("editPhone");
const editDepartment = document.getElementById("editDepartment");
const editPosition = document.getElementById("editPosition");
const editJoiningDate = document.getElementById("editJoiningDate");
const saveEditBtn = document.getElementById("saveEditBtn");

// Delete Modal Elements
const deleteModal = document.getElementById("deleteModal");
const deleteEmployeeCard = document.getElementById("deleteEmployeeCard");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

let employees = [];
let targetDeleteId = null;

// =======================================================================
// REUSABLE AJAX UTILITY USING XMLHttpRequest & JSON
// =======================================================================
/**
 * Executes an asynchronous AJAX request without refreshing the browser page.
 * @param {string} url - API Endpoint
 * @param {string} method - HTTP Verb: GET, POST, PUT, DELETE
 * @param {object|null} data - JavaScript object to be serialized to JSON
 * @returns {Promise<{status: number, data: any}>}
 */
function ajaxRequest(url, method = "GET", data = null) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);

        // Set headers for standard JSON communication
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Accept", "application/json");

        xhr.onload = function () {
            let responseJson = null;
            try {
                if (xhr.responseText) {
                    responseJson = JSON.parse(xhr.responseText);
                }
            } catch (err) {
                console.warn("Could not parse JSON response:", xhr.responseText);
            }

            if (xhr.status >= 200 && xhr.status < 300) {
                resolve({ status: xhr.status, data: responseJson });
            } else {
                const message = (responseJson && responseJson.detail) || `Request failed with status ${xhr.status}`;
                reject({ status: xhr.status, message, data: responseJson });
            }
        };

        xhr.onerror = function () {
            reject({ status: 0, message: "Network error: Backend server is unreachable." });
        };

        // Send JSON serialized data if present
        if (data !== null) {
            xhr.send(JSON.stringify(data));
        } else {
            xhr.send();
        }
    });
}

// =======================================================================
// 1. READ: FETCH EMPLOYEES VIA AJAX (NO PAGE REFRESH)
// =======================================================================
async function loadEmployees() {
    try {
        let result;
        try {
            // Primary AJAX call to backend
            result = await ajaxRequest("http://127.0.0.1:8003/employees", "GET");
            employees = result.data || [];
        } catch (apiErr) {
            console.warn("Backend API unavailable, fetching fallback JSON...", apiErr);
            // Fallback AJAX call to static JSON file
            result = await ajaxRequest("../data/employees.json", "GET");
            employees = result.data || [];
        }

        displayEmployees(employees);

    } catch (error) {
        console.error("AJAX Error:", error);
        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: #ef4444; padding: 20px;">
                    <i class="fa-solid fa-triangle-exclamation"></i> Unable to load employees via AJAX.
                </td>
            </tr>
        `;
    }
}

// =======================================================================
// RENDER TABLE ROWS (DOM MANIPULATION WITHOUT PAGE RELOAD)
// =======================================================================
function displayEmployees(employeeList) {
    employeeTableBody.innerHTML = "";

    if (!employeeList || employeeList.length === 0) {
        employeeTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: #64748b; padding: 24px;">
                    No employees found.
                </td>
            </tr>
        `;
        return;
    }

    const avatarColors = ["blue-avatar", "green-avatar", "yellow-avatar", "red-avatar", "purple-avatar"];

    employeeList.forEach((employee, index) => {
        const row = createEmployeeRow(employee, index, avatarColors[index % avatarColors.length]);
        employeeTableBody.appendChild(row);
    });
}

function createEmployeeRow(employee, index, avatarColor = "blue-avatar") {
    const row = document.createElement("tr");
    row.id = `emp-row-${employee.employeeId}`;

    const firstLetter = (employee.fullName || "E").charAt(0).toUpperCase();

    row.innerHTML = `
        <td class="row-index">${index + 1}</td>
        <td>
            <div class="table-name">
                <div class="table-avatar ${avatarColor}">
                    ${firstLetter}
                </div>
                <strong class="emp-name">${escapeHtml(employee.fullName)}</strong>
            </div>
        </td>
        <td><code>${escapeHtml(employee.employeeId)}</code></td>
        <td><span class="dept-badge emp-dept">${escapeHtml(employee.department)}</span></td>
        <td class="emp-pos">${escapeHtml(employee.position)}</td>
        <td class="emp-date">${escapeHtml(employee.joiningDate)}</td>
        <td>
            <div class="action-buttons">
                <button type="button" class="edit-btn" onclick="openEditModal('${escapeAttr(employee.employeeId)}')" title="Edit via AJAX">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" class="delete-btn" onclick="openDeleteModal('${escapeAttr(employee.employeeId)}')" title="Delete via AJAX">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </td>
    `;

    return row;
}

// =======================================================================
// 2. UPDATE: AJAX PUT REQUEST WITH JSON (IN-PLACE DOM UPDATE)
// =======================================================================
function openEditModal(employeeId) {
    const employee = employees.find(e => String(e.employeeId) === String(employeeId));
    if (!employee) {
        showToast("Employee record not found.", "error");
        return;
    }

    editEmployeeId.value = employee.employeeId || "";
    editFullName.value = employee.fullName || "";
    editEmail.value = employee.email || "";
    editPhone.value = employee.phone || "";
    editDepartment.value = employee.department || "";
    editPosition.value = employee.position || "";
    editJoiningDate.value = employee.joiningDate || "";

    editModal.style.display = "flex";
    editFullName.focus();
}

function closeEditModal() {
    editModal.style.display = "none";
    editEmployeeForm.reset();
}

// Submitting the update form triggers an AJAX PUT request without page refresh
editEmployeeForm.addEventListener("submit", async function (e) {
    // Prevent normal page refresh
    e.preventDefault();

    const id = editEmployeeId.value;
    const updatePayload = {
        fullName: editFullName.value.trim(),
        email: editEmail.value.trim(),
        phone: editPhone.value.trim(),
        department: editDepartment.value,
        position: editPosition.value.trim(),
        joiningDate: editJoiningDate.value,
        employeeId: id
    };

    saveEditBtn.disabled = true;
    const originalBtnText = saveEditBtn.innerHTML;
    saveEditBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Updating via AJAX...`;

    try {
        // Send AJAX PUT Request with JSON payload
        const response = await ajaxRequest(
            `http://127.0.0.1:8003/employees/${encodeURIComponent(id)}`,
            "PUT",
            updatePayload
        );

        console.log("AJAX Update Success [200]:", response);

        // Update in-memory state
        const index = employees.findIndex(e => String(e.employeeId) === String(id));
        if (index !== -1) {
            employees[index] = { ...employees[index], ...updatePayload };
        }

        // Direct DOM update of the specific row without refreshing the page
        const targetRow = document.getElementById(`emp-row-${id}`);
        if (targetRow) {
            targetRow.querySelector(".emp-name").textContent = updatePayload.fullName;
            targetRow.querySelector(".emp-dept").textContent = updatePayload.department;
            targetRow.querySelector(".emp-pos").textContent = updatePayload.position;
            targetRow.querySelector(".emp-date").textContent = updatePayload.joiningDate;

            // Flash highlight animation to show visual proof of in-place AJAX update
            targetRow.classList.remove("ajax-row-updated");
            void targetRow.offsetWidth; // trigger reflow
            targetRow.classList.add("ajax-row-updated");
        }

        closeEditModal();
        showToast("Employee updated via AJAX (no page refresh)!", "success");

    } catch (error) {
        console.warn("AJAX Update failed, using fallback:", error);

        if (error.status === 0) {
            // Offline fallback: update DOM in-place anyway
            const index = employees.findIndex(e => String(e.employeeId) === String(id));
            if (index !== -1) {
                employees[index] = { ...employees[index], ...updatePayload };
                displayEmployees(employees);
                closeEditModal();
                showToast("Updated locally via AJAX fallback (server offline)", "info");
            }
        } else {
            showToast(error.message || "Failed to update employee.", "error");
        }
    } finally {
        saveEditBtn.disabled = false;
        saveEditBtn.innerHTML = originalBtnText;
    }
});

// =======================================================================
// 3. DELETE: AJAX DELETE REQUEST WITH JSON (IN-PLACE DOM REMOVAL)
// =======================================================================
function openDeleteModal(employeeId) {
    const employee = employees.find(e => String(e.employeeId) === String(employeeId));
    if (!employee) {
        showToast("Employee record not found.", "error");
        return;
    }

    targetDeleteId = employeeId;
    deleteEmployeeCard.innerHTML = `
        <h4>${escapeHtml(employee.fullName)}</h4>
        <p><strong>Employee ID:</strong> <code>${escapeHtml(employee.employeeId)}</code></p>
        <p><strong>Department:</strong> ${escapeHtml(employee.department)} &bull; <strong>Position:</strong> ${escapeHtml(employee.position)}</p>
        <p><strong>Email:</strong> ${escapeHtml(employee.email)}</p>
    `;

    deleteModal.style.display = "flex";
}

function closeDeleteModal() {
    deleteModal.style.display = "none";
    targetDeleteId = null;
}

// Confirming delete sends an AJAX DELETE request and removes the row from the DOM
confirmDeleteBtn.addEventListener("click", async function () {
    if (!targetDeleteId) return;

    confirmDeleteBtn.disabled = true;
    const originalBtnText = confirmDeleteBtn.innerHTML;
    confirmDeleteBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Deleting via AJAX...`;

    const idToDelete = targetDeleteId;

    try {
        // Send AJAX DELETE request
        const response = await ajaxRequest(
            `http://127.0.0.1:8003/employees/${encodeURIComponent(idToDelete)}`,
            "DELETE"
        );

        console.log("AJAX Delete Success [200]:", response);

        // Remove from in-memory state
        employees = employees.filter(e => String(e.employeeId) !== String(idToDelete));

        // Animate and remove the specific row from the DOM without page refresh
        const targetRow = document.getElementById(`emp-row-${idToDelete}`);
        if (targetRow) {
            targetRow.classList.add("ajax-row-deleting");
            setTimeout(() => {
                targetRow.remove();
                // Re-number remaining row indexes
                document.querySelectorAll("#employeeTableBody tr").forEach((tr, i) => {
                    const idxCell = tr.querySelector(".row-index");
                    if (idxCell) idxCell.textContent = i + 1;
                });

                if (employees.length === 0) {
                    displayEmployees([]);
                }
            }, 350);
        }

        closeDeleteModal();
        showToast("Employee deleted via AJAX (no page refresh)!", "success");

    } catch (error) {
        console.warn("AJAX Delete failed:", error);

        if (error.status === 0) {
            // Offline fallback
            employees = employees.filter(e => String(e.employeeId) !== String(idToDelete));
            const targetRow = document.getElementById(`emp-row-${idToDelete}`);
            if (targetRow) targetRow.remove();
            closeDeleteModal();
            showToast("Deleted locally via AJAX fallback (server offline)", "info");
        } else {
            showToast(error.message || "Failed to delete employee.", "error");
        }
    } finally {
        confirmDeleteBtn.disabled = false;
        confirmDeleteBtn.innerHTML = originalBtnText;
    }
});

// =======================================================================
// INSTANT CLIENT SEARCH FILTER (NO PAGE REFRESH)
// =======================================================================
searchInput.addEventListener("input", function () {
    const searchText = searchInput.value.toLowerCase().trim();

    const filteredEmployees = employees.filter(employee => {
        return (
            (employee.fullName && employee.fullName.toLowerCase().includes(searchText)) ||
            (employee.employeeId && employee.employeeId.toLowerCase().includes(searchText)) ||
            (employee.department && employee.department.toLowerCase().includes(searchText)) ||
            (employee.position && employee.position.toLowerCase().includes(searchText))
        );
    });

    displayEmployees(filteredEmployees);
});

// =======================================================================
// TOAST NOTIFICATIONS (SEAMLESS IN-PAGE USER FEEDBACK)
// =======================================================================
function showToast(message, type = "success") {
    if (!toastContainer) return;

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
    }, 3500);
}

// Modal dismiss helpers (Escape key & backdrop click)
window.addEventListener("click", function (event) {
    if (event.target === editModal) closeEditModal();
    if (event.target === deleteModal) closeDeleteModal();
});

window.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        if (editModal.style.display === "flex") closeEditModal();
        if (deleteModal.style.display === "flex") closeDeleteModal();
    }
});

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
    if (!str) return "";
    return String(str).replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

// Load data when page opens
loadEmployees();