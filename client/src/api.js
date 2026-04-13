const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const TOKEN_KEY = 'gather_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (auth) {
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
}

// Admin requests use X-Admin-Secret header instead of Bearer token
function adminRequest(path, { method = 'GET', body } = {}) {
    const secret = sessionStorage.getItem('gather_admin_secret');
    const headers = { 'Content-Type': 'application/json' };
    if (secret) headers['X-Admin-Secret'] = secret;
    return fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    }).then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
        return data;
    });
}

export const api = {
    signup: (payload) => request('/api/signup', { method: 'POST', body: payload }),
    login: (email) => request('/api/login', { method: 'POST', body: { email } }),
    me: () => request('/api/me', { auth: true }),
    myCohort: () => request('/api/me/cohort', { auth: true }),
    rate: (session_id, response) =>
        request('/api/ratings', { method: 'POST', body: { session_id, response }, auth: true }),
    // Admin
    adminSignups: () => adminRequest('/api/admin/signups'),
    adminCohorts: () => adminRequest('/api/admin/cohorts'),
    adminMatch: () => adminRequest('/api/admin/match', { method: 'POST' }),
    adminSendRatingEmails: () => adminRequest('/api/admin/send-rating-emails', { method: 'POST' }),
};
