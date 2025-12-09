// MedBot Admin Dashboard JavaScript

let currentData = {
    patients: [],
    appointments: [],
    chats: [],
    analytics: {}
};

let currentAdmin = null;

// Initialize the admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
});

// Check if user is authenticated
async function checkAuthentication() {
    try {
        const response = await fetch('/api/auth/verify');
        if (response.ok) {
            const data = await response.json();
            currentAdmin = data.admin;
            initializeAdminDashboard();
        } else {
            // Redirect to login
            window.location.href = '/admin-login.html';
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/admin-login.html';
    }
}

// Initialize dashboard after authentication
function initializeAdminDashboard() {
    initializeNavigation();
    loadDashboardData();
    setDefaultDates();
    setupLogout();
    updateAdminInfo();
}

// Setup logout functionality
function setupLogout() {
    // Add logout button to header
    const adminUser = document.querySelector('.admin-user');
    adminUser.innerHTML = `
        <i class="fas fa-user-shield"></i>
        <span>${currentAdmin.username}</span>
        <button onclick="logout()" class="logout-btn" title="Logout">
            <i class="fas fa-sign-out-alt"></i>
        </button>
    `;
}

// Update admin info display
function updateAdminInfo() {
    const adminUser = document.querySelector('.admin-user span');
    if (adminUser && currentAdmin) {
        adminUser.textContent = currentAdmin.username;
    }
}

// Logout function
async function logout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/admin-login.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/admin-login.html';
    }
}

// Navigation functionality
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.admin-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-section');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update active section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
            
            // Load section-specific data
            loadSectionData(targetSection);
        });
    });
}

// Load section-specific data
function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'patients':
            loadPatients();
            break;
        case 'appointments':
            loadAppointments();
            break;
        case 'chats':
            loadChatLogs();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'database':
            loadDatabaseStats();
            break;
    }
}

// Dashboard functions
async function loadDashboardData() {
    try {
        showLoading();
        
        // Load all data
        const [patients, appointments, chats] = await Promise.all([
            fetch('/api/admin/patients').then(r => r.json()),
            fetch('/api/admin/appointments').then(r => r.json()),
            fetch('/api/admin/chats').then(r => r.json())
        ]);

        currentData.patients = patients;
        currentData.appointments = appointments;
        currentData.chats = chats;

        // Update dashboard stats
        updateDashboardStats();
        updateDashboardCharts();
        updateRecentActivity();
        
        hideLoading();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
        hideLoading();
    }
}

function updateDashboardStats() {
    document.getElementById('totalPatients').textContent = currentData.patients.length;
    document.getElementById('totalAppointments').textContent = currentData.appointments.length;
    document.getElementById('totalChats').textContent = currentData.chats.length;
    
    // Calculate active today (appointments + chats today)
    const today = new Date().toDateString();
    const activeToday = currentData.appointments.filter(apt => 
        new Date(apt.appointmentDate).toDateString() === today
    ).length + currentData.chats.filter(chat => 
        new Date(chat.timestamp).toDateString() === today
    ).length;
    
    document.getElementById('activeToday').textContent = activeToday;
}

