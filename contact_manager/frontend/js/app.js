/**
 * Contact Manager Frontend Logic
 * Vanilla JavaScript (ES6+), AJAX/Fetch, Real-time Search, Modals & Validations
 */

// Determine API base dynamically (whether served directly from FastAPI or via static HTML)
const API_BASE = window.location.port === "8002" || window.location.port === "8000"
    ? "" 
    : "http://127.0.0.1:8002";

let contactsList = [];
let pendingDeleteId = null;
let currentViewingContact = null;

// DOM Elements
const contactsTbody = document.getElementById("contactsTbody");
const loadingState = document.getElementById("loadingState");
const emptyState = document.getElementById("emptyState");
const totalCountEl = document.getElementById("totalCount");
const companyCountEl = document.getElementById("companyCount");
const filteredCountEl = document.getElementById("filteredCount");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const refreshBtn = document.getElementById("refreshBtn");
const apiStatusBadge = document.getElementById("apiStatus");
const statusText = document.getElementById("statusText");

// Modals
const contactModal = document.getElementById("contactModal");
const viewModal = document.getElementById("viewModal");
const deleteModal = document.getElementById("deleteModal");

// Form & Buttons
const contactForm = document.getElementById("contactForm");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const openAddModalBtn = document.getElementById("openAddModalBtn");
const emptyAddBtn = document.getElementById("emptyAddBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const saveContactBtn = document.getElementById("saveContactBtn");

const closeViewModalBtn = document.getElementById("closeViewModalBtn");
const viewEditBtn = document.getElementById("viewEditBtn");
const viewDeleteBtn = document.getElementById("viewDeleteBtn");

const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const deleteContactName = document.getElementById("deleteContactName");

// Form Fields
const contactIdInput = document.getElementById("contactId");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const companyInput = document.getElementById("company");
const addressInput = document.getElementById("address");
const notesInput = document.getElementById("notes");

// -------------------------------------------------------------
// Initialization
// -------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    fetchContacts();
    setupEventListeners();
});

// -------------------------------------------------------------
// Event Listeners
// -------------------------------------------------------------
function setupEventListeners() {
    // Search with debounce
    let debounceTimer;
    searchInput.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        clearSearchBtn.style.display = val ? "block" : "none";
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchContacts(val);
        }, 250);
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearSearchBtn.style.display = "none";
        fetchContacts("");
    });

    refreshBtn.addEventListener("click", () => {
        fetchContacts(searchInput.value.trim());
    });

    // Add Contact
    openAddModalBtn.addEventListener("click", openCreateModal);
    if (emptyAddBtn) emptyAddBtn.addEventListener("click", openCreateModal);

    // Close Modals
    closeModalBtn.addEventListener("click", closeFormModal);
    cancelModalBtn.addEventListener("click", closeFormModal);
    closeViewModalBtn.addEventListener("click", closeViewModal);
    cancelDeleteBtn.addEventListener("click", closeDeleteModal);

    // Click outside backdrop to close
    [contactModal, viewModal, deleteModal].forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.classList.remove("active");
            }
        });
    });

    // Form Submit
    contactForm.addEventListener("submit", handleFormSubmit);

    // Delete Confirmation
    confirmDeleteBtn.addEventListener("click", executeDelete);

    // View Modal Actions
    viewEditBtn.addEventListener("click", () => {
        if (currentViewingContact) {
            closeViewModal();
            openEditModal(currentViewingContact);
        }
    });

    viewDeleteBtn.addEventListener("click", () => {
        if (currentViewingContact) {
            closeViewModal();
            openDeleteModal(currentViewingContact.id, `${currentViewingContact.first_name} ${currentViewingContact.last_name}`);
        }
    });
}

