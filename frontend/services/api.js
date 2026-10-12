/**
 * TrackDue Centralized API Service
 * Handles all HTTP communication between the frontend client and Spring Boot backend.
 */

const TrackDueAPI = (() => {
    // Determine the base backend URL dynamically
    const isStandalone = window.location.protocol === 'file:' || 
                         (window.location.port !== '8080' && window.location.port !== '');
    const BASE_URL = isStandalone ? 'http://localhost:8080/api' : '/api';

    async function request(endpoint, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch (e) {
                    errorData = { message: `Request failed with status ${response.status}` };
                }
                throw errorData;
            }
            // Handle 204 or empty responses
            if (response.status === 204) return null;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return await response.text();
        } catch (error) {
            console.error(`[API Error] ${endpoint}:`, error);
            throw error;
        }
    }

    return {
        BASE_URL,

        // Auth Services
        auth: {
            login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
            register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
            getCurrentUser: () => {
                const user = localStorage.getItem('trackdue_user');
                return user ? JSON.parse(user) : null;
            },
            setCurrentUser: (user) => {
                if (user) {
                    localStorage.setItem('trackdue_user', JSON.stringify(user));
                } else {
                    localStorage.removeItem('trackdue_user');
                }
            },
            logout: () => {
                localStorage.removeItem('trackdue_user');
                window.location.href = 'index.html';
            },
            isAuthenticated: () => {
                return localStorage.getItem('trackdue_user') !== null;
            },
            isAdmin: () => {
                const user = TrackDueAPI.auth.getCurrentUser();
                if (!user) return false;
                const email = (user.email || '').toLowerCase();
                const role = (user.role || '').toUpperCase();
                return role === 'SYSTEM_ADMINISTRATOR' || 
                       role === 'ADMIN' || 
                       email === 'admin@trackdue.com';
            }
        },

        // Reminders Services
        reminders: {
            getAll: () => request('/reminders'),
            getByUser: (userId) => request(`/reminders/user/${userId}`),
            getById: (id) => request(`/reminders/${id}`),
            create: (data) => request('/reminders', { method: 'POST', body: data }),
            update: (id, data) => request(`/reminders/${id}`, { method: 'PUT', body: data }),
            delete: (id) => request(`/reminders/${id}`, { method: 'DELETE' }),
            toggleStatus: (id, status) => request(`/reminders/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' })
        },

        // Bills Services
        bills: {
            getAll: () => request('/bills'),
            getByUser: (userId) => request(`/bills/user/${userId}`),
            getById: (id) => request(`/bills/${id}`),
            create: (data) => request('/bills', { method: 'POST', body: data }),
            update: (id, data) => request(`/bills/${id}`, { method: 'PUT', body: data }),
            delete: (id) => request(`/bills/${id}`, { method: 'DELETE' })
        },

        // Events Services
        events: {
            getAll: () => request('/events'),
            getByUser: (userId) => request(`/events/user/${userId}`),
            getById: (id) => request(`/events/${id}`),
            create: (data) => request('/events', { method: 'POST', body: data }),
            update: (id, data) => request(`/events/${id}`, { method: 'PUT', body: data }),
            delete: (id) => request(`/events/${id}`, { method: 'DELETE' })
        },

        // Users Services (Admin & Profile)
        users: {
            getAll: () => request('/users'),
            getById: (id) => request(`/users/${id}`),
            create: (data) => request('/users', { method: 'POST', body: data }),
            update: (id, data) => request(`/users/${id}`, { method: 'PUT', body: data }),
            updateProfile: (id, data) => request(`/users/${id}/profile`, { method: 'PUT', body: data }),
            changePassword: (id, data) => request(`/users/${id}/password`, { method: 'PUT', body: data }),
            delete: (id) => request(`/users/${id}`, { method: 'DELETE' })
        },

        // Reports Services
        reports: {
            getSummary: () => request('/reports/summary'),
            getSummaryByUser: (userId) => request(`/reports/summary/user/${userId}`),
            getFiltered: (filters) => request('/reports/filter', { method: 'POST', body: filters })
        },

        // Support Requests
        support: {
            getAll: () => request('/support'),
            getByUser: (userId) => request(`/support/user/${userId}`),
            create: (data) => request('/support', { method: 'POST', body: data }),
            updateStatus: (id, status) => request(`/support/${id}/status?status=${encodeURIComponent(status)}`, { method: 'PATCH' })
        },

        // Feedback Services
        feedback: {
            getAll: () => request('/feedback'),
            create: (data) => request('/feedback', { method: 'POST', body: data })
        },

        // Activity Logs / History
        history: {
            getAll: () => request('/history'),
            getByUser: (userId) => request(`/history/user/${userId}`)
        }
    };
})();

// Attach globally
window.TrackDueAPI = TrackDueAPI;