function updateDashboardCharts() {
    // Appointment status chart
    const appointmentStatusData = {};
    currentData.appointments.forEach(apt => {
        appointmentStatusData[apt.status] = (appointmentStatusData[apt.status] || 0) + 1;
    });

    const appointmentChart = new Chart(document.getElementById('appointmentChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(appointmentStatusData),
            datasets: [{
                data: Object.values(appointmentStatusData),
                backgroundColor: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Chat category chart
    const chatCategoryData = {};
    currentData.chats.forEach(chat => {
        chatCategoryData[chat.category] = (chatCategoryData[chat.category] || 0) + 1;
    });

    const chatChart = new Chart(document.getElementById('chatChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(chatCategoryData),
            datasets: [{
                label: 'Interactions',
                data: Object.values(chatCategoryData),
                backgroundColor: '#3498db'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function updateRecentActivity() {
    const recentActivity = document.getElementById('recentActivity');
    const activities = [];

    // Add recent appointments
    currentData.appointments.slice(-5).forEach(apt => {
        activities.push({
            type: 'appointment',
            message: `Appointment scheduled: ${apt.patientId?.name || 'Unknown'} with ${apt.doctorName}`,
            time: new Date(apt.createdAt).toLocaleString(),
            icon: 'appointment'
        });
    });

    // Add recent chats
    currentData.chats.slice(-5).forEach(chat => {
        activities.push({
            type: 'chat',
            message: `Chat interaction: ${chat.intent} (${Math.round(chat.confidence * 100)}% confidence)`,
            time: new Date(chat.timestamp).toLocaleString(),
            icon: 'chat'
        });
    });

    // Sort by time and take latest 10
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    activities.splice(10);

    recentActivity.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon ${activity.icon}">
                <i class="fas fa-${activity.icon === 'appointment' ? 'calendar' : 'comment'}"></i>
            </div>
            <div class="activity-content">
                <p>${activity.message}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        </div>
    `).join('');
}

// Patient management functions
async function loadPatients() {
    try {
        const response = await fetch('/api/admin/patients');
        const patients = await response.json();
        currentData.patients = patients;
        displayPatients(patients);
    } catch (error) {
        console.error('Error loading patients:', error);
        showNotification('Error loading patients', 'error');
    }
}

function displayPatients(patients) {
    const tbody = document.getElementById('patientsTableBody');
    tbody.innerHTML = patients.map(patient => {
        const age = calculateAge(patient.dateOfBirth);
        const appointmentCount = currentData.appointments.filter(apt => 
            apt.patientId === patient._id
        ).length;

        return `
            <tr>
                <td>${patient.name}</td>
                <td>${patient.email}</td>
                <td>${patient.phone}</td>
                <td>${age}</td>
                <td>${patient.gender}</td>
                <td>${appointmentCount}</td>
                <td>
                    <button onclick="viewPatient('${patient._id}')" class="btn-info btn-small">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button onclick="editPatient('${patient._id}')" class="btn-primary btn-small">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deletePatient('${patient._id}')" class="btn-danger btn-small">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function searchPatients() {
    const searchTerm = document.getElementById('patientSearch').value.toLowerCase();
    const filteredPatients = currentData.patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm) ||
        patient.email.toLowerCase().includes(searchTerm) ||
        patient.phone.includes(searchTerm)
    );
    displayPatients(filteredPatients);
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

// Appointment management functions
async function loadAppointments() {
    try {
        const response = await fetch('/api/admin/appointments');
        const appointments = await response.json();
        currentData.appointments = appointments;
        displayAppointments(appointments);
    } catch (error) {
        console.error('Error loading appointments:', error);
        showNotification('Error loading appointments', 'error');
    }
}

function displayAppointments(appointments) {
    const tbody = document.getElementById('appointmentsTableBody');
    tbody.innerHTML = appointments.map(appointment => `
        <tr>
            <td>${appointment.patientId?.name || 'Unknown'}</td>
            <td>${appointment.doctorName}</td>
            <td>${appointment.department}</td>
            <td>${new Date(appointment.appointmentDate).toLocaleDateString()}</td>
            <td>${appointment.timeSlot}</td>
            <td><span class="status-badge status-${appointment.status}">${appointment.status}</span></td>
            <td>
                <button onclick="updateAppointmentStatus('${appointment._id}', 'confirmed')" class="btn-success btn-small">
                    <i class="fas fa-check"></i> Confirm
                </button>
                <button onclick="updateAppointmentStatus('${appointment._id}', 'cancelled')" class="btn-danger btn-small">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </td>
        </tr>
    `).join('');
}

function filterAppointments() {
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    let filteredAppointments = currentData.appointments;
    
    if (statusFilter) {
        filteredAppointments = filteredAppointments.filter(apt => apt.status === statusFilter);
    }
    
    if (dateFilter) {
        filteredAppointments = filteredAppointments.filter(apt => 
            new Date(apt.appointmentDate).toDateString() === new Date(dateFilter).toDateString()
        );
    }
    
    displayAppointments(filteredAppointments);
}

async function updateAppointmentStatus(appointmentId, status) {
    try {
        const response = await fetch(`/api/admin/appointments/${appointmentId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            showNotification(`Appointment ${status} successfully`, 'success');
            loadAppointments();
        } else {
            throw new Error('Failed to update appointment');
        }
    } catch (error) {
        console.error('Error updating appointment:', error);
        showNotification('Error updating appointment', 'error');
    }
}

// Chat logs functions
async function loadChatLogs() {
    try {
        const response = await fetch('/api/admin/chats');
        const chats = await response.json();
        currentData.chats = chats;
        displayChatLogs(chats);
    } catch (error) {
        console.error('Error loading chat logs:', error);
        showNotification('Error loading chat logs', 'error');
    }
}

function displayChatLogs(chats) {
    const chatLogs = document.getElementById('chatLogs');
    
    // Group chats by session
    const sessionGroups = {};
    chats.forEach(chat => {
        if (!sessionGroups[chat.sessionId]) {
            sessionGroups[chat.sessionId] = [];
        }
        sessionGroups[chat.sessionId].push(chat);
    });
    
    chatLogs.innerHTML = Object.entries(sessionGroups).map(([sessionId, sessionChats]) => {
        const patient = sessionChats[0].patientId;
        return `
            <div class="chat-log-item">
                <div class="chat-log-header">
                    <div>
                        <strong>Session: ${sessionId}</strong>
                        <span> - ${patient?.name || 'Anonymous'}</span>
                    </div>
                    <span>${new Date(sessionChats[0].timestamp).toLocaleString()}</span>
                </div>
                <div class="chat-log-content">
                    ${sessionChats.map(chat => `
                        <div class="chat-message user">
                            <strong>User:</strong>
                            ${chat.userMessage}
                        </div>
                        <div class="chat-message bot">
                            <strong>MedBot (${chat.intent} - ${Math.round(chat.confidence * 100)}%):</strong>
                            ${chat.botResponse}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function filterChats() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const dateFilter = document.getElementById('chatDateFilter').value;
    
    let filteredChats = currentData.chats;
    
    if (categoryFilter) {
        filteredChats = filteredChats.filter(chat => chat.category === categoryFilter);
    }
    
    if (dateFilter) {
        filteredChats = filteredChats.filter(chat => 
            new Date(chat.timestamp).toDateString() === new Date(dateFilter).toDateString()
        );
    }
    
    displayChatLogs(filteredChats);
}

// Analytics functions
function setDefaultDates() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    document.getElementById('analyticsStartDate').value = startDate.toISOString().split('T')[0];
    document.getElementById('analyticsEndDate').value = endDate.toISOString().split('T')[0];
}

async function loadAnalytics() {
    const startDate = document.getElementById('analyticsStartDate').value;
    const endDate = document.getElementById('analyticsEndDate').value;
    
    try {
        const response = await fetch(`/api/analytics/dashboard?startDate=${startDate}&endDate=${endDate}`);
        const analytics = await response.json();
        currentData.analytics = analytics;
        displayAnalytics(analytics);
    } catch (error) {
        console.error('Error loading analytics:', error);
        showNotification('Error loading analytics', 'error');
    }
}

function displayAnalytics(analytics) {
    // Demographics chart
    if (analytics.patients && analytics.patients.ageGroups) {
        const demographicsChart = new Chart(document.getElementById('demographicsChart'), {
            type: 'pie',
            data: {
                labels: analytics.patients.ageGroups.map(group => group._id),
                datasets: [{
                    data: analytics.patients.ageGroups.map(group => group.count),
                    backgroundColor: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Departments chart
    if (analytics.appointments && analytics.appointments.departmentStats) {
        const departmentsChart = new Chart(document.getElementById('departmentsChart'), {
            type: 'bar',
            data: {
                labels: analytics.appointments.departmentStats.map(dept => dept._id),
                datasets: [{
                    label: 'Appointments',
                    data: analytics.appointments.departmentStats.map(dept => dept.total),
                    backgroundColor: '#2ecc71'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Database management functions
async function loadDatabaseStats() {
    try {
        const [patients, appointments, chats] = await Promise.all([
            fetch('/api/admin/patients').then(r => r.json()),
            fetch('/api/admin/appointments').then(r => r.json()),
            fetch('/api/admin/chats').then(r => r.json())
        ]);

        document.getElementById('patientsCount').textContent = patients.length;
        document.getElementById('appointmentsCount').textContent = appointments.length;
        document.getElementById('chatsCount').textContent = chats.length;
    } catch (error) {
        console.error('Error loading database stats:', error);
        showNotification('Error loading database stats', 'error');
    }
}

async function backupDatabase() {
    try {
        const response = await fetch('/api/admin/backup', { method: 'POST' });
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Database backup created successfully', 'success');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error backing up database:', error);
        showNotification('Error creating database backup', 'error');
    }
}

async function clearDatabase() {
    if (confirm('Are you sure you want to clear all database data? This action cannot be undone.')) {
        try {
            const response = await fetch('/api/admin/clear', { method: 'DELETE' });
            const result = await response.json();
            
            if (response.ok) {
                showNotification('Database cleared successfully', 'success');
                loadDashboardData();
                loadDatabaseStats();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error clearing database:', error);
            showNotification('Error clearing database', 'error');
        }
    }
}

async function exportData() {
    try {
        showNotification('Preparing data export...', 'info');
        
        const response = await fetch('/api/admin/export');
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `yadon-clinic-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showNotification('Data exported successfully', 'success');
        } else {
            const error = await response.json();
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Error exporting data:', error);
        showNotification('Error exporting data: ' + error.message, 'error');
    }
}

function showImportModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2><i class="fas fa-upload"></i> Import Data</h2>
            
            <form id="importForm" onsubmit="importData(event)">
                <div class="form-group">
                    <label for="importFile">Select JSON file to import:</label>
                    <input type="file" id="importFile" name="file" accept=".json" required>
                </div>
                
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="overwriteData" name="overwrite">
                        Overwrite existing data (WARNING: This will replace all current data)
                    </label>
                </div>
                
                <div class="modal-actions">
                    <button type="button" onclick="this.closest('.modal').remove()" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-warning">Import Data</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

async function importData(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const file = formData.get('file');
    const overwrite = formData.get('overwrite') === 'on';
    
    if (!file) {
        showNotification('Please select a file to import', 'warning');
        return;
    }
    
    try {
        const fileContent = await file.text();
        const data = JSON.parse(fileContent);
        
        if (overwrite && !confirm('This will overwrite ALL existing data. Are you absolutely sure?')) {
            return;
        }
        
        showNotification('Importing data...', 'info');
        
        const response = await fetch('/api/admin/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data, overwrite })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Data imported successfully', 'success');
            event.target.closest('.modal').remove();
            loadDashboardData();
            loadDatabaseStats();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error importing data:', error);
        showNotification('Error importing data: ' + error.message, 'error');
    }
}

async function optimizeDatabase() {
    if (confirm('This will optimize database indexes and clean up unused data. Continue?')) {
        try {
            showNotification('Optimizing database...', 'info');
            
            const response = await fetch('/api/admin/optimize', { method: 'POST' });
            const result = await response.json();
            
            if (response.ok) {
                showNotification('Database optimized successfully', 'success');
                loadDatabaseStats();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error optimizing database:', error);
            showNotification('Error optimizing database', 'error');
        }
    }
}

async function initializeSampleData() {
    try {
        const response = await fetch('/api/admin/init-sample', { method: 'POST' });
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Sample data initialized successfully', 'success');
            loadDashboardData();
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error initializing sample data:', error);
        showNotification('Error initializing sample data', 'error');
    }
}

// Modal functions
function showAddPatientModal() {
    document.getElementById('patientModal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function savePatient(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const patientData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dateOfBirth: formData.get('dateOfBirth'),
        gender: formData.get('gender'),
        allergies: formData.get('allergies').split(',').map(a => a.trim()).filter(a => a)
    };
    
    try {
        const response = await fetch('/api/patients/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        });
        
        if (response.ok) {
            showNotification('Patient added successfully', 'success');
            closeModal('patientModal');
            loadPatients();
            event.target.reset();
        } else {
            const error = await response.json();
            throw new Error(error.message);
        }
    } catch (error) {
        console.error('Error saving patient:', error);
        showNotification('Error saving patient: ' + error.message, 'error');
    }
}

// Utility functions
function showLoading() {
    // Add loading indicator if needed
}

function hideLoading() {
    // Remove loading indicator if needed
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Patient CRUD operations
async function viewPatient(patientId) {
    try {
        const response = await fetch(`/api/admin/patients/${patientId}`);
        const data = await response.json();
        
        if (response.ok) {
            showPatientDetailsModal(data);
        } else {
            showNotification('Error loading patient details: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error viewing patient:', error);
        showNotification('Error loading patient details', 'error');
    }
}

async function editPatient(patientId) {
    try {
        const response = await fetch(`/api/admin/patients/${patientId}`);
        const data = await response.json();
        
        if (response.ok) {
            showEditPatientModal(data.patient);
        } else {
            showNotification('Error loading patient data: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error loading patient for edit:', error);
        showNotification('Error loading patient data', 'error');
    }
}

async function deletePatient(patientId) {
    if (!confirm('Are you sure you want to delete this patient? This will also delete all related appointments and chat interactions. This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/patients/${patientId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Patient deleted successfully', 'success');
            loadPatients(); // Reload the patients list
        } else {
            showNotification('Error deleting patient: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting patient:', error);
        showNotification('Error deleting patient', 'error');
    }
}

// Show patient details modal
function showPatientDetailsModal(data) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    const patient = data.patient;
    const appointments = data.appointments || [];
    const chats = data.chatInteractions || [];
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2><i class="fas fa-user"></i> Patient Details</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div>
                    <h3>Personal Information</h3>
                    <p><strong>Name:</strong> ${patient.name}</p>
                    <p><strong>Email:</strong> ${patient.email}</p>
                    <p><strong>Phone:</strong> ${patient.phone}</p>
                    <p><strong>Date of Birth:</strong> ${new Date(patient.dateOfBirth).toLocaleDateString()}</p>
                    <p><strong>Gender:</strong> ${patient.gender}</p>
                    <p><strong>Age:</strong> ${calculateAge(patient.dateOfBirth)} years</p>
                </div>
                
                <div>
                    <h3>Medical Information</h3>
                    <p><strong>Allergies:</strong> ${patient.allergies.length ? patient.allergies.join(', ') : 'None'}</p>
                    <p><strong>Medical History:</strong> ${patient.medicalHistory.length} conditions</p>
                    <p><strong>Medications:</strong> ${patient.medications.length} active</p>
                    ${patient.emergencyContact ? `
                        <h4>Emergency Contact</h4>
                        <p><strong>Name:</strong> ${patient.emergencyContact.name}</p>
                        <p><strong>Phone:</strong> ${patient.emergencyContact.phone}</p>
                        <p><strong>Relationship:</strong> ${patient.emergencyContact.relationship}</p>
                    ` : ''}
                </div>
            </div>
            
            <div style="margin-bottom: 2rem;">
                <h3>Appointments (${appointments.length})</h3>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${appointments.map(apt => `
                        <div style="padding: 0.5rem; border-bottom: 1px solid #eee;">
                            <strong>${apt.doctorName}</strong> - ${apt.department}<br>
                            <small>${new Date(apt.appointmentDate).toLocaleDateString()} at ${apt.timeSlot} - ${apt.status}</small>
                        </div>
                    `).join('') || '<p>No appointments found</p>'}
                </div>
            </div>
            
            <div>
                <h3>Chat Interactions (${chats.length})</h3>
                <div style="max-height: 200px; overflow-y: auto;">
                    ${chats.slice(0, 5).map(chat => `
                        <div style="padding: 0.5rem; border-bottom: 1px solid #eee;">
                            <strong>Intent:</strong> ${chat.intent} (${Math.round(chat.confidence * 100)}%)<br>
                            <small>${new Date(chat.timestamp).toLocaleString()}</small>
                        </div>
                    `).join('') || '<p>No chat interactions found</p>'}
                </div>
            </div>
            
            <div class="modal-actions">
                <button onclick="editPatient('${patient._id}')" class="btn-primary">
                    <i class="fas fa-edit"></i> Edit Patient
                </button>
                <button onclick="this.closest('.modal').remove()" class="btn-secondary">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Show edit patient modal
function showEditPatientModal(patient) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            <h2><i class="fas fa-edit"></i> Edit Patient</h2>
            
            <form id="editPatientForm" onsubmit="updatePatient(event, '${patient._id}')">
                <div class="form-row">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" name="name" value="${patient.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value="${patient.email}" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Phone</label>
                        <input type="tel" name="phone" value="${patient.phone}" required>
                    </div>
                    <div class="form-group">
                        <label>Date of Birth</label>
                        <input type="date" name="dateOfBirth" value="${patient.dateOfBirth.split('T')[0]}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Gender</label>
                    <select name="gender" required>
                        <option value="male" ${patient.gender === 'male' ? 'selected' : ''}>Male</option>
                        <option value="female" ${patient.gender === 'female' ? 'selected' : ''}>Female</option>
                        <option value="other" ${patient.gender === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Allergies (comma separated)</label>
                    <textarea name="allergies" rows="2">${patient.allergies.join(', ')}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Emergency Contact Name</label>
                        <input type="text" name="emergencyName" value="${patient.emergencyContact?.name || ''}">
                    </div>
                    <div class="form-group">
                        <label>Emergency Contact Phone</label>
                        <input type="tel" name="emergencyPhone" value="${patient.emergencyContact?.phone || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Emergency Contact Relationship</label>
                    <input type="text" name="emergencyRelation" value="${patient.emergencyContact?.relationship || ''}">
                </div>
                <div class="modal-actions">
                    <button type="button" onclick="this.closest('.modal').remove()" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Update Patient</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Update patient
async function updatePatient(event, patientId) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const patientData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        dateOfBirth: formData.get('dateOfBirth'),
        gender: formData.get('gender'),
        allergies: formData.get('allergies').split(',').map(a => a.trim()).filter(a => a),
        emergencyContact: {
            name: formData.get('emergencyName'),
            phone: formData.get('emergencyPhone'),
            relationship: formData.get('emergencyRelation')
        }
    };
    
    try {
        const response = await fetch(`/api/admin/patients/${patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(patientData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Patient updated successfully', 'success');
            event.target.closest('.modal').remove();
            loadPatients(); // Reload the patients list
        } else {
            showNotification('Error updating patient: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error updating patient:', error);
        showNotification('Error updating patient', 'error');
    }
}

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}