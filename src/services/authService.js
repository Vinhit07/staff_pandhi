import api from '../utils/api';

const AUTH_ENDPOINTS = {
    SIGNIN: '/staff/auth/signin/',
    SIGNUP: '/staff/auth/signup/',
    CHECK: '/staff/auth/check/',
};

/**
 * Authentication service for API calls
 */
export const authService = {
    /**
     * Sign in user
     */
    signIn: async (email, password) => {
        return api.post(AUTH_ENDPOINTS.SIGNIN, { email, password });
    },

    /**
     * Sign up new user
     */
    signUp: async (name, email, password, outletCode) => {
        return api.post(AUTH_ENDPOINTS.SIGNUP, { name, email, password, outletCode });
    },

    /**
     * Check if session is valid
     */
    checkSession: async () => {
        return api.get(AUTH_ENDPOINTS.CHECK);
    },
};

export default authService;
