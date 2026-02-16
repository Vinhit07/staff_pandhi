// Profile Service
// Handles user profile and security-related API calls

import { apiRequest, uploadFile } from '../lib/api.js';
import { API_ENDPOINTS } from '../lib/constants.js';

export const profileService = {
    /**
     * Get current staff profile
     * @returns {Promise<Object>} - Staff profile data
     */
    getProfile: async () => {
        return await apiRequest(API_ENDPOINTS.GET_PROFILE, {
            method: 'GET',
        });
    },

    /**
     * Update staff profile
     * @param {Object} profileData - Updated profile data
     * @returns {Promise<Object>} - Updated profile
     */
    updateProfile: async (profileData) => {
        return await apiRequest(API_ENDPOINTS.UPDATE_PROFILE, {
            method: 'PUT',
            body: profileData,
        });
    },

    /**
     * Upload profile image
     * @param {File} file - Image file
     * @returns {Promise<Object>} - Upload response with image URL
     */
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        return await uploadFile(API_ENDPOINTS.UPLOAD_IMAGE, formData);
    },

    /**
     * Delete profile image
     * @returns {Promise<Object>} - Delete confirmation
     */
    deleteImage: async () => {
        return await apiRequest(API_ENDPOINTS.DELETE_IMAGE, {
            method: 'DELETE',
        });
    },

    // Security methods

    /**
     * Change password
     * @param {Object} passwordData - { currentPassword, newPassword }
     * @returns {Promise<Object>} - Success confirmation
     */
    changePassword: async (passwordData) => {
        return await apiRequest(API_ENDPOINTS.CHANGE_PASSWORD, {
            method: 'POST',
            body: passwordData,
        });
    },

    /**
     * Get 2FA status
     * @returns {Promise<Object>} - 2FA enabled status
     */
    get2FAStatus: async () => {
        return await apiRequest(API_ENDPOINTS.GET_2FA_STATUS, {
            method: 'GET',
        });
    },

    /**
     * Generate 2FA setup (QR code, secret)
     * @returns {Promise<Object>} - 2FA setup data
     */
    generate2FA: async () => {
        return await apiRequest(API_ENDPOINTS.GENERATE_2FA, {
            method: 'POST',
        });
    },

    /**
     * Enable 2FA with verification code
     * @param {string} code - 2FA verification code
     * @returns {Promise<Object>} - Success confirmation with backup codes
     */
    enable2FA: async (code) => {
        return await apiRequest(API_ENDPOINTS.ENABLE_2FA, {
            method: 'POST',
            body: { code },
        });
    },

    /**
     * Disable 2FA
     * @param {string} code - 2FA verification code
     * @returns {Promise<Object>} - Success confirmation
     */
    disable2FA: async (code) => {
        return await apiRequest(API_ENDPOINTS.DISABLE_2FA, {
            method: 'POST',
            body: { code },
        });
    },

    /**
     * Get backup codes count
     * @returns {Promise<Object>} - Count of remaining backup codes
     */
    getBackupCodesCount: async () => {
        return await apiRequest(API_ENDPOINTS.BACKUP_CODES_COUNT, {
            method: 'GET',
        });
    },
};
