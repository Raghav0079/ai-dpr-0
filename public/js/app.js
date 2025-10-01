// Main application controller
class App {
    constructor() {
        this.currentPage = 'dashboard';
        this.isInitialized = false;
    }

    // Initialize the application
    async init() {
        try {
            UIComponents.showLoading('Initializing AI DPR System...');
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Initialize navigation
            this.setupNavigation();
            
            // Initialize current page
            await this.showPage('dashboard');
            
            // Hide loading overlay after everything is loaded
            setTimeout(() => {
                UIComponents.hideLoading();
                this.isInitialized = true;
                UIComponents.showNotification('AI DPR System ready!', 'success', 2000);
            }, 1500);
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
            UIComponents.hideLoading();
            UIComponents.showNotification('Failed to initialize application', 'error');
        }
    }

    // Setup global event listeners
    setupGlobalEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                UIComponents.toggleTheme();
                // Update charts theme if dashboard is active
                if (this.currentPage === 'dashboard' && window.dashboard) {
                    setTimeout(() => window.dashboard.updateChartsTheme(), 100);
                }
            });
        }

        // Notifications
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.toggleNotifications();
            });
        }

        // User profile
        const userProfile = document.getElementById('userProfile');
        if (userProfile) {
            userProfile.addEventListener('click', () => {
                this.showUserMenu();
            });
        }

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.performGlobalSearch(e.target.value);
                }
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.showPage(e.state.page, false);
            }
        });

        // Auto-save functionality
        this.setupAutoSave();

        // Connection status monitoring
        this.monitorConnectionStatus();
    }

    // Setup navigation
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                if (page) {
                    this.showPage(page);
                }
            });
        });
    }

    // Show specific page
    async showPage(pageName, pushState = true) {
        try {
            // Hide all pages
            const pages = document.querySelectorAll('.page-content');
            pages.forEach(page => page.classList.add('hidden'));

            // Show target page
            const targetPage = document.getElementById(`${pageName}Page`);
            if (targetPage) {
                targetPage.classList.remove('hidden');
            }

            // Update navigation
            this.updateNavigation(pageName);

            // Initialize page-specific functionality
            await this.initializePage(pageName);

            // Update browser history
            if (pushState) {
                history.pushState({ page: pageName }, '', `#${pageName}`);
            }

            this.currentPage = pageName;
        } catch (error) {
            console.error(`Failed to show page ${pageName}:`, error);
            UIComponents.showNotification(`Failed to load ${pageName} page`, 'error');
        }
    }

    // Update navigation active state
    updateNavigation(activePage) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.dataset.page === activePage) {
                link.classList.add('active');
                link.classList.remove('text-gray-600', 'dark:text-gray-400');
                link.classList.add('text-primary');
            } else {
                link.classList.remove('active', 'text-primary');
                link.classList.add('text-gray-600', 'dark:text-gray-400');
            }
        });
    }

    // Initialize page-specific functionality
    async initializePage(pageName) {
        switch (pageName) {
            case 'dashboard':
                if (window.dashboard && !window.dashboard.initialized) {
                    await window.dashboard.init();
                    window.dashboard.initialized = true;
                }
                break;
            
            case 'reports':
                if (window.reportsManager && !window.reportsManager.initialized) {
                    await window.reportsManager.init();
                    window.reportsManager.initialized = true;
                }
                break;
            
            case 'ai-analysis':
                this.initializeAIAnalysis();
                break;
            
            case 'analytics':
                this.initializeAdvancedAnalytics();
                break;
        }
    }

    // Initialize AI Analysis page
    initializeAIAnalysis() {
        const form = document.getElementById('aiAnalysisForm');
        if (form && !form.hasEventListener) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.performAIAnalysis();
            });
            form.hasEventListener = true;
        }
    }

    // Perform AI Analysis
    async performAIAnalysis() {
        const form = document.getElementById('aiAnalysisForm');
        if (!UIComponents.validateForm(form)) {
            UIComponents.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const formData = new FormData(form);
        const analysisData = {
            project_name: formData.get('project_name'),
            issue_type: formData.get('issue_type'),
            description: formData.get('description'),
            additional_context: formData.get('additional_context')
        };

        const analyzeBtn = document.getElementById('analyzeBtn');
        const analyzeText = document.getElementById('analyzeText');
        const analyzeSpinner = document.getElementById('analyzeSpinner');
        const resultsDiv = document.getElementById('aiResults');
        const resultsContent = document.getElementById('aiAnalysisContent');

        try {
            // Show loading state
            analyzeText.style.display = 'none';
            analyzeSpinner.classList.remove('hidden');
            analyzeBtn.disabled = true;

            // Call AI analysis API
            const response = await API.analyzeProject(analysisData);

            // Display results
            resultsContent.innerHTML = `
                <div class="space-y-4">
                    <div>
                        <h4 class="font-semibold text-blue-900 dark:text-blue-200 mb-2">Analysis Summary</h4>
                        <p class="text-blue-800 dark:text-blue-300">${response.analysis}</p>
                    </div>
                    
                    <div>
                        <h4 class="font-semibold text-blue-900 dark:text-blue-200 mb-2">Confidence Score</h4>
                        <div class="flex items-center gap-3">
                            <div class="flex-1 ai-confidence-bar">
                                <div class="ai-confidence-fill" style="width: ${(response.confidence_score * 100)}%"></div>
                            </div>
                            <span class="font-medium text-blue-900 dark:text-blue-200">${Math.round(response.confidence_score * 100)}%</span>
                        </div>
                    </div>

                    ${response.recommendations ? `
                        <div>
                            <h4 class="font-semibold text-blue-900 dark:text-blue-200 mb-2">Recommendations</h4>
                            <ul class="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-300">
                                ${response.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}

                    <div class="flex items-center justify-between text-sm text-blue-700 dark:text-blue-400">
                        <span>Processing time: ${Math.round(response.processing_time)}ms</span>
                        <span>Generated: ${UIComponents.formatDate(response.timestamp, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div class="flex gap-2 pt-4">
                        <button onclick="app.saveAIAnalysis(${JSON.stringify(response).replace(/"/g, '&quot;')})" class="btn btn-primary">Save Analysis</button>
                        <button onclick="app.exportAIAnalysis(${JSON.stringify(response).replace(/"/g, '&quot;')})" class="btn btn-outline">Export Results</button>
                    </div>
                </div>
            `;

            resultsDiv.classList.remove('hidden');
            UIComponents.showNotification('AI analysis completed successfully!', 'success');

        } catch (error) {
            console.error('AI analysis failed:', error);
            UIComponents.showNotification('AI analysis failed. Please try again.', 'error');
        } finally {
            // Reset button state
            analyzeText.style.display = 'inline';
            analyzeSpinner.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    }

    // Save AI analysis as report
    async saveAIAnalysis(analysisResult) {
        const form = document.getElementById('aiAnalysisForm');
        const formData = new FormData(form);
        
        const reportData = {
            project_name: formData.get('project_name'),
            issue_type: formData.get('issue_type'),
            description: formData.get('description'),
            severity: 'Medium', // Default severity for AI-generated reports
            ai_analysis: analysisResult.analysis,
            confidence_score: analysisResult.confidence_score
        };

        try {
            await API.createReport(reportData);
            UIComponents.showNotification('Analysis saved as report successfully!', 'success');
            
            // Clear form
            form.reset();
            document.getElementById('aiResults').classList.add('hidden');
        } catch (error) {
            console.error('Failed to save analysis:', error);
            UIComponents.showNotification('Failed to save analysis as report', 'error');
        }
    }

    // Export AI analysis
    exportAIAnalysis(analysisResult) {
        const form = document.getElementById('aiAnalysisForm');
        const formData = new FormData(form);
        
        const exportData = {
            project_name: formData.get('project_name'),
            issue_type: formData.get('issue_type'),
            description: formData.get('description'),
            additional_context: formData.get('additional_context'),
            analysis: analysisResult.analysis,
            confidence_score: analysisResult.confidence_score,
            recommendations: analysisResult.recommendations,
            processing_time: analysisResult.processing_time,
            timestamp: analysisResult.timestamp
        };

        UIComponents.exportAsJSON(exportData, `ai-analysis-${Date.now()}.json`);
        UIComponents.showNotification('AI analysis exported successfully!', 'success');
    }

    // Initialize advanced analytics (placeholder)
    initializeAdvancedAnalytics() {
        // This would contain more advanced analytics functionality
        console.log('Advanced analytics page initialized');
    }

    // Toggle notifications dropdown
    toggleNotifications() {
        // Create notifications dropdown if it doesn't exist
        let dropdown = document.getElementById('notificationsDropdown');
        
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = 'notificationsDropdown';
            dropdown.className = 'absolute top-16 right-4 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-black/10 dark:border-white/10 z-50 fade-in';
            dropdown.innerHTML = this.getNotificationsHTML();
            document.body.appendChild(dropdown);
        }

        dropdown.classList.toggle('hidden');

        // Hide notification dot
        const dot = document.getElementById('notificationDot');
        if (dot) {
            dot.style.display = 'none';
        }

        // Close when clicking outside
        const closeHandler = (e) => {
            if (!dropdown.contains(e.target) && !document.getElementById('notificationBtn').contains(e.target)) {
                dropdown.classList.add('hidden');
                document.removeEventListener('click', closeHandler);
            }
        };
        document.addEventListener('click', closeHandler);
    }

    // Get notifications HTML
    getNotificationsHTML() {
        const notifications = [
            {
                id: 1,
                type: 'high_risk',
                title: 'High Risk Alert',
                message: 'Project Alpha budget exceeded by 15%',
                time: new Date(Date.now() - 2 * 60000),
                read: false
            },
            {
                id: 2,
                type: 'schedule_warning',
                title: 'Schedule Warning',
                message: 'Project Epsilon milestones at risk',
                time: new Date(Date.now() - 15 * 60000),
                read: false
            },
            {
                id: 3,
                type: 'resolved',
                title: 'Issue Resolved',
                message: 'Project Gamma resource allocation fixed',
                time: new Date(Date.now() - 60 * 60000),
                read: true
            },
            {
                id: 4,
                type: 'ai_analysis',
                title: 'AI Analysis Complete',
                message: 'New insights available for Project Beta',
                time: new Date(Date.now() - 2 * 60 * 60000),
                read: true
            }
        ];

        return `
            <div class="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                <button onclick="app.markAllNotificationsRead()" class="text-sm text-primary hover:text-primary/80">
                    Mark all read
                </button>
            </div>
            <div class="max-h-96 overflow-y-auto custom-scrollbar">
                ${notifications.map(notification => `
                    <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-black/5 dark:border-white/5 ${notification.read ? 'opacity-75' : ''}" onclick="app.handleNotificationClick(${notification.id})">
                        <div class="flex items-start gap-3">
                            <div class="w-2 h-2 ${notification.read ? 'bg-gray-300' : 'bg-primary'} rounded-full mt-2 flex-shrink-0"></div>
                            <div class="flex-1">
                                <p class="text-sm font-medium text-gray-900 dark:text-white">${notification.title}</p>
                                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${notification.message}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-500 mt-2">${UIComponents.formatRelativeTime(notification.time)}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="p-4 border-t border-black/10 dark:border-white/10">
                <button class="w-full text-center text-sm text-primary hover:text-primary/80">
                    View all notifications
                </button>
            </div>
        `;
    }

    // Show user menu
    showUserMenu() {
        const content = `
            <div class="space-y-4">
                <div class="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="w-12 h-12 rounded-full bg-cover bg-center" style='background-image: url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face");'></div>
                    <div>
                        <h3 class="font-medium text-gray-900 dark:text-white">John Doe</h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400">System Administrator</p>
                    </div>
                </div>
                <div class="space-y-2">
                    <button class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        Profile Settings
                    </button>
                    <button class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        Preferences
                    </button>
                    <button onclick="app.showAbout()" class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        About AI DPR
                    </button>
                    <button onclick="app.logout()" class="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        Sign Out
                    </button>
                </div>
            </div>
        `;

        UIComponents.createModal('userMenuModal', 'User Menu', content, { size: 'md' });
        UIComponents.showModal('userMenuModal');
    }

    // Show about modal
    showAbout() {
        const content = `
            <div class="text-center space-y-4">
                <div class="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                    <svg class="w-8 h-8 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z" fill="currentColor"></path>
                    </svg>
                </div>
                <div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">AI DPR System</h2>
                    <p class="text-gray-600 dark:text-gray-400 mt-2">Intelligent Detailed Project Reporting</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 text-left">
                    <dl class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <dt class="text-gray-600 dark:text-gray-400">Version:</dt>
                            <dd class="text-gray-900 dark:text-white font-medium">1.0.0</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-gray-600 dark:text-gray-400">Build:</dt>
                            <dd class="text-gray-900 dark:text-white font-medium">${new Date().toISOString().split('T')[0]}</dd>
                        </div>
                        <div class="flex justify-between">
                            <dt class="text-gray-600 dark:text-gray-400">License:</dt>
                            <dd class="text-gray-900 dark:text-white font-medium">MIT</dd>
                        </div>
                    </dl>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    Powered by advanced AI algorithms for intelligent project risk analysis and automated reporting.
                </p>
            </div>
        `;

        UIComponents.createModal('aboutModal', 'About', content, { size: 'md' });
        UIComponents.showModal('aboutModal');
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for global search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('globalSearch');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Ctrl/Cmd + N for new report
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (this.currentPage === 'reports' && window.reportsManager) {
                window.reportsManager.openNewAnalysisModal();
            }
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('[id$="Modal"]:not(.hidden)');
            modals.forEach(modal => {
                if (modal.style.display !== 'none') {
                    UIComponents.closeModal(modal.id);
                }
            });
        }
    }

    // Perform global search
    performGlobalSearch(query) {
        if (!query.trim()) return;

        // Navigate to reports page and perform search
        this.showPage('reports').then(() => {
            if (window.reportsManager) {
                window.reportsManager.searchReports(query);
            }
        });

        UIComponents.showNotification(`Searching for "${query}"...`, 'info', 1500);
    }

    // Setup auto-save functionality
    setupAutoSave() {
        // Auto-save form data to localStorage
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('input', UIComponents.debounce(() => {
                    this.autoSave(form.id, input.name, input.value);
                }, 1000));
            });
        });
    }

    // Auto-save data
    autoSave(formId, fieldName, value) {
        if (!formId || !fieldName) return;
        
        const key = `autosave_${formId}_${fieldName}`;
        localStorage.setItem(key, value);
    }

    // Monitor connection status
    monitorConnectionStatus() {
        window.addEventListener('online', () => {
            UIComponents.showNotification('Connection restored', 'success');
        });

        window.addEventListener('offline', () => {
            UIComponents.showNotification('Connection lost - working offline', 'warning');
        });
    }

    // Handle notification click
    handleNotificationClick(notificationId) {
        console.log('Notification clicked:', notificationId);
        // Handle navigation or actions based on notification type
    }

    // Mark all notifications as read
    markAllNotificationsRead() {
        UIComponents.showNotification('All notifications marked as read', 'success');
        // Update UI to reflect read status
    }

    // Logout
    async logout() {
        try {
            await API.logout();
            localStorage.clear();
            window.location.reload();
        } catch (error) {
            console.error('Logout failed:', error);
            UIComponents.showNotification('Logout failed', 'error');
        }
    }
}

// Initialize app when DOM is loaded with better error handling
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    try {
        // Ensure only one instance of app exists
        if (window.app) {
            console.log('App already exists, reinitializing...');
            return;
        }
        
        window.app = new App();
        window.app.init();
        
        // Set a flag to prevent duplicate initialization
        window.appInitialized = true;
        
    } catch (error) {
        console.error('Failed to initialize main app:', error);
        console.log('Falling back to debug navigation...');
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh data when page becomes visible
        if (window.app && window.app.isInitialized) {
            if (window.app.currentPage === 'dashboard' && window.dashboard) {
                // Optionally refresh dashboard data
            }
        }
    }
});