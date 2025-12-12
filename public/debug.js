// Debug script for Yadon Clinic
console.log('🔍 Debug script loaded');

// Check if sections exist
setTimeout(() => {
    console.log('=== SECTION CHECK ===');
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        console.log(`Section: ${section.id}`, {
            display: window.getComputedStyle(section).display,
            hasActive: section.classList.contains('active')
        });
    });
    
    console.log('=== NAV BUTTONS CHECK ===');
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        console.log(`Button: ${btn.getAttribute('data-section')}`, {
            hasActive: btn.classList.contains('active'),
            hasListener: btn.onclick !== null
        });
    });
}, 1000);

// Add manual navigation function
window.debugNav = function(sectionName) {
    console.log('🔧 Manual navigation to:', sectionName);
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
    });
    
    const target = document.getElementById(sectionName);
    if (target) {
        target.style.display = 'block';
        target.classList.add('active');
        console.log('✅ Displayed:', sectionName);
        
        // Update nav buttons
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => btn.classList.remove('active'));
        const targetBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetBtn) {
            targetBtn.classList.add('active');
            console.log('✅ Nav button updated');
        }
    } else {
        console.error('❌ Not found:', sectionName);
    }
};

// Test all sections
window.testAllSections = function() {
    const sections = ['home', 'about', 'services', 'chat', 'appointments', 'profile'];
    let index = 0;
    
    const testNext = () => {
        if (index < sections.length) {
            console.log(`🧪 Testing section ${index + 1}/${sections.length}: ${sections[index]}`);
            debugNav(sections[index]);
            index++;
            setTimeout(testNext, 2000);
        } else {
            console.log('✅ All sections tested!');
            debugNav('home'); // Return to home
        }
    };
    
    testNext();
};

console.log('💡 Commands:');
console.log('- debugNav("home") - Navigate to specific section');
console.log('- testAllSections() - Test all sections automatically');
