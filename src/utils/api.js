// API utility for making HTTP requests with authorization

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500/api';

/**
 * Make an authorized API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (!response.ok) {
            if (response.status === 401) {
                // Token expired or invalid - clear auth and redirect
                localStorage.removeItem('token');
                localStorage.removeItem('outletDetails');
                window.location.href = '/signin';
                throw new Error('Session expired. Please login again.');
            }

            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

/**
 * GET request
 */
export const get = (endpoint) => apiRequest(endpoint, { method: 'GET' });

/**
 * POST request
 */
export const post = (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
});

/**
 * PUT request
 */
export const put = (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
});

/**
 * DELETE request
 */
export const del = (endpoint) => apiRequest(endpoint, { method: 'DELETE' });

/**
 * Upload file with FormData
 */
export const uploadFile = async (endpoint, formData) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
    }

    return response.json();
};

export default {
    get,
    post,
    put,
    del,
    uploadFile,
};
