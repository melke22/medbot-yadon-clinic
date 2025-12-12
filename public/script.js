// MedBot Frontend JavaScript

let currentPatientId = null;
let currentUser = null;
let sessionId = generateSessionId();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script.js loaded - initializing application...');
    
    // Check authentication first
    checkUserAuthentication();
    
    // Initialize simple navigation
    setupSimpleNavigation();
});

// Check if user is authenticated
async function checkUserAuthentication() {
    try {
        const response = await fetch('/api/user-auth/verify');
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            currentPatientId = data.patient.id;
            
            // Populate profile with user data
            populateProfileForm(data.patient);
            
            // Initialize the app for authenticated users
            initializeApp();
            updateUserInterface();
        } else {
            // Not authenticated, show homepage with limited features
            initializeApp();
            updateGuestInterface();
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        // Still show homepage for guests
        initializeApp();
        updateGuestInterface();
    }
}

// Initialize app after authentication
function initializeApp() {
    initializeTabs();
    setMinDate();
    setupLogout();
    
    // Handle URL hash for direct navigation (e.g., /#profile)
    handleUrlHash();
}

// Update UI for authenticated user
function updateUserInterface() {
    console.log('Updating UI for authenticated user:', currentUser);
    
    // Hide guest info and show user info
    const guestInfo = document.getElementById('guestInfo');
    const userInfo = document.getElementById('userInfo');
    
    if (guestInfo) {
        guestInfo.style.display = 'none';
        console.log('Guest info hidden');
    }
    
    if (userInfo && currentUser) {
        userInfo.style.display = 'flex';
        const welcomeSpan = userInfo.querySelector('.user-welcome');
        if (welcomeSpan) {
            welcomeSpan.textContent = `Welcome, ${currentUser.name || currentUser.email}!`;
            console.log('User welcome updated:', currentUser.name || currentUser.email);
        }
        console.log('User info shown');
    }
    
    // Show success notification
    showNotification(`Welcome back, ${currentUser.name || currentUser.email}!`, 'success');
    
    // If URL hash is profile, scroll to profile
    if (window.location.hash === '#profile') {
        setTimeout(() => {
            const profileElement = document.getElementById('profile');
            if (profileElement) {
                window.scrollTo({
                    top: profileElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update active button
                const navButtons = document.querySelectorAll('.nav-btn');
                navButtons.forEach(btn => btn.classList.remove('active'));
                const profileButton = document.querySelector('[data-section="profile"]');
                if (profileButton) {
                    profileButton.classList.add('active');
                }
                
                console.log('Scrolled to profile after login');
            }
        }, 500);
    }
}

// Update UI for guest users
function updateGuestInterface() {
    console.log('Updating UI for guest user');
    
    // Show guest info and hide user info
    const guestInfo = document.getElementById('guestInfo');
    const userInfo = document.getElementById('userInfo');
    
    if (guestInfo) {
        guestInfo.style.display = 'flex';
        console.log('Guest info shown');
    }
    if (userInfo) {
        userInfo.style.display = 'none';
        console.log('User info hidden');
    }
    
    // Disable features that require authentication
    disableAuthRequiredFeatures();
}

// Disable features that require authentication
function disableAuthRequiredFeatures() {
    // Show login prompt for appointments and profile
    const appointmentTab = document.querySelector('[data-section="appointments"]');
    const profileTab = document.querySelector('[data-section="profile"]');
    
    if (appointmentTab) {
        appointmentTab.addEventListener('click', (e) => {
            if (!currentUser) {
                e.preventDefault();
                showNotification('Please login to access appointments', 'warning');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            }
        });
    }
    
    if (profileTab) {
        profileTab.addEventListener('click', (e) => {
            if (!currentUser) {
                e.preventDefault();
                showNotification('Please login to access your profile', 'warning');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            }
        });
    }
}

// Setup logout functionality
function setupLogout() {
    // Logout is handled by the logout button in updateUserInterface
}

// Logout function
async function logout() {
    try {
        await fetch('/api/user-auth/logout', { method: 'POST' });
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/login.html';
    }
}

// Navigation functionality
function initializeNavigation() {
    console.log('Initializing navigation...');
    const navButtons = document.querySelectorAll('.nav-btn');
    
    console.log('Found nav buttons:', navButtons.length);

    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            console.log('Clicked:', targetSection);
            
            if (targetSection) {
                // Update active nav button
                navButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Handle home section - scroll to top
                if (targetSection === 'home') {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                    console.log('Scrolled to top for home');
                    return;
                }
                
                // For other sections, scroll to the specific section
                const targetElement = document.getElementById(targetSection);
                if (targetElement) {
                    console.log('Found target element:', targetElement);
                    console.log('Element position:', targetElement.offsetTop);
                    
                    // Try scrollIntoView first
                    try {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                            inline: 'nearest'
                        });
                        console.log('Scrolled to section using scrollIntoView:', targetSection);
                    } catch (error) {
                        // Fallback to manual scroll
                        console.log('scrollIntoView failed, using manual scroll');
                        window.scrollTo({
                            top: targetElement.offsetTop - 80, // Account for header height
                            behavior: 'smooth'
                        });
                    }
                } else {
                    console.error('Section not found:', targetSection);
                }
                
                // Load section-specific data
                if (targetSection === 'appointments' && currentUser) {
                    loadAppointments();
                }
            }
        });
    });
    
    console.log('Navigation initialized successfully');
}

