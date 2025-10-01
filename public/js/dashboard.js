// Dashboard functionality
class Dashboard {
    constructor() {
        this.charts = {};
        this.dashboardData = null;
    }

    // Initialize dashboard
    async init() {
        try {
            UIComponents.showLoading('Loading dashboard data...');
            await this.loadDashboardData();
            this.renderMetrics();
            this.renderCharts();
            this.renderRecentActivity();
            this.setupEventListeners();
            UIComponents.hideLoading();
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            UIComponents.showNotification('Failed to load dashboard data', 'error');
            UIComponents.hideLoading();
        }
    }

    // Load dashboard data from API
    async loadDashboardData() {
        try {
            this.dashboardData = await API.getDashboardData();
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            // Fallback to mock data for demo
            this.dashboardData = this.getMockData();
        }
    }

    // Render metrics cards
    renderMetrics() {
        if (!this.dashboardData) return;

        const metrics = {
            totalReports: this.dashboardData.totalReports || 0,
            openReports: this.dashboardData.openReports || 0,
            highSeverity: this.dashboardData.highSeverityReports || 0,
            recentReports: this.dashboardData.recentReports || 0
        };

        // Show setup message if using mock data
        if (this.dashboardData.mockData || this.dashboardData.error) {
            this.showSetupMessage();
        }

        // Update metric displays
        Object.entries(metrics).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                this.animateCounter(element, value);
            }
        });
    }

    // Show setup message for database
    showSetupMessage() {
        const setupMessage = document.createElement('div');
        setupMessage.className = 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6';
        setupMessage.innerHTML = `
            <div class="flex items-start">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Database Setup Required
                    </h3>
                    <div class="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>The dashboard is showing sample data. To see real data, please set up your database:</p>
                        <ol class="mt-2 list-decimal list-inside space-y-1">
                            <li>Run: <code class="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">node setup-basic-db.js</code></li>
                            <li>Or manually create tables in your Supabase dashboard</li>
                            <li>Refresh the page to see real data</li>
                        </ol>
                    </div>
                </div>
            </div>
        `;

        const dashboardPage = document.getElementById('dashboardPage');
        if (dashboardPage && !document.querySelector('.setup-message')) {
            setupMessage.classList.add('setup-message');
            dashboardPage.insertBefore(setupMessage, dashboardPage.firstChild.nextSibling);
        }
    }

    // Render charts
    renderCharts() {
        if (!this.dashboardData) return;

        this.renderIssueDistributionChart();
        this.renderTrendsChart();
    }

    // Render issue distribution chart
    renderIssueDistributionChart() {
        const ctx = document.getElementById('issueChart');
        if (!ctx) return;

        const issueData = this.dashboardData.issueTypeDistribution || [];
        const labels = issueData.map(item => item.issue_type);
        const data = issueData.map(item => item.count);
        const colors = ['#1173d4', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

        if (this.charts.issueChart) {
            this.charts.issueChart.destroy();
        }

        this.charts.issueChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 1.5,
                devicePixelRatio: window.devicePixelRatio || 1,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12
                            },
                            color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
                        }
                    },
                    tooltip: {
                        backgroundColor: document.documentElement.classList.contains('dark') ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        titleColor: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
                        bodyColor: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                        borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                        borderWidth: 1
                    }
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10
                    }
                }
            }
        });
    }

    // Render trends chart
    renderTrendsChart() {
        const ctx = document.getElementById('trendsChart');
        if (!ctx) return;

        const trendsData = this.dashboardData.trendsData || [];
        
        // Process data for chart
        const dates = [...new Set(trendsData.map(item => item.date))].sort();
        const issueTypes = [...new Set(trendsData.map(item => item.issue_type))];
        const colors = ['#1173d4', '#f59e0b', '#10b981'];

        const datasets = issueTypes.map((type, index) => {
            const typeData = dates.map(date => {
                const item = trendsData.find(d => d.date === date && d.issue_type === type);
                return item ? item.count : 0;
            });

            return {
                label: type,
                data: typeData,
                borderColor: colors[index % colors.length],
                backgroundColor: colors[index % colors.length] + '20',
                tension: 0.4,
                fill: false
            };
        });

        if (this.charts.trendsChart) {
            this.charts.trendsChart.destroy();
        }

        this.charts.trendsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates.map(date => UIComponents.formatDate(date, { month: 'short', day: 'numeric' })),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                devicePixelRatio: window.devicePixelRatio || 1,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12
                            },
                            color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151'
                        }
                    },
                    tooltip: {
                        backgroundColor: document.documentElement.classList.contains('dark') ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        titleColor: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827',
                        bodyColor: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
                        borderColor: document.documentElement.classList.contains('dark') ? '#374151' : '#e5e7eb',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grace: '5%',
                        ticks: {
                            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                            font: {
                                size: 11
                            },
                            maxTicksLimit: 6
                        },
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6',
                            lineWidth: 1
                        }
                    },
                    x: {
                        ticks: {
                            color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280',
                            font: {
                                size: 11
                            },
                            maxRotation: 45,
                            minRotation: 0
                        },
                        grid: {
                            color: document.documentElement.classList.contains('dark') ? '#374151' : '#f3f4f6',
                            lineWidth: 1
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 4,
                        hoverRadius: 6
                    },
                    line: {
                        borderWidth: 3
                    }
                }
            }
        });
    }

    // Render recent activity
    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        // Mock recent activity data
        const activities = [
            {
                type: 'report_created',
                message: 'New high-priority budget analysis created for Project Alpha',
                time: new Date(Date.now() - 10 * 60000), // 10 minutes ago
                icon: 'document-plus',
                color: 'blue'
            },
            {
                type: 'status_updated',
                message: 'Report RPT-2023-003 marked as resolved',
                time: new Date(Date.now() - 30 * 60000), // 30 minutes ago
                icon: 'check-circle',
                color: 'green'
            },
            {
                type: 'ai_analysis',
                message: 'AI analysis completed for Project Beta schedule review',
                time: new Date(Date.now() - 45 * 60000), // 45 minutes ago
                icon: 'cpu-chip',
                color: 'purple'
            },
            {
                type: 'report_created',
                message: 'Resource allocation issue detected in Project Gamma',
                time: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
                icon: 'exclamation-triangle',
                color: 'yellow'
            },
            {
                type: 'export',
                message: 'Monthly risk report exported by admin user',
                time: new Date(Date.now() - 3 * 60 * 60000), // 3 hours ago
                icon: 'arrow-down-tray',
                color: 'gray'
            }
        ];

        container.innerHTML = activities.map(activity => `
            <div class="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div class="flex-shrink-0 w-8 h-8 bg-${activity.color}-100 dark:bg-${activity.color}-900/30 rounded-full flex items-center justify-center">
                    ${this.getActivityIcon(activity.icon, activity.color)}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900 dark:text-white">${activity.message}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${UIComponents.formatRelativeTime(activity.time)}</p>
                </div>
            </div>
        `).join('');
    }

    // Get activity icon
    getActivityIcon(iconName, color) {
        const icons = {
            'document-plus': `<svg class="w-4 h-4 text-${color}-600 dark:text-${color}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                             </svg>`,
            'check-circle': `<svg class="w-4 h-4 text-${color}-600 dark:text-${color}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>`,
            'cpu-chip': `<svg class="w-4 h-4 text-${color}-600 dark:text-${color}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2z"></path>
                        </svg>`,
            'exclamation-triangle': `<svg class="w-4 h-4 text-${color}-600 dark:text-${color}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                    </svg>`,
            'arrow-down-tray': `<svg class="w-4 h-4 text-${color}-600 dark:text-${color}-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"></path>
                               </svg>`
        };
        return icons[iconName] || icons['document-plus'];
    }

    // Animate counter
    animateCounter(element, target) {
        const start = parseInt(element.textContent) || 0;
        const increment = target > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(300 / (target - start)));
        
        const timer = setInterval(() => {
            const current = parseInt(element.textContent) || 0;
            if (current === target) {
                clearInterval(timer);
            } else {
                element.textContent = current + increment;
            }
        }, stepTime);
    }

    // Setup event listeners
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refresh();
            });
        }

        // Export button
        const exportBtn = document.getElementById('exportReport');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportDashboardData();
            });
        }

        // Window resize handler for charts
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (this.charts.issueChart) {
                    this.charts.issueChart.resize();
                }
                if (this.charts.trendsChart) {
                    this.charts.trendsChart.resize();
                }
            }, 250);
        });

        // Dark mode observer
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    // Re-render charts when dark mode changes to update colors
                    setTimeout(() => this.renderCharts(), 100);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    }

    // Refresh dashboard
    async refresh() {
        try {
            UIComponents.showNotification('Refreshing dashboard...', 'info', 1000);
            await this.loadDashboardData();
            this.renderMetrics();
            this.renderCharts();
            this.renderRecentActivity();
            UIComponents.showNotification('Dashboard refreshed successfully!', 'success');
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
            UIComponents.showNotification('Failed to refresh dashboard', 'error');
        }
    }

    // Export dashboard data
    exportDashboardData() {
        if (!this.dashboardData) {
            UIComponents.showNotification('No data to export', 'warning');
            return;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            metrics: {
                totalReports: this.dashboardData.totalReports?.[0]?.count || 0,
                openReports: this.dashboardData.openReports?.[0]?.count || 0,
                highSeverity: this.dashboardData.highSeverity?.[0]?.count || 0,
                recentReports: this.dashboardData.recentReports?.[0]?.count || 0
            },
            issueDistribution: this.dashboardData.issueTypeDistribution || [],
            trends: this.dashboardData.trendsData || []
        };

        UIComponents.exportAsJSON(exportData, `dashboard-export-${new Date().toISOString().split('T')[0]}.json`);
        UIComponents.showNotification('Dashboard data exported successfully!', 'success');
    }

    // Get mock data for fallback
    getMockData() {
        return {
            totalReports: [{ count: 15 }],
            openReports: [{ count: 8 }],
            highSeverity: [{ count: 3 }],
            recentReports: [{ count: 5 }],
            issueTypeDistribution: [
                { issue_type: 'Budget Mismatch', count: 6 },
                { issue_type: 'Unrealistic Schedule', count: 5 },
                { issue_type: 'Resource Allocation', count: 4 }
            ],
            trendsData: [
                { date: '2023-08-15', issue_type: 'Budget Mismatch', count: 2 },
                { date: '2023-08-16', issue_type: 'Unrealistic Schedule', count: 1 },
                { date: '2023-08-17', issue_type: 'Resource Allocation', count: 1 },
                { date: '2023-08-18', issue_type: 'Budget Mismatch', count: 1 },
                { date: '2023-08-19', issue_type: 'Unrealistic Schedule', count: 2 }
            ]
        };
    }

    // Update charts theme
    updateChartsTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        const textColor = isDark ? '#e5e7eb' : '#374151';
        const gridColor = isDark ? '#374151' : '#f3f4f6';

        Object.values(this.charts).forEach(chart => {
            if (chart && chart.options) {
                // Update legend colors
                if (chart.options.plugins && chart.options.plugins.legend) {
                    chart.options.plugins.legend.labels.color = textColor;
                }
                
                // Update scale colors
                if (chart.options.scales) {
                    ['x', 'y'].forEach(axis => {
                        if (chart.options.scales[axis]) {
                            if (chart.options.scales[axis].ticks) {
                                chart.options.scales[axis].ticks.color = textColor;
                            }
                            if (chart.options.scales[axis].grid) {
                                chart.options.scales[axis].grid.color = gridColor;
                            }
                        }
                    });
                }
                
                chart.update();
            }
        });
    }
}

// Create global dashboard instance
window.dashboard = new Dashboard();