// Unified Navigation Manager - Handles both upper nav and content panels
console.log('Unified Navigation Manager loaded');

class UnifiedNavManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.isReady = false;
        this.initAttempts = 0;
        this.maxInitAttempts = 5;
    }

    // Initialize with retry logic
    init() {
        console.log(`UnifiedNavManager init attempt ${this.initAttempts + 1}`);
        
        if (this.initAttempts >= this.maxInitAttempts) {
            console.error('Max init attempts reached');
            return;
        }
        
        this.initAttempts++;
        
        // Check if DOM elements exist
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        const pages = document.querySelectorAll('.page-content');
        
        if (navLinks.length === 0 || pages.length === 0) {
            console.log('Navigation elements not ready, retrying in 500ms...');
            setTimeout(() => this.init(), 500);
            return;
        }
        
        console.log(`Found ${navLinks.length} nav links and ${pages.length} pages`);
        
        // Clear any existing event listeners
        this.clearEventListeners();
        
        // Setup navigation
        this.setupNavigation();
        
        // Initialize dashboard
        this.showPage('dashboard');
        
        this.isReady = true;
        console.log('✅ UnifiedNavManager ready!');
        
        // Test all components
        this.testComponents();
    }
    
    clearEventListeners() {
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        navLinks.forEach(link => {
            // Clone node to remove all event listeners
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
        });
    }
    
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        
        navLinks.forEach((link, index) => {
            const page = link.dataset.page;
            console.log(`Setting up nav link ${index}: ${page}`);
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`🔄 Navigation clicked: ${page}`);
                this.showPage(page);
            });
        });
    }
    
    showPage(pageName) {
        console.log(`📄 Showing page: ${pageName}`);
        
        try {
            // 1. Hide all pages (lower panel)
            const pages = document.querySelectorAll('.page-content');
            pages.forEach(page => {
                page.classList.add('hidden');
                console.log(`  📄 Hiding: ${page.id}`);
            });

            // 2. Show target page (lower panel)
            const targetPage = document.getElementById(`${pageName}Page`);
            if (targetPage) {
                targetPage.classList.remove('hidden');
                console.log(`  ✅ Showing: ${targetPage.id}`);
            } else {
                console.error(`  ❌ Page not found: ${pageName}Page`);
                return false;
            }

            // 3. Update navigation active states (upper panel)
            this.updateNavigation(pageName);
            
            // 4. Initialize page-specific functionality
            this.initializePage(pageName);
            
            this.currentPage = pageName;
            console.log(`✅ Successfully switched to: ${pageName}`);
            
            return true;
            
        } catch (error) {
            console.error(`❌ Error showing page ${pageName}:`, error);
            return false;
        }
    }
    
    updateNavigation(activePage) {
        console.log(`🎨 Updating navigation for: ${activePage}`);
        
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        navLinks.forEach(link => {
            const isActive = link.dataset.page === activePage;
            
            if (isActive) {
                // Active state
                link.classList.remove('text-gray-600', 'dark:text-gray-400');
                link.classList.add('text-primary');
                console.log(`  ✅ Activated nav: ${link.dataset.page}`);
            } else {
                // Inactive state
                link.classList.remove('text-primary');
                link.classList.add('text-gray-600', 'dark:text-gray-400');
            }
        });
    }
    
    initializePage(pageName) {
        console.log(`🔧 Initializing page: ${pageName}`);
        
        // Page-specific initialization
        switch (pageName) {
            case 'dashboard':
                this.initDashboard();
                break;
            case 'reports':
                this.initReports();
                break;
            case 'analytics':
                this.initAnalytics();
                break;
            case 'ai-analysis':
                this.initAIAnalysis();
                break;
        }
    }
    
    initDashboard() {
        console.log('  📊 Initializing dashboard...');
        // Dashboard-specific initialization
        if (window.dashboard && typeof window.dashboard.init === 'function') {
            window.dashboard.init();
        }
    }
    
    initReports() {
        console.log('  📋 Initializing reports...');
        // Reports-specific initialization
        if (window.reportsManager && typeof window.reportsManager.init === 'function') {
            window.reportsManager.init();
        }
    }
    
    initAnalytics() {
        console.log('  📈 Initializing analytics...');
        // Analytics-specific initialization
    }
    
    initAIAnalysis() {
        console.log('  🤖 Initializing AI analysis...');
        // AI Analysis-specific initialization
    }
    
    testComponents() {
        console.log('🧪 Testing navigation components...');
        
        // Test upper panel (navigation)
        const navLinks = document.querySelectorAll('.nav-link[data-page]');
        console.log(`  Upper panel: ${navLinks.length} navigation links found`);
        
        // Test lower panel (content areas)
        const pages = document.querySelectorAll('.page-content');
        console.log(`  Lower panel: ${pages.length} content pages found`);
        
        // Test page visibility
        pages.forEach(page => {
            const isVisible = !page.classList.contains('hidden');
            console.log(`  📄 ${page.id}: ${isVisible ? 'VISIBLE' : 'hidden'}`);
        });
        
        console.log('🧪 Component test complete');
    }
    
    // Public methods for manual testing
    switchTo(page) {
        console.log(`🎯 Manual switch to: ${page}`);
        return this.showPage(page);
    }
    
    getCurrentPage() {
        return this.currentPage;
    }
    
    reset() {
        console.log('🔄 Resetting navigation manager...');
        this.currentPage = 'dashboard';
        this.isReady = false;
        this.initAttempts = 0;
        this.init();
    }
}

// Create global instance
window.unifiedNav = new UnifiedNavManager();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.unifiedNav.init(), 100);
    });
} else {
    setTimeout(() => window.unifiedNav.init(), 100);
}

// Keyboard shortcuts for testing
document.addEventListener('keydown', function(e) {
    if (!window.unifiedNav.isReady) return;
    
    if (e.ctrlKey && e.shiftKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                window.unifiedNav.switchTo('dashboard');
                break;
            case '2':
                e.preventDefault();
                window.unifiedNav.switchTo('reports');
                break;
            case '3':
                e.preventDefault();
                window.unifiedNav.switchTo('analytics');
                break;
            case '4':
                e.preventDefault();
                window.unifiedNav.switchTo('ai-analysis');
                break;
            case 'R':
                e.preventDefault();
                window.unifiedNav.reset();
                break;
        }
    }
});

console.log('🎮 Unified Navigation Manager ready!');
console.log('🎯 Use unifiedNav.switchTo("dashboard") to test');
console.log('⌨️  Use Ctrl+Shift+1/2/3/4 for quick switching');
console.log('🔄 Use Ctrl+Shift+R to reset navigation');