// Tab functionality for appointments
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Chat functionality
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingIndicator = addTypingIndicator();
    
    try {
        const response = await fetch('/api/chatbot/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId,
                patientId: currentPatientId
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add bot response to chat
        addMessageToChat(data.response, 'bot');
        
        // Update suggestions if provided
        if (data.suggestions && data.suggestions.length > 0) {
            updateSuggestions(data.suggestions);
        }
        
    } catch (error) {
        console.error('Error sending message:', error);
        typingIndicator.remove();
        addMessageToChat('Sorry, I encountered an error. Please try again.', 'bot');
    }
}

function sendSuggestion(suggestion) {
    document.getElementById('messageInput').value = suggestion;
    sendMessage();
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const icon = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    messageDiv.innerHTML = `
        <div class="message-content">
            ${icon}
            <p>${message}</p>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.innerHTML = `
        <div class="message-content">
            <i class="fas fa-robot"></i>
            <div class="loading"></div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingDiv;
}

function updateSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = '';
    
    suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.className = 'suggestion-btn';
        button.textContent = suggestion;
        button.onclick = () => sendSuggestion(suggestion);
        suggestionsContainer.appendChild(button);
    });
}

function clearChat() {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="message bot-message">
            <div class="message-content">
                <i class="fas fa-robot"></i>
                <div>
                    <p>Hello! I'm Yadon MedBot, your AI healthcare assistant for Yadon Clinic.</p>
                    <p>I can help you with:</p>
                    <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                        <li>Scheduling appointments</li>
                        <li>Information about our medical services</li>
                        <li>General health questions</li>
                        <li>Clinic location and contact details</li>
                    </ul>
                    <p>How can I assist you today?</p>
                </div>
            </div>
        </div>
    `;
    
    // Reset suggestions
    const suggestionsContainer = document.getElementById('suggestions');
    suggestionsContainer.innerHTML = `
        <button class="suggestion-btn" onclick="sendSuggestion('Schedule an appointment')">Schedule Appointment</button>
        <button class="suggestion-btn" onclick="sendSuggestion('Tell me about Yadon Clinic services')">Our Services</button>
        <button class="suggestion-btn" onclick="sendSuggestion('I have symptoms to check')">Symptom Checker</button>
        <button class="suggestion-btn" onclick="sendSuggestion('Where is Yadon Clinic located?')">Location & Contact</button>
    `;
    
    // Generate new session ID
    sessionId = generateSessionId();
}

// Appointment functionality
function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
}

// Yadon Clinic departments and doctors
const departmentDoctors = {
    'General Medicine': ['Dr. Alemayehu Tadesse', 'Dr. Hanan Mohammed', 'Dr. Dawit Bekele'],
    'Men\'s Health': ['Dr. Tesfaye Girma', 'Dr. Mulugeta Assefa'],
    'STI Management': ['Dr. Meron Haile', 'Dr. Yohannes Kebede'],
    'Chronic Care': ['Dr. Selamawit Desta', 'Dr. Getachew Worku'],
    'Maternal Health': ['Dr. Tigist Abebe', 'Dr. Rahel Teshome'],
    'Minor Procedures': ['Dr. Berhanu Lemma', 'Dr. Kidist Wolde'],
    'Infectious Diseases': ['Dr. Fasil Negash', 'Dr. Almaz Tekle']
};

document.getElementById('department').addEventListener('change', function() {
    const department = this.value;
    const doctorSelect = document.getElementById('doctor');
    
    doctorSelect.innerHTML = '<option value="">Select Doctor</option>';
    
    if (department && departmentDoctors[department]) {
        departmentDoctors[department].forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor;
            option.textContent = doctor;
            doctorSelect.appendChild(option);
        });
    }
});

document.getElementById('doctor').addEventListener('change', function() {
    loadAvailableSlots();
});

document.getElementById('appointmentDate').addEventListener('change', function() {
    loadAvailableSlots();
});

async function loadAvailableSlots() {
    const doctor = document.getElementById('doctor').value;
    const date = document.getElementById('appointmentDate').value;
    const timeSlotSelect = document.getElementById('timeSlot');
    
    if (!doctor || !date) {
        timeSlotSelect.innerHTML = '<option value="">Select Time</option>';
        return;
    }
    
    // Show loading state
    timeSlotSelect.innerHTML = '<option value="">Loading available times...</option>';
    timeSlotSelect.disabled = true;
    
    try {
        const response = await fetch(`/api/appointments/available-slots/${date}/${encodeURIComponent(doctor)}`);
        
        if (response.ok) {
            const data = await response.json();
            
            timeSlotSelect.innerHTML = '<option value="">Select Time</option>';
            
            if (data.availableSlots && data.availableSlots.length > 0) {
                data.availableSlots.forEach(slot => {
                    const option = document.createElement('option');
                    option.value = slot;
                    option.textContent = slot;
                    timeSlotSelect.appendChild(option);
                });
            } else {
                timeSlotSelect.innerHTML = '<option value="">No available slots</option>';
            }
        } else {
            timeSlotSelect.innerHTML = '<option value="">Error loading slots</option>';
        }
        
    } catch (error) {
        console.error('Error loading available slots:', error);
        timeSlotSelect.innerHTML = '<option value="">Error loading slots</option>';
    } finally {
        timeSlotSelect.disabled = false;
    }
}

async function scheduleAppointment(event) {
    event.preventDefault();
    
    // Check if all required fields are filled
    const department = document.getElementById('department').value;
    const doctor = document.getElementById('doctor').value;
    const appointmentDate = document.getElementById('appointmentDate').value;
    const timeSlot = document.getElementById('timeSlot').value;
    const reason = document.getElementById('reason').value;
    
    if (!department || !doctor || !appointmentDate || !timeSlot || !reason) {
        showNotification('Please fill in all required fields.', 'warning');
        return;
    }
    
    // Check if user is authenticated and has patient ID
    if (!currentPatientId || !currentUser) {
        showNotification('Please login to schedule appointments.', 'warning');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
        return;
    }
    
    const formData = {
        patientId: currentPatientId,
        doctorName: doctor,
        department: department,
        appointmentDate: appointmentDate,
        timeSlot: timeSlot,
        reason: reason
    };
    
    try {
        const response = await fetch('/api/appointments/schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Appointment scheduled successfully!', 'success');
            event.target.reset();
            loadAppointments();
        } else {
            showNotification(data.message || 'Error scheduling appointment', 'error');
        }
        
    } catch (error) {
        console.error('Error scheduling appointment:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
    }
}

// Helper function to get patient data from profile form
function getPatientDataFromProfile() {
    return {
        name: document.getElementById('name').value || '',
        email: document.getElementById('email').value || '',
        phone: document.getElementById('phone').value || '',
        dateOfBirth: document.getElementById('dateOfBirth').value || '1990-01-01',
        gender: document.getElementById('gender').value || 'other',
        allergies: document.getElementById('allergies').value.split(',').map(a => a.trim()).filter(a => a),
        emergencyContact: {
            name: document.getElementById('emergencyName').value || '',
            phone: document.getElementById('emergencyPhone').value || '',
            relationship: document.getElementById('emergencyRelation').value || ''
        }
    };
}

async function loadAppointments() {
    if (!currentPatientId) return;
    
    try {
        const response = await fetch(`/api/appointments/patient/${currentPatientId}`);
        const appointments = await response.json();
        
        const appointmentsList = document.getElementById('appointmentsList');
        
        if (appointments.length === 0) {
            appointmentsList.innerHTML = '<p>No appointments scheduled.</p>';
            return;
        }
        
        appointmentsList.innerHTML = appointments.map(appointment => `
            <div class="appointment-item">
                <div class="appointment-info">
                    <h4>${appointment.doctorName} - ${appointment.department}</h4>
                    <p><i class="fas fa-calendar"></i> ${new Date(appointment.appointmentDate).toLocaleDateString()}</p>
                    <p><i class="fas fa-clock"></i> ${appointment.timeSlot}</p>
                    <p><i class="fas fa-notes-medical"></i> ${appointment.reason}</p>
                </div>
                <div class="appointment-status status-${appointment.status}">
                    ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

// Profile functionality
// Profile data is now loaded through authentication in checkUserAuthentication()

function populateProfileForm(data) {
    document.getElementById('name').value = data.name || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('dateOfBirth').value = data.dateOfBirth || '';
    document.getElementById('gender').value = data.gender || '';
    document.getElementById('allergies').value = data.allergies || '';
    document.getElementById('emergencyName').value = data.emergencyName || '';
    document.getElementById('emergencyPhone').value = data.emergencyPhone || '';
    document.getElementById('emergencyRelation').value = data.emergencyRelation || '';
}

async function updateProfile(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        gender: document.getElementById('gender').value,
        allergies: document.getElementById('allergies').value.split(',').map(a => a.trim()).filter(a => a),
        emergencyContact: {
            name: document.getElementById('emergencyName').value,
            phone: document.getElementById('emergencyPhone').value,
            relationship: document.getElementById('emergencyRelation').value
        }
    };
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone || !formData.dateOfBirth || !formData.gender) {
        showNotification('Please fill in all required fields (Name, Email, Phone, Date of Birth, Gender).', 'warning');
        return;
    }
    
    try {
        if (!currentPatientId || !currentUser) {
            showNotification('Please login to update your profile.', 'warning');
            return;
        }

        // Update existing patient
        const response = await fetch(`/api/patients/${currentPatientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showNotification('Profile updated successfully!', 'success');
        } else {
            const error = await response.json();
            showNotification('Error updating profile: ' + error.message, 'error');
        }
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Network error. Please check your connection and try again.', 'error');
    }
}

// Navigate to section function
function navigateToSection(sectionName) {
    console.log('Navigating to:', sectionName);
    
    // Check if authentication is required for this section
    if ((sectionName === 'appointments' || sectionName === 'profile') && !currentUser) {
        showNotification(`Please login to access ${sectionName}`, 'warning');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
        return;
    }
    
    // Update active nav button
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => btn.classList.remove('active'));
    const targetNavButton = document.querySelector(`[data-section="${sectionName}"]`);
    if (targetNavButton) {
        targetNavButton.classList.add('active');
    }
    
    // Handle home section - scroll to top
    if (sectionName === 'home') {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        console.log('Scrolled to top for home');
        return;
    }
    
    // For other sections, scroll to the specific section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        console.log('Found target element:', targetSection);
        console.log('Element position:', targetSection.offsetTop);
        
        // Try scrollIntoView first
        try {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
            console.log('Scrolled to section using scrollIntoView:', sectionName);
        } catch (error) {
            // Fallback to manual scroll
            console.log('scrollIntoView failed, using manual scroll');
            window.scrollTo({
                top: targetSection.offsetTop - 80, // Account for header height
                behavior: 'smooth'
            });
        }
    } else {
        console.error('Section not found:', sectionName);
    }
    
    // Load section-specific data
    if (sectionName === 'appointments' && currentUser) {
        loadAppointments();
    }
}
            });
        }, 100);
    }
    
    // Load section-specific data
    if (sectionName === 'appointments' && currentUser) {
        loadAppointments();
    }
}

// Simple navigation setup that works immediately
function setupSimpleNavigation() {
    console.log('Setting up simple navigation...');
    
    const navButtons = document.querySelectorAll('.nav-btn');
    console.log('Found navigation buttons:', navButtons.length);
    
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            console.log('Clicked navigation:', targetSection);
            
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Scroll to section
            if (targetSection === 'home') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                console.log('Scrolled to home');
            } else {
                const element = document.getElementById(targetSection);
                if (element) {
                    console.log('Found element:', element);
                    console.log('Element position:', element.offsetTop);
                    
                    // Use manual scroll for better control
                    window.scrollTo({
                        top: element.offsetTop - 80, // Account for header
                        behavior: 'smooth'
                    });
                    console.log('Scrolled to:', targetSection);
                } else {
                    console.error('Section not found:', targetSection);
                }
            }
        });
    });
    
    // Handle URL hash
    const hash = window.location.hash.substring(1);
    if (hash) {
        console.log('URL hash detected:', hash);
        setTimeout(() => {
            const element = document.getElementById(hash);
            if (element) {
                window.scrollTo({
                    top: element.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update active button
                const targetButton = document.querySelector(`[data-section="${hash}"]`);
                if (targetButton) {
                    navButtons.forEach(btn => btn.classList.remove('active'));
                    targetButton.classList.add('active');
                }
            }
        }, 1000);
    }
    
    console.log('Simple navigation setup complete');
}

// Handle URL hash for direct navigation
function handleUrlHash() {
    const hash = window.location.hash.substring(1); // Remove the # symbol
    if (hash) {
        console.log('URL hash detected:', hash);
        setTimeout(() => {
            navigateToSection(hash);
        }, 500); // Small delay to ensure page is fully loaded
    }
}

// Utility functions
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Show user-friendly notifications
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Validate form fields
function validateRequiredFields(formElement) {
    const requiredFields = formElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            field.style.borderColor = '#ddd';
        }
    });
    
    return isValid;
}