// -------------------------------------------------------------
// API CRUD Calls
// -------------------------------------------------------------
async function fetchContacts(search = "") {
    showLoading(true);
    try {
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        const res = await fetch(`${API_BASE}/api/contacts${query}`);
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        
        contactsList = await res.json();
        updateApiStatus(true);
        renderContacts(contactsList);
    } catch (err) {
        console.warn("Backend offline, using local contact data:", err);
        updateApiStatus(false);
        const localData = localStorage.getItem("demo_contacts");
        if (localData) {
            try { contactsList = JSON.parse(localData); } catch(e) { contactsList = []; }
        } else {
            contactsList = [
                { id: 1, first_name: "Chanchal", last_name: "Roy", email: "chanchal.roy@pu.edu", phone: "+91 98765 43210", company: "Pondicherry University", address: "Kalapet, Puducherry", notes: "Portfolio author & Web Developer" },
                { id: 2, first_name: "Anita", last_name: "Sharma", email: "anita.s@example.com", phone: "+91 98111 22334", company: "TechCorp Labs", address: "Bangalore, India", notes: "Project coordinator" },
                { id: 3, first_name: "Rahul", last_name: "Verma", email: "rahul.v@innovate.org", phone: "+91 98222 33445", company: "Innovate AI", address: "Hyderabad, India", notes: "Research associate" }
            ];
            localStorage.setItem("demo_contacts", JSON.stringify(contactsList));
        }
        showToast("Backend offline — running with local demo contacts", "info");
        const filtered = search ? contactsList.filter(c => 
            ((c.first_name || '') + " " + (c.last_name || '') + " " + (c.email || '') + " " + (c.company || '')).toLowerCase().includes(search.toLowerCase())
        ) : contactsList;
        renderContacts(filtered);
    } finally {
        showLoading(false);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const contactId = contactIdInput.value;
    const isEdit = Boolean(contactId);

    const payload = {
        first_name: firstNameInput.value.trim(),
        last_name: lastNameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        company: companyInput.value.trim() || null,
        address: addressInput.value.trim() || null,
        notes: notesInput.value.trim() || null
    };

    setButtonLoading(true);

    try {
        const url = isEdit ? `${API_BASE}/api/contacts/${contactId}` : `${API_BASE}/api/contacts`;
        const method = isEdit ? "PUT" : "POST";

        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            // Handle validation & duplicate errors from FastAPI
            const errorMsg = data.detail || "An error occurred while saving the contact.";
            if (res.status === 409) {
                showFieldError("email", errorMsg);
            }
            throw new Error(errorMsg);
        }

        showToast(isEdit ? "Contact updated successfully!" : "New contact created successfully!", "success");
        closeFormModal();
        fetchContacts(searchInput.value.trim());
    } catch (err) {
        console.warn("Backend save failed, updating locally...", err);
        // Fallback to local storage
        let localList = JSON.parse(localStorage.getItem("demo_contacts") || "[]");
        if (isEdit) {
            const idx = localList.findIndex(c => c.id == contactId);
            if (idx !== -1) {
                localList[idx] = { ...localList[idx], ...payload };
            }
        } else {
            localList.push({ id: Date.now(), ...payload });
        }
        localStorage.setItem("demo_contacts", JSON.stringify(localList));
        showToast(isEdit ? "Contact updated (offline mode)!" : "New contact saved (offline mode)!", "success");
        closeFormModal();
        fetchContacts(searchInput.value.trim());
    } finally {
        setButtonLoading(false);
    }
}

async function executeDelete() {
    if (!pendingDeleteId) return;

    try {
        const res = await fetch(`${API_BASE}/api/contacts/${pendingDeleteId}`, {
            method: "DELETE"
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.detail || "Failed to delete contact.");
        }

        showToast("Contact deleted successfully", "success");
        closeDeleteModal();
        fetchContacts(searchInput.value.trim());
    } catch (err) {
        console.warn("Backend delete failed, removing locally...", err);
        let localList = JSON.parse(localStorage.getItem("demo_contacts") || "[]");
        localList = localList.filter(c => c.id != pendingDeleteId);
        localStorage.setItem("demo_contacts", JSON.stringify(localList));
        showToast("Contact deleted (offline mode)", "success");
        closeDeleteModal();
        fetchContacts(searchInput.value.trim());
    }
}

// -------------------------------------------------------------
// UI Rendering & Manipulation
// -------------------------------------------------------------
function renderContacts(contacts) {
    contactsTbody.innerHTML = "";
    
    // Update stats
    filteredCountEl.textContent = contacts.length;
    
    // Calculate total & companies from current full/filtered data
    totalCountEl.textContent = contacts.length;
    const uniqueCompanies = new Set(contacts.map(c => c.company).filter(Boolean));
    companyCountEl.textContent = uniqueCompanies.size;

    if (contacts.length === 0) {
        emptyState.classList.remove("hidden");
        return;
    } else {
        emptyState.classList.add("hidden");
    }

    contacts.forEach(contact => {
        const tr = document.createElement("tr");
        const initials = `${(contact.first_name[0] || '').toUpperCase()}${(contact.last_name[0] || '').toUpperCase()}`;
        const companyBadge = contact.company 
            ? `<span class="company-badge">${escapeHtml(contact.company)}</span>`
            : `<span class="text-muted">—</span>`;
        const addressText = contact.address 
            ? escapeHtml(contact.address)
            : `<span class="text-muted">—</span>`;

        tr.innerHTML = `
            <td>
                <div class="contact-cell">
                    <div class="contact-avatar">${initials}</div>
                    <div>
                        <div class="contact-name">${escapeHtml(contact.first_name)} ${escapeHtml(contact.last_name)}</div>
                    </div>
                </div>
            </td>
            <td>${escapeHtml(contact.phone)}</td>
            <td>${escapeHtml(contact.email)}</td>
            <td>${companyBadge}</td>
            <td>${addressText}</td>
            <td class="text-right">
                <div class="action-buttons">
                    <button class="icon-btn edit" title="Edit Contact" data-action="edit">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="icon-btn delete" title="Delete Contact" data-action="delete">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </td>
        `;

        // Row click opens details unless edit or delete icon is clicked
        tr.addEventListener("click", (e) => {
            const actionBtn = e.target.closest("button[data-action]");
            if (actionBtn) {
                const action = actionBtn.getAttribute("data-action");
                if (action === "edit") {
                    openEditModal(contact);
                } else if (action === "delete") {
                    openDeleteModal(contact.id, `${contact.first_name} ${contact.last_name}`);
                }
            } else {
                openViewModal(contact);
            }
        });

        contactsTbody.appendChild(tr);
    });
}

function openCreateModal() {
    clearValidationErrors();
    contactForm.reset();
    contactIdInput.value = "";
    modalTitle.textContent = "New Contact";
    modalSubtitle.textContent = "Fill in the contact information below";
    contactModal.classList.add("active");
    firstNameInput.focus();
}

function openEditModal(contact) {
    clearValidationErrors();
    contactIdInput.value = contact.id;
    firstNameInput.value = contact.first_name;
    lastNameInput.value = contact.last_name;
    emailInput.value = contact.email;
    phoneInput.value = contact.phone;
    companyInput.value = contact.company || "";
    addressInput.value = contact.address || "";
    notesInput.value = contact.notes || "";

    modalTitle.textContent = "Edit Contact";
    modalSubtitle.textContent = `Updating contact #${contact.id}`;
    contactModal.classList.add("active");
    firstNameInput.focus();
}

