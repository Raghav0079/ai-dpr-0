// Debug script to test navigation
console.log('Debug navigation script loaded');

// Enhanced fallback navigation system
function debugNavigation() {
    console.log('Setting up enhanced debug navigation...');
    
    // Wait for DOM and other scripts to load
    setTimeout(() => {
        // Check if main app is working
        if (window.app && window.appInitialized) {
            console.log('Main app is working, debug nav on standby');
            return;
        }
        
        console.log('Main app not ready, activating debug navigation');
        setupDebugNav();
    }, 2000); // Give main app 2 seconds to initialize
    
    // Also setup immediately as backup
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(setupDebugNav, 1000);
        });
    } else {
        setTimeout(setupDebugNav, 1000);
    }
}

function setupDebugNav() {
    console.log('Setting up debug navigation handlers');
    
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    console.log('Found nav links:', navLinks.length);
    
    navLinks.forEach((link, index) => {
        console.log(`Nav link ${index}:`, link.dataset.page);
        
        // Remove existing event listeners and add new ones
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const page = this.dataset.page;
            console.log('Debug nav clicked:', page);
            
            debugShowPage(page);
        });
    });
}

function debugShowPage(pageName) {
    console.log('Debug showing page:', pageName);
    
    try {
        // Hide all pages
        const pages = document.querySelectorAll('.page-content');
        console.log('Found pages:', pages.length);
        
        pages.forEach(page => {
            page.classList.add('hidden');
            console.log('Hiding:', page.id);
        });

        // Show target page
        const targetPage = document.getElementById(`${pageName}Page`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            console.log('Showing:', targetPage.id);
            
            // Update nav active states
            updateDebugNav(pageName);
            
            // Show success message
            console.log('✅ Successfully switched to:', pageName);
            
        } else {
            console.error('❌ Page not found:', `${pageName}Page`);
        }
        
    } catch (error) {
        console.error('❌ Error in debugShowPage:', error);
    }
}

function updateDebugNav(activePage) {
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    navLinks.forEach(link => {
        if (link.dataset.page === activePage) {
            link.classList.remove('text-gray-600', 'dark:text-gray-400');
            link.classList.add('text-primary');
        } else {
            link.classList.remove('text-primary');
            link.classList.add('text-gray-600', 'dark:text-gray-400');
        }
    });
}

// Test function to manually switch pages
window.debugSwitchTo = function(page) {
    console.log('Manual switch to:', page);
    debugShowPage(page);
};

// Auto-run debug navigation
debugNavigation();

// Add keyboard shortcut for testing
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === '1') {
        e.preventDefault();
        debugShowPage('dashboard');
    }
    if (e.ctrlKey && e.key === '2') {
        e.preventDefault();
        debugShowPage('reports');
    }
    if (e.ctrlKey && e.key === '3') {
        e.preventDefault();
        debugShowPage('analytics');
    }
    if (e.ctrlKey && e.key === '4') {
        e.preventDefault();
        debugShowPage('ai-analysis');
    }
});

console.log('Debug navigation ready! Use Ctrl+1/2/3/4 to switch pages');
console.log('Or use debugSwitchTo("dashboard") in console');