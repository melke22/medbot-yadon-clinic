// Simple Login Handler
console.log('Login handler loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Checking for login success...');
    
    // Check URL parameters for login/register success
    const urlParams = new URLSearchParams(window.location.search);
    const loginSuccess = urlParams.get('login') === 'success';
    const registerSuccess = urlParams.get('register') === 'success';
    const hash = window.location.hash.substring(1); // Remove #
    
    if (loginSuccess || registerSuccess) {
        console.log('Login/Register success detected!');
        
        // Update UI immediately
        setTimeout(() => {
            updateLoginUI();
            
            // Scroll to profile if hash is profile
            if (hash === 'profile') {
                console.log('Scrolling to profile...');
                const profileElement = document.getElementById('profile');
                if (profileElement) {
                    profileElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    // Update active nav button
                    const navButtons = document.querySelectorAll('.nav-btn');
                    navButtons.forEach(btn => btn.classList.remove('active'));
                    const profileBtn = document.querySelector('[data-section="profile"]');
                    if (profileBtn) {
                        profileBtn.classList.add('active');
                    }
                    
                    console.log('✅ Scrolled to profile and updated nav');
                }
            }
        }, 500);
    }
});

function updateLoginUI() {
    console.log('Updating login UI...');
    
    // Try to get user info from API
    fetch('/api/user-auth/verify')
        .then(response => response.json())
        .then(data => {
            if (data.user) {
                console.log('User found:', data.user);
                
                // Hide guest info
                const guestInfo = document.getElementById('guestInfo');
                if (guestInfo) {
                    guestInfo.style.display = 'none';
                    console.log('Guest info hidden');
                }
                
                // Show user info
                const userInfo = document.getElementById('userInfo');
                if (userInfo) {
                    userInfo.style.display = 'flex';
                    const welcomeSpan = userInfo.querySelector('.user-welcome');
                    if (welcomeSpan) {
                        welcomeSpan.textContent = `Welcome, ${data.user.name || data.user.email}!`;
                        console.log('User welcome updated');
                    }
                }
                
                // Show success message
                showSimpleNotification(`Welcome back, ${data.user.name || data.user.email}!`);
                
                console.log('✅ UI updated for logged in user');
            }
        })
        .catch(error => {
            console.error('Error checking user auth:', error);
        });
}

function showSimpleNotification(message) {
    // Create simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}