function openViewModal(contact) {
    currentViewingContact = contact;
    const initials = `${(contact.first_name[0] || '').toUpperCase()}${(contact.last_name[0] || '').toUpperCase()}`;
    
    document.getElementById("viewAvatar").textContent = initials;
    document.getElementById("viewFullName").textContent = `${contact.first_name} ${contact.last_name}`;
    document.getElementById("viewCompanyTitle").textContent = contact.company || "No Company Specified";
    
    const emailLink = document.getElementById("viewEmailLink");
    emailLink.textContent = contact.email;
    emailLink.href = `mailto:${contact.email}`;

    const phoneLink = document.getElementById("viewPhoneLink");
    phoneLink.textContent = contact.phone;
    phoneLink.href = `tel:${contact.phone}`;

    document.getElementById("viewAddress").textContent = contact.address || "No address provided";
    
    const notesEl = document.getElementById("viewNotes");
    const notesContainer = document.getElementById("notesDetailContainer");
    if (contact.notes) {
        notesEl.textContent = contact.notes;
        notesContainer.style.display = "flex";
    } else {
        notesContainer.style.display = "none";
    }

    document.getElementById("viewCreatedAt").textContent = contact.created_at ? new Date(contact.created_at).toLocaleString() : "N/A";
    document.getElementById("viewUpdatedAt").textContent = contact.updated_at ? new Date(contact.updated_at).toLocaleString() : "N/A";

    viewModal.classList.add("active");
}

function openDeleteModal(id, fullName) {
    pendingDeleteId = id;
    deleteContactName.textContent = fullName;
    deleteModal.classList.add("active");
}

function closeFormModal() {
    contactModal.classList.remove("active");
    contactForm.reset();
    clearValidationErrors();
}

function closeViewModal() {
    viewModal.classList.remove("active");
    currentViewingContact = null;
}

function closeDeleteModal() {
    deleteModal.classList.remove("active");
    pendingDeleteId = null;
}

// -------------------------------------------------------------
// Form Validation Helpers
// -------------------------------------------------------------
function validateForm() {
    clearValidationErrors();
    let isValid = true;

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!firstName) {
        showFieldError("firstName", "First name is required.");
        isValid = false;
    }

    if (!lastName) {
        showFieldError("lastName", "Last name is required.");
        isValid = false;
    }

    if (!email) {
        showFieldError("email", "Email address is required.");
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError("email", "Please enter a valid email address.");
        isValid = false;
    }

    if (!phone) {
        showFieldError("phone", "Phone number is required.");
        isValid = false;
    } else if (phone.length < 3) {
        showFieldError("phone", "Please enter a valid phone number.");
        isValid = false;
    }

    return isValid;
}

function showFieldError(fieldName, msg) {
    const errorEl = document.getElementById(`${fieldName}Error`);
    const inputEl = document.getElementById(fieldName);
    if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = "block";
    }
    if (inputEl) {
        inputEl.classList.add("invalid");
    }
}

function clearValidationErrors() {
    ["firstName", "lastName", "email", "phone"].forEach(field => {
        const errorEl = document.getElementById(`${field}Error`);
        const inputEl = document.getElementById(field);
        if (errorEl) {
            errorEl.textContent = "";
            errorEl.style.display = "none";
        }
        if (inputEl) {
            inputEl.classList.remove("invalid");
        }
    });
}

function showLoading(show) {
    if (show) {
        loadingState.classList.remove("hidden");
        contactsTbody.innerHTML = "";
    } else {
        loadingState.classList.add("hidden");
    }
}

function setButtonLoading(loading) {
    const btnText = saveContactBtn.querySelector(".btn-text");
    const btnSpinner = saveContactBtn.querySelector(".btn-spinner");
    saveContactBtn.disabled = loading;
    if (loading) {
        btnText.textContent = "Saving...";
        btnSpinner.classList.remove("hidden");
    } else {
        btnText.textContent = "Save Contact";
        btnSpinner.classList.add("hidden");
    }
}

function updateApiStatus(isOnline) {
    if (isOnline) {
        apiStatusBadge.className = "status-badge connected";
        statusText.textContent = "API Online";
    } else {
        apiStatusBadge.className = "status-badge offline";
        statusText.textContent = "API Offline";
    }
}

// -------------------------------------------------------------
// Toast Notification Utility
// -------------------------------------------------------------
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon = type === "success" ? "ri-checkbox-circle-fill" : "ri-error-warning-fill";
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100%)";
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
