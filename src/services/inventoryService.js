// Inventory Service
// Handles all inventory and stock-related API calls

import { apiRequest } from '../lib/api.js';
import { API_ENDPOINTS } from '../lib/constants.js';

export const inventoryService = {
    /**
     * Get current stock levels for an outlet
     * @param {string} outletId - Outlet ID
     * @returns {Promise<Object>} - Stock levels for all products
     */
    getStocks: async (outletId) => {
        return await apiRequest(`${API_ENDPOINTS.GET_STOCKS}/${outletId}/`, {
            method: 'GET',
        });
    },

    /**
     * Get products that are in stock
     * @param {string} outletId - Outlet ID
     * @returns {Promise<Object>} - List of in-stock products
     */
    getProductsInStock: async (outletId) => {
        return await apiRequest(`${API_ENDPOINTS.GET_PRODUCTS_IN_STOCK}/${outletId}`, {
            method: 'GET',
        });
    },

    /**
     * Add stock to inventory
     * @param {Object} stockData - Stock addition data (productId, quantity, etc.)
     * @returns {Promise<Object>} - Updated stock record
     */
    addStock: async (stockData) => {
        return await apiRequest(API_ENDPOINTS.ADD_STOCK, {
            method: 'POST',
            body: stockData,
        });
    },

    /**
     * Deduct stock from inventory
     * @param {Object} stockData - Stock deduction data (productId, quantity, etc.)
     * @returns {Promise<Object>} - Updated stock record
     */
    deductStock: async (stockData) => {
        return await apiRequest(API_ENDPOINTS.DEDUCT_STOCK, {
            method: 'POST',
            body: stockData,
        });
    },

    /**
     * Get stock history/transactions
     * @param {Object} params - Query parameters (date range, productId, etc.)
     * @returns {Promise<Object>} - Stock transaction history
     */
    getStockHistory: async (params = {}) => {
        return await apiRequest(API_ENDPOINTS.STOCK_HISTORY, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get low stock items
     * @param {string} outletId - Outlet ID
     * @returns {Promise<Object>} - Items below minimum threshold
     */
    getLowStock: async (outletId) => {
        return await apiRequest(`${API_ENDPOINTS.GET_STOCKS}/${outletId}/`, {
            method: 'GET',
        });
    },

    /**
     * Update stock quantity
     * @param {string|number} itemId - Item ID
     * @param {Object} updateData - Update data (quantity, action: 'add'|'deduct')
     * @returns {Promise<Object>} - Updated stock record
     */
    updateStock: async (itemId, updateData) => {
        const endpoint = updateData.action === 'add'
            ? API_ENDPOINTS.ADD_STOCK
            : API_ENDPOINTS.DEDUCT_STOCK;

        return await apiRequest(endpoint, {
            method: 'POST',
            body: {
                productId: itemId,
                ...updateData
            },
        });
    },
};
