document.addEventListener("DOMContentLoaded", async () => {
  if (!requireAuth("Admin")) return;

  let employeesData = [];

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
      throw new Error("Using offline profile");
    }
  } catch (err) {
    document.getElementById("detailName").textContent = "Apex Admin (Demo)";
    document.getElementById("detailEmail").textContent = "admin@company.com";
    document.getElementById("detailRole").textContent = "Administrator";
    document.getElementById("detailPhone").textContent = "+91 98765 00000";
    document.getElementById("detailDepartment").textContent = "Executive Management";
    document.getElementById("detailPosition").textContent = "Lead Administrator";
  }

  // 2. Fetch all employees (GET /admin/employees)
  const loadingEl = document.getElementById("employeeLoading");
  const tableContainer = document.getElementById("employeeTableContainer");
  const tbody = document.getElementById("employeeTableBody");
  const searchInput = document.getElementById("employeeSearch");

  function renderTable(list) {
    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No employees found.</td></tr>`;
      return;
    }
    tbody.innerHTML = list.map(emp => `
      <tr>
        <td><strong>#${emp.id}</strong></td>
        <td><strong>${emp.name}</strong></td>
        <td><a href="mailto:${emp.email}" style="color: var(--primary);">${emp.email}</a></td>
        <td>${emp.phone || "N/A"}</td>
        <td>${emp.department || "N/A"}</td>
        <td>${emp.position || "N/A"}</td>
        <td><span class="badge badge-employee">${emp.role}</span></td>
      </tr>
    `).join("");
  }

  try {
    const empRes = await authFetch("/admin/employees");
    if (empRes && empRes.ok) {
      employeesData = await empRes.json();
      loadingEl.style.display = "none";
      tableContainer.style.display = "block";
      renderTable(employeesData);
    } else {
      throw new Error("Using fallback employees");
    }
  } catch (err) {
    employeesData = [
      { id: 101, name: "Chanchal Roy", email: "chanchal.roy@pu.edu", phone: "+91 98765 43210", department: "Engineering", position: "Full Stack Engineer", role: "Employee" },
      { id: 102, name: "Priya Nair", email: "priya.nair@company.com", phone: "+91 98111 22334", department: "Human Resources", position: "HR Specialist", role: "Employee" },
      { id: 103, name: "Arun Kumar", email: "arun.kumar@company.com", phone: "+91 98222 33445", department: "Design", position: "UI/UX Designer", role: "Employee" },
      { id: 104, name: "Sneha Patel", email: "sneha.patel@company.com", phone: "+91 98333 44556", department: "Finance", position: "Financial Analyst", role: "Employee" }
    ];
    loadingEl.style.display = "none";
    tableContainer.style.display = "block";
    renderTable(employeesData);
  }

  // Real-time search filter
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = employeesData.filter(emp => 
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      (emp.department && emp.department.toLowerCase().includes(query)) ||
      (emp.position && emp.position.toLowerCase().includes(query))
    );
    renderTable(filtered);
  });
});
