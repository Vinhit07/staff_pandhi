// Authentication Service
// Handles all authentication-related API calls

import { apiRequest } from '../lib/api.js';
import { API_ENDPOINTS } from '../lib/constants.js';

export const authService = {
    /**
     * Staff signup
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} - Response with user and token
     */
    signUp: async (userData) => {
        return await apiRequest(API_ENDPOINTS.SIGN_UP, {
            method: 'POST',
            body: userData,
        });
    },

    /**
     * Staff signin
     * @param {Object} credentials - { email, password }
     * @returns {Promise<Object>} - Response with user, token, and outlet
     */
    signIn: async (credentials) => {
        const response = await apiRequest(API_ENDPOINTS.SIGN_IN, {
            method: 'POST',
            body: credentials,
        });

        // Store token in localStorage
        if (response && response.token) {
            localStorage.setItem('token', response.token);
        }

        return response;
    },

    /**
     * Sign out current user
     * @returns {Promise<Object>} - Response confirming signout
     */
    signOut: async () => {
        const response = await apiRequest(API_ENDPOINTS.SIGN_OUT, {
            method: 'POST',
        });

        // Clear token and outlet details from localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('outletDetails');

        return response;
    },

    /**
     * Check current authentication status
     * @returns {Promise<Object>} - Response with current user data
     */
    checkAuth: async () => {
        return await apiRequest(API_ENDPOINTS.CHECK_AUTH, {
            method: 'GET',
        });
    },
};
