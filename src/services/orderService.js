// Order Service
// Handles all order-related API calls

import { apiRequest } from '../lib/api.js';
import { API_ENDPOINTS } from '../lib/constants.js';

export const orderService = {
    /**
     * Get home dashboard data
     * @returns {Promise<Object>} - Home data with stats and recent activity
     */
    getHomeData: async () => {
        return await apiRequest(API_ENDPOINTS.HOME_DATA, {
            method: 'GET',
        });
    },

    /**
     * Get orders with optional filters
     * @param {string} outletId - Outlet ID
     * @param {Object} filters - Optional filters (status, date range, etc.)
     * @returns {Promise<Object>} - List of orders
     */
    getOrders: async (outletId, filters = {}) => {
        const params = new URLSearchParams(filters);
        return await apiRequest(`${API_ENDPOINTS.RECENT_ORDERS}/${outletId}/?${params.toString()}`, {
            method: 'GET',
        });
    },

    /**
     * Get recent orders for an outlet
     * @param {string} outletId - Outlet ID
     * @param {Object} filters - Optional filters (status, date range, etc.)
     * @returns {Promise<Object>} - List of recent orders
     */
    getRecentOrders: async (outletId, filters = {}) => {
        const params = new URLSearchParams(filters);
        return await apiRequest(`${API_ENDPOINTS.RECENT_ORDERS}/${outletId}/?${params.toString()}`, {
            method: 'GET',
        });
    },

    /**
     * Get specific order details
     * @param {string} outletId - Outlet ID
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} - Order details
     */
    getOrderById: async (outletId, orderId) => {
        return await apiRequest(`${API_ENDPOINTS.GET_ORDER}/${outletId}/${orderId}/`, {
            method: 'GET',
        });
    },

    /**
     * Update order status (deliver, cancel, partially deliver)
     * @param {string|Object} orderIdOrData - Order ID or full order data object
     * @param {string} status - Status to set (delivered, cancelled, etc.)
     * @returns {Promise<Object>} - Update result
     */
    updateOrderStatus: async (orderIdOrData, status) => {
        // Support both signatures: updateOrderStatus(orderId, status) and updateOrderStatus(orderData)
        const orderData = typeof orderIdOrData === 'string' || typeof orderIdOrData === 'number'
            ? { orderId: orderIdOrData, status }
            : orderIdOrData;

        return await apiRequest(API_ENDPOINTS.UPDATE_ORDER, {
            method: 'PUT',
            body: orderData,
        });
    },

    /**
     * Add manual order
     * @param {Object} orderData - Order details
     * @returns {Promise<Object>} - Created order
     */
    addManualOrder: async (orderData) => {
        return await apiRequest(API_ENDPOINTS.ADD_MANUAL_ORDER, {
            method: 'POST',
            body: orderData,
        });
    },

    /**
     * Get order history
     * @param {Object} params - Query parameters (date range, filters)
     * @returns {Promise<Object>} - Order history
     */
    getOrderHistory: async (params = {}) => {
        const queryParams = new URLSearchParams(params);
        return await apiRequest(`${API_ENDPOINTS.ORDER_HISTORY}?${queryParams.toString()}`, {
            method: 'GET',
        });
    },

    /**
     * Get available order dates and slots
     * @param {string} outletId - Outlet ID
     * @returns {Promise<Object>} - Available dates and time slots
     */
    getOrderDates: async (outletId) => {
        return await apiRequest(`${API_ENDPOINTS.ORDER_DATES}/${outletId}`, {
            method: 'GET',
        });
    },

    /**
     * Get current orders for outlet (for notifications)
     * @param {string} outletId - Outlet ID
     * @returns {Promise<Object>} - Current active orders
     */
    getCurrentOrders: async (outletId) => {
        return await apiRequest(`${API_ENDPOINTS.CURRENT_ORDER}/${outletId}`, {
            method: 'GET',
        });
    },

    /**
     * Get tickets count
     * @returns {Promise<Object>} - Ticket count statistics
     */
    getTicketsCount: async () => {
        return await apiRequest(API_ENDPOINTS.TICKETS_COUNT, {
            method: 'GET',
        });
    },
};
