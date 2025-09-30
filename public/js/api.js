// API Service - Handles all HTTP requests to the backend
class APIService {
    constructor() {
        this.baseURL = window.location.origin + '/api';
        this.token = localStorage.getItem('authToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    // Remove authentication token
    removeToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    // Get headers for requests
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return headers;
    }

    // Generic request method
    async request(url, options = {}) {
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(`${this.baseURL}${url}`, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // GET request
    async get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return this.request(fullUrl);
    }

    // POST request
    async post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // PUT request
    async put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // DELETE request
    async delete(url) {
        return this.request(url, {
            method: 'DELETE'
        });
    }

    // Authentication methods
    async login(username, password) {
        try {
            const response = await this.post('/auth/login', { username, password });
            if (response.token) {
                this.setToken(response.token);
            }
            return response;
        } catch (error) {
            throw error;
        }
    }

    async register(username, email, password) {
        try {
            const response = await this.post('/auth/register', { username, email, password });
            if (response.token) {
                this.setToken(response.token);
            }
            return response;
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        this.removeToken();
    }

    // Reports API
    async getReports(params = {}) {
        return this.get('/reports', params);
    }

    async getReport(id) {
        return this.get(`/reports/${id}`);
    }

    async createReport(data) {
        return this.post('/reports', data);
    }

    async updateReportStatus(id, status) {
        return this.put(`/reports/${id}/status`, { status });
    }

    // Analytics API
    async getDashboardData() {
        return this.get('/analytics/dashboard');
    }

    // AI Analysis API
    async analyzeProject(data) {
        return this.post('/ai/analyze', data);
    }
}

// Create global API instance
window.API = new APIService();

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}