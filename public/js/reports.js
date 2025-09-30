// Reports management functionality
class ReportsManager {
    constructor() {
        this.currentPage = 1;
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.reportsPerPage = 10;
        this.allReports = [];
        this.pagination = {};
    }

    // Initialize reports page
    async init() {
        try {
            await this.loadReports();
            this.setupEventListeners();
            this.setupFilterListeners();
        } catch (error) {
            console.error('Failed to initialize reports:', error);
            UIComponents.showNotification('Failed to load reports', 'error');
        }
    }

    // Load reports from API
    async loadReports(page = 1, filter = 'all', search = '') {
        try {
            const params = {
                page: page,
                limit: this.reportsPerPage,
                filter: filter !== 'all' ? filter : undefined,
                search: search || undefined
            };

            const response = await API.getReports(params);
            this.allReports = response.reports || [];
            this.pagination = response.pagination || {};
            this.currentPage = page;
            this.currentFilter = filter;
            this.currentSearch = search;

            this.renderReportsTable();
            this.renderPagination();
        } catch (error) {
            console.error('Error loading reports:', error);
            // Fallback to mock data
            this.loadMockReports();
        }
    }

    // Load mock reports for demo
    loadMockReports() {
        this.allReports = [
            {
                id: 'RPT-2023-001',
                project_name: 'Project Alpha',
                issue_type: 'Budget Mismatch',
                description: 'Budget exceeds allocated funds by 15%',
                severity: 'High',
                status: 'Open',
                created_at: '2023-08-15T10:00:00Z',
                ai_analysis: 'AI analysis indicates potential cost overruns due to scope creep and inflation.',
                confidence_score: 0.92
            },
            {
                id: 'RPT-2023-002',
                project_name: 'Project Beta',
                issue_type: 'Unrealistic Schedule',
                description: 'Project timeline is too short for the scope of work',
                severity: 'Medium',
                status: 'In Review',
                created_at: '2023-08-16T14:30:00Z',
                ai_analysis: 'AI timeline analysis shows 73% probability of delays based on historical project data.',
                confidence_score: 0.87
            },
            {
                id: 'RPT-2023-003',
                project_name: 'Project Gamma',
                issue_type: 'Resource Allocation',
                description: 'Insufficient resources allocated to critical tasks',
                severity: 'Low',
                status: 'Resolved',
                created_at: '2023-08-17T09:15:00Z',
                ai_analysis: 'AI resource optimization suggests redistributing team members from non-critical tasks.',
                confidence_score: 0.79
            },
            {
                id: 'RPT-2023-004',
                project_name: 'Project Delta',
                issue_type: 'Budget Mismatch',
                description: 'Discrepancy between planned and actual expenses',
                severity: 'High',
                status: 'Open',
                created_at: '2023-08-18T16:45:00Z',
                ai_analysis: 'Significant variance detected in expense categories.',
                confidence_score: 0.95
            },
            {
                id: 'RPT-2023-005',
                project_name: 'Project Epsilon',
                issue_type: 'Unrealistic Schedule',
                description: 'Project milestones are not achievable',
                severity: 'Medium',
                status: 'In Review',
                created_at: '2023-08-19T11:20:00Z',
                ai_analysis: 'Critical path analysis reveals bottlenecks in design phase.',
                confidence_score: 0.83
            }
        ];

        this.pagination = {
            currentPage: 1,
            totalPages: 1,
            totalReports: this.allReports.length,
            hasNext: false,
            hasPrev: false
        };

        this.renderReportsTable();
        this.renderPagination();
    }

