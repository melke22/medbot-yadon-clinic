// Simple Navigation Script - This will work!
console.log('Simple navigation script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up SIMPLE navigation...');
    
    // Get all nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    console.log('Found nav buttons:', navButtons.length);
    
    // Add click event to each button
    navButtons.forEach((button, index) => {
        console.log(`Setting up button ${index}:`, button.textContent, 'data-section:', button.getAttribute('data-section'));
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const sectionName = this.getAttribute('data-section');
            console.log('🔥 CLICKED:', sectionName);
            
            // Remove active from all buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            // Add active to clicked button
            this.classList.add('active');
            
            // Scroll to section
            if (sectionName === 'home') {
                console.log('Scrolling to HOME (top)');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const targetElement = document.getElementById(sectionName);
                console.log('Looking for element:', sectionName, 'Found:', !!targetElement);
                
                if (targetElement) {
                    console.log('🚀 SCROLLING TO:', sectionName);
                    console.log('Element position:', targetElement.offsetTop);
                    
                    // Simple scroll
                    targetElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start' 
                    });
                    
                    console.log('✅ Scroll command sent');
                } else {
                    console.error('❌ Element not found:', sectionName);
                    // List all available sections
                    const allSections = document.querySelectorAll('[id]');
                    console.log('Available sections:', Array.from(allSections).map(s => s.id));
                }
            }
        });
    });
    
    console.log('✅ Simple navigation setup COMPLETE');
});