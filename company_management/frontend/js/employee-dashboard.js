document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth("Employee")) return;

  const storedName = getUserName();
  if (storedName) {
    document.getElementById("navUserName").textContent = storedName;
    document.getElementById("profileName").textContent = storedName;
  }

  // 1. Fetch own details (GET /users/me)
  try {
    const res = await authFetch("/users/me");
    if (res && res.ok) {
      const me = await res.json();
      document.getElementById("profileName").textContent = me.name;
      document.getElementById("detailName").textContent = me.name;
      document.getElementById("detailEmail").textContent = me.email;
      document.getElementById("detailRole").textContent = me.role;
      document.getElementById("detailPhone").textContent = me.phone || "Not specified";
      document.getElementById("detailDepartment").textContent = me.department || "Not assigned";
      document.getElementById("detailPosition").textContent = me.position || "Not specified";
    } else {
      throw new Error("Offline user");
    }
  } catch (err) {
    document.getElementById("detailName").textContent = "Chanchal Roy";
    document.getElementById("detailEmail").textContent = "chanchal.roy@pu.edu";
    document.getElementById("detailRole").textContent = "Employee";
    document.getElementById("detailPhone").textContent = "+91 98765 43210";
    document.getElementById("detailDepartment").textContent = "Engineering";
    document.getElementById("detailPosition").textContent = "Software Engineer";
  }

  // 2. Fetch Admin details (GET /employee/admins)
  const loadingEl = document.getElementById("adminLoading");
  const tableContainer = document.getElementById("adminTableContainer");
  const tbody = document.getElementById("adminTableBody");

  try {
    const adminRes = await authFetch("/employee/admins");
    if (adminRes && adminRes.ok) {
      const admins = await adminRes.json();
      loadingEl.style.display = "none";
      tableContainer.style.display = "block";

      if (admins.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No administrators found.</td></tr>`;
      } else {
        tbody.innerHTML = admins.map((admin, idx) => `
          <tr>
            <td><strong>${idx + 1}</strong></td>
            <td><strong>${admin.name}</strong></td>
            <td><a href="mailto:${admin.email}" style="color: var(--primary);">${admin.email}</a></td>
            <td>${admin.phone || "N/A"}</td>
            <td>${admin.department || "N/A"}</td>
            <td>${admin.position || "N/A"}</td>
            <td><span class="badge badge-admin">${admin.role}</span></td>
          </tr>
        `).join("");
      }
    } else {
      throw new Error("Offline admin fetch");
    }
  } catch (err) {
    loadingEl.style.display = "none";
    tableContainer.style.display = "block";
    const demoAdmins = [
      { name: "Executive Admin", email: "admin@company.com", phone: "+91 98765 00000", department: "Executive Management", position: "Director", role: "Admin" }
    ];
    tbody.innerHTML = demoAdmins.map((admin, idx) => `
      <tr>
        <td><strong>${idx + 1}</strong></td>
        <td><strong>${admin.name}</strong></td>
        <td><a href="mailto:${admin.email}" style="color: var(--primary);">${admin.email}</a></td>
        <td>${admin.phone || "N/A"}</td>
        <td>${admin.department || "N/A"}</td>
        <td>${admin.position || "N/A"}</td>
        <td><span class="badge badge-admin">${admin.role}</span></td>
      </tr>
    `).join("");
  }
});
