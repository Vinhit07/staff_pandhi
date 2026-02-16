// Wallet Service
// Handles wallet and recharge-related API calls

import { apiRequest } from '../lib/api.js';
import { API_ENDPOINTS } from '../lib/constants.js';

export const walletService = {
    /**
     * Get recharge history for an outlet
     * @param {string} outletId - Outlet ID
     * @returns {Promise<Object>} - Recharge transaction history
     */
    getRechargeHistory: async (outletId) => {
        return await apiRequest(`${API_ENDPOINTS.RECHARGE_HISTORY}/${outletId}/`, {
            method: 'GET',
        });
    },

    /**
     * Add wallet recharge
     * @param {Object} rechargeData - Recharge details (amount, customerId, etc.)
     * @returns {Promise<Object>} - Recharge confirmation
     */
    addRecharge: async (rechargeData) => {
        return await apiRequest(API_ENDPOINTS.RECHARGE_WALLET, {
            method: 'POST',
            body: rechargeData,
        });
    },
};