    // Render reports table
    renderReportsTable() {
        const tbody = document.getElementById('reportsTableBody');
        if (!tbody) return;

        if (this.allReports.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        <div class="flex flex-col items-center gap-2">
                            <svg class="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <p>No reports found</p>
                            <p class="text-sm">Try adjusting your search or filter criteria</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.allReports.map(report => `
            <tr class="table-row-hover cursor-pointer transition-all" onclick="reportsManager.openReportDetails('${report.id}')" data-issue-type="${report.issue_type}">
                <td class="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    ${report.id}
                    <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        ${UIComponents.formatDate(report.created_at)}
                    </div>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                    ${report.project_name}
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-sm">
                    ${UIComponents.getIssueTypeBadge(report.issue_type)}
                </td>
                <td class="px-4 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    <div class="truncate" title="${report.description}">
                        ${report.description}
                    </div>
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-sm">
                    ${UIComponents.getSeverityBadge(report.severity)}
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-sm">
                    ${UIComponents.getStatusBadge(report.status)}
                </td>
                <td class="whitespace-nowrap px-4 py-4 text-sm text-gray-500">
                    <div class="flex items-center gap-2">
                        <button onclick="event.stopPropagation(); reportsManager.openReportDetails('${report.id}')" class="text-primary hover:text-primary/80 transition-colors" title="View Details">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                        <div class="relative">
                            <button onclick="event.stopPropagation(); reportsManager.toggleActionMenu('${report.id}')" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors" title="Actions">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                                </svg>
                            </button>
                            <div id="actionMenu-${report.id}" class="hidden absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-black/10 dark:border-white/10 z-10">
                                <div class="py-1">
                                    <button onclick="reportsManager.updateStatus('${report.id}', 'In Review')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Mark In Review</button>
                                    <button onclick="reportsManager.updateStatus('${report.id}', 'Resolved')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Mark Resolved</button>
                                    <button onclick="reportsManager.duplicateReport('${report.id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Duplicate</button>
                                    <button onclick="reportsManager.exportReport('${report.id}')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Export</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Render pagination
    renderPagination() {
        const showingFrom = document.getElementById('showingFrom');
        const showingTo = document.getElementById('showingTo');
        const totalRecords = document.getElementById('totalRecords');
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        const pageNumbers = document.getElementById('pageNumbers');

        if (!showingFrom || !showingTo || !totalRecords || !prevPage || !nextPage || !pageNumbers) return;

        const { currentPage, totalPages, totalReports } = this.pagination;
        const from = Math.min((currentPage - 1) * this.reportsPerPage + 1, totalReports);
        const to = Math.min(currentPage * this.reportsPerPage, totalReports);

        showingFrom.textContent = from;
        showingTo.textContent = to;
        totalRecords.textContent = totalReports;

        prevPage.disabled = currentPage <= 1;
        nextPage.disabled = currentPage >= totalPages;

        // Generate page numbers
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        pageNumbers.innerHTML = pages.map(page => `
            <button onclick="reportsManager.goToPage(${page})" class="px-3 py-2 text-sm font-medium ${page === currentPage ? 'text-white bg-primary' : 'text-gray-500 bg-white hover:bg-gray-50'} border border-gray-300 dark:border-gray-600 ${page === currentPage ? '' : 'dark:bg-gray-800 dark:hover:bg-gray-700'} ${page === 1 ? 'rounded-l-lg' : ''} ${page === pages[pages.length - 1] ? 'rounded-r-lg' : ''} transition-colors">
                ${page}
            </button>
        `).join('');
    }

    // Setup event listeners
    setupEventListeners() {
        // New Analysis button
        const newAnalysisBtn = document.getElementById('newAnalysisBtn');
        if (newAnalysisBtn) {
            newAnalysisBtn.addEventListener('click', () => {
                this.openNewAnalysisModal();
            });
        }

        // Search functionality
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', UIComponents.debounce((e) => {
                this.searchReports(e.target.value);
            }, 300));
        }

        // Pagination buttons
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        
        if (prevPage) {
            prevPage.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.goToPage(this.currentPage - 1);
                }
            });
        }

        if (nextPage) {
            nextPage.addEventListener('click', () => {
                if (this.currentPage < this.pagination.totalPages) {
                    this.goToPage(this.currentPage + 1);
                }
            });
        }

        // Close action menus when clicking outside
        document.addEventListener('click', (e) => {
            const actionMenus = document.querySelectorAll('[id^="actionMenu-"]');
            actionMenus.forEach(menu => {
                if (!menu.contains(e.target) && !e.target.closest('[onclick*="toggleActionMenu"]')) {
                    menu.classList.add('hidden');
                }
            });
        });
    }

    // Setup filter listeners
    setupFilterListeners() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filter = button.dataset.filter;
                this.filterReports(filter);
                
                // Update button states
                filterButtons.forEach(btn => {
                    if (btn.dataset.filter === filter) {
                        btn.className = 'filter-btn rounded-lg bg-primary/10 dark:bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition-all';
                    } else {
                        btn.className = 'filter-btn rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-primary/10 dark:hover:bg-primary/20 hover:text-primary transition-all';
                    }
                });
            });
        });
    }

    // Filter reports
    async filterReports(filter) {
        await this.loadReports(1, filter, this.currentSearch);
    }

    // Search reports
    async searchReports(query) {
        await this.loadReports(1, this.currentFilter, query);
    }

    // Go to specific page
    async goToPage(page) {
        await this.loadReports(page, this.currentFilter, this.currentSearch);
    }

    // Toggle action menu
    toggleActionMenu(reportId) {
        const menu = document.getElementById(`actionMenu-${reportId}`);
        if (menu) {
            menu.classList.toggle('hidden');
        }
    }

    // Update report status
    async updateStatus(reportId, newStatus) {
        try {
            await API.updateReportStatus(reportId, newStatus);
            UIComponents.showNotification(`Report ${reportId} status updated to ${newStatus}`, 'success');
            await this.loadReports(this.currentPage, this.currentFilter, this.currentSearch);
        } catch (error) {
            console.error('Failed to update status:', error);
            UIComponents.showNotification('Failed to update report status', 'error');
        }
    }

    // Open report details modal
    openReportDetails(reportId) {
        const report = this.allReports.find(r => r.id === reportId);
        if (!report) return;

        const content = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report ID</label>
                        <p class="text-lg font-semibold text-gray-900 dark:text-white">${report.id}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project</label>
                        <p class="text-gray-900 dark:text-white">${report.project_name}</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Type</label>
                        ${UIComponents.getIssueTypeBadge(report.issue_type)}
                    </div>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                        ${UIComponents.getSeverityBadge(report.severity)}
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                        ${UIComponents.getStatusBadge(report.status)}
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Created</label>
                        <p class="text-gray-900 dark:text-white">${UIComponents.formatDate(report.created_at, { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}</p>
                    </div>
                </div>
            </div>
            <div class="mt-6">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <p class="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">${report.description}</p>
            </div>
            ${report.ai_analysis ? `
                <div class="mt-6">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI Analysis</label>
                    <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p class="text-blue-900 dark:text-blue-200 mb-3">${report.ai_analysis}</p>
                        ${report.confidence_score ? `
                            <div class="flex items-center gap-2">
                                <span class="text-sm text-blue-700 dark:text-blue-300">Confidence:</span>
                                <div class="flex-1 ai-confidence-bar">
                                    <div class="ai-confidence-fill" style="width: ${(report.confidence_score * 100)}%"></div>
                                </div>
                                <span class="text-sm font-medium text-blue-700 dark:text-blue-300">${Math.round(report.confidence_score * 100)}%</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
        `;

        const footer = `
            <button onclick="reportsManager.updateStatus('${report.id}', 'In Review')" class="btn btn-secondary">Mark In Review</button>
            <button onclick="reportsManager.updateStatus('${report.id}', 'Resolved')" class="btn btn-primary">Mark Resolved</button>
            <button onclick="reportsManager.exportReport('${report.id}')" class="btn btn-outline">Export</button>
        `;

        UIComponents.createModal('reportDetailsModal', `${report.id} - ${report.project_name}`, content, { footer, size: '4xl' });
        UIComponents.showModal('reportDetailsModal');
    }

    // Open new analysis modal
    openNewAnalysisModal() {
        const content = `
            <form id="newReportForm" class="space-y-4">
                <div>
                    <label class="form-label text-gray-700 dark:text-gray-300">Project Name</label>
                    <input type="text" name="project_name" class="form-input" placeholder="Enter project name" required>
                </div>
                <div>
                    <label class="form-label text-gray-700 dark:text-gray-300">Issue Type</label>
                    <select name="issue_type" class="form-input" required>
                        <option value="">Select issue type</option>
                        <option value="Budget Mismatch">Budget Mismatch</option>
                        <option value="Unrealistic Schedule">Unrealistic Schedule</option>
                        <option value="Resource Allocation">Resource Allocation</option>
                    </select>
                </div>
                <div>
                    <label class="form-label text-gray-700 dark:text-gray-300">Severity</label>
                    <select name="severity" class="form-input" required>
                        <option value="">Select severity</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                <div>
                    <label class="form-label text-gray-700 dark:text-gray-300">Description</label>
                    <textarea name="description" rows="4" class="form-input" placeholder="Describe the issue in detail..." required></textarea>
                </div>
            </form>
        `;

        const footer = `
            <button onclick="UIComponents.closeModal('newAnalysisModal')" class="btn btn-outline">Cancel</button>
            <button onclick="reportsManager.submitNewReport()" class="btn btn-primary">
                <span id="submitText">Create Report</span>
                <div id="submitSpinner" class="hidden loading-spinner"></div>
            </button>
        `;

        UIComponents.createModal('newAnalysisModal', 'Create New Analysis Report', content, { footer });
        UIComponents.showModal('newAnalysisModal');
    }

    // Submit new report
    async submitNewReport() {
        const form = document.getElementById('newReportForm');
        if (!UIComponents.validateForm(form)) {
            UIComponents.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const formData = new FormData(form);
        const reportData = Object.fromEntries(formData);

        const submitText = document.getElementById('submitText');
        const submitSpinner = document.getElementById('submitSpinner');

        try {
            submitText.style.display = 'none';
            submitSpinner.classList.remove('hidden');

            await API.createReport(reportData);
            UIComponents.showNotification('Report created successfully!', 'success');
            UIComponents.closeModal('newAnalysisModal');
            await this.loadReports(this.currentPage, this.currentFilter, this.currentSearch);
        } catch (error) {
            console.error('Failed to create report:', error);
            UIComponents.showNotification('Failed to create report', 'error');
        } finally {
            submitText.style.display = 'inline';
            submitSpinner.classList.add('hidden');
        }
    }

    // Export single report
    exportReport(reportId) {
        const report = this.allReports.find(r => r.id === reportId);
        if (!report) {
            UIComponents.showNotification('Report not found', 'error');
            return;
        }

        UIComponents.exportAsJSON(report, `${report.id}.json`);
        UIComponents.showNotification('Report exported successfully!', 'success');
    }

    // Duplicate report
    duplicateReport(reportId) {
        const report = this.allReports.find(r => r.id === reportId);
        if (!report) return;

        // Pre-fill the new report form with existing data
        this.openNewAnalysisModal();
        
        setTimeout(() => {
            const form = document.getElementById('newReportForm');
            if (form) {
                form.project_name.value = report.project_name + ' (Copy)';
                form.issue_type.value = report.issue_type;
                form.severity.value = report.severity;
                form.description.value = report.description;
            }
        }, 100);
    }

    // Export all reports
    exportAllReports() {
        if (this.allReports.length === 0) {
            UIComponents.showNotification('No reports to export', 'warning');
            return;
        }

        UIComponents.exportAsCSV(this.allReports, `reports-export-${new Date().toISOString().split('T')[0]}.csv`);
        UIComponents.showNotification('All reports exported successfully!', 'success');
    }
}

// Create global reports manager instance
window.reportsManager = new ReportsManager();