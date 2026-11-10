document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const currentDateEl = document.getElementById('currentDate');
    const totalEmployeesEl = document.getElementById('totalEmployees');
    const activeEmployeesEl = document.getElementById('activeEmployees');
    const newEmployeesEl = document.getElementById('newEmployees');
    const inactiveEmployeesEl = document.getElementById('inactiveEmployees');
    const donutTotalEl = document.getElementById('donutTotal');
    const departmentListEl = document.getElementById('departmentList');
    const recentListEl = document.getElementById('recentList');

    // Set Current Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    if (currentDateEl) {
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // Fetch Employees
    async function fetchDashboardData() {
        try {
            let employees;
            try {
                const response = await fetch("http://127.0.0.1:8003/employees");
                if (!response.ok) throw new Error("Failed to fetch employees");
                employees = await response.json();
            } catch (err) {
                console.warn("Backend offline, falling back to static data.");
                const staticResponse = await fetch("data/employees.json");
                employees = await staticResponse.json();
            }
            
            updateDashboard(employees);
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        }
    }

    function updateDashboard(employees) {
        // 1. Stats
        const total = employees.length;
        // Assuming all employees are active since there's no status field in JSON
        const active = total; 
        const inactive = 0;
        
        // Calculate New This Month (employees joined in the current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        let newThisMonth = 0;

        employees.forEach(emp => {
            if (emp.joiningDate) {
                const joinDate = new Date(emp.joiningDate);
                if (joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear) {
                    newThisMonth++;
                }
            }
        });

        if (totalEmployeesEl) totalEmployeesEl.textContent = total;
        if (activeEmployeesEl) activeEmployeesEl.textContent = active;
        if (newEmployeesEl) newEmployeesEl.textContent = newThisMonth;
        if (inactiveEmployeesEl) inactiveEmployeesEl.textContent = inactive;

        // 2. Department Breakdown
        if (donutTotalEl) donutTotalEl.textContent = total;
        
        const deptCounts = {};
        employees.forEach(emp => {
            const dept = emp.department || 'Other';
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });

        const colors = ['blue-dot', 'green-dot', 'yellow-dot', 'purple-dot', 'red-dot'];
        let colorIndex = 0;
        
        if (departmentListEl) {
            departmentListEl.innerHTML = '';
            for (const [dept, count] of Object.entries(deptCounts)) {
                const dotClass = colors[colorIndex % colors.length];
                colorIndex++;
                
                departmentListEl.innerHTML += `
                    <div>
                        <span class="dot ${dotClass}"></span>
                        <span>${dept}</span>
                        <strong>${count}</strong>
                    </div>
                `;
            }
        }

        // 3. Recent Registrations (Last 3)
        // Sort employees by joiningDate descending
        const sortedEmployees = [...employees].sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate));
        const recentEmployees = sortedEmployees.slice(0, 3);
        
        const avatarColors = ['blue-avatar', 'red-avatar', 'green-avatar', 'purple-avatar', 'yellow-avatar'];
        
        if (recentListEl) {
            recentListEl.innerHTML = '';
            recentEmployees.forEach((emp, index) => {
                const firstLetter = emp.fullName ? emp.fullName.charAt(0).toUpperCase() : '?';
                const avatarClass = avatarColors[index % avatarColors.length];
                
                // Format joining date (e.g., 12 Jan 2024)
                const joinDateFormatted = emp.joiningDate 
                    ? new Date(emp.joiningDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'Unknown';

                recentListEl.innerHTML += `
                    <div class="recent-item">
                        <div class="employee-avatar ${avatarClass}">${firstLetter}</div>
                        <strong>${emp.fullName}</strong>
                        <span>${emp.department}</span>
                        <small>${joinDateFormatted}</small>
                    </div>
                `;
            });
        }
    }

    fetchDashboardData();

    // Admin Dropdown Toggle
    const adminMenuBtn = document.getElementById('adminMenuBtn');
    const adminDropdown = document.getElementById('adminDropdown');

    if (adminMenuBtn && adminDropdown) {
        adminMenuBtn.addEventListener('click', (e) => {
            adminDropdown.classList.toggle('show');
            e.stopPropagation();
        });

        document.addEventListener('click', (e) => {
            if (!adminMenuBtn.contains(e.target)) {
                adminDropdown.classList.remove('show');
            }
        });
    }
});
