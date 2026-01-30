// Report Service
// Handles analytics and reporting API calls

import { apiRequest } from '../lib/api.js';
import { API_ENDPOINTS } from '../lib/constants.js';

export const reportService = {
    /**
     * Get sales trend data
     * @param {string} outletId - Outlet ID
     * @param {Object} params - Query parameters (startDate, endDate, interval)
     * @returns {Promise<Object>} - Sales trend data
     */
    getSalesTrend: async (outletId, params = {}) => {
        return await apiRequest(`${API_ENDPOINTS.SALES_TREND}/${outletId}/`, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get order type breakdown
     * @param {string} outletId - Outlet ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Order type distribution
     */
    getOrderTypeBreakdown: async (outletId, params = {}) => {
        return await apiRequest(`${API_ENDPOINTS.ORDER_TYPE_BREAKDOWN}/${outletId}/`, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get new customers trend
     * @param {string} outletId - Outlet ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - New customers over time
     */
    getNewCustomersTrend: async (outletId, params = {}) => {
        return await apiRequest(`${API_ENDPOINTS.NEW_CUSTOMERS_TREND}/${outletId}/`, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get category breakdown
     * @param {string} outletId - Outlet ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Sales by category
     */
    getCategoryBreakdown: async (outletId, params = {}) => {
        return await apiRequest(`${API_ENDPOINTS.CATEGORY_BREAKDOWN}/${outletId}/`, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get delivery time orders
     * @param {string} outletId - Outlet ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Orders by delivery time slot
     */
    getDeliveryTimeOrders: async (outletId, params = {}) => {
        return await apiRequest(`${API_ENDPOINTS.DELIVERY_TIME_ORDERS}/${outletId}/`, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get cancellation and refunds data
     * @param {string} outletId - Outlet ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Cancellation and refund statistics
     */
    getCancellationRefunds: async (outletId, params = {}) => {
        return await apiRequest(`${API_ENDPOINTS.CANCELLATION_REFUNDS}/${outletId}/`, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get quantity sold by product
     * @param {string} outletId - Outlet ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - Quantity sold per product
     */
    getQuantitySold: async (outletId, params = {}) => {
        return await apiRequest(`${API_ENDPOINTS.QUANTITY_SOLD}/${outletId}/`, {
            method: 'POST',
            body: params,
        });
    },

    /**
     * Get all reports data at once
     * @param {string} outletId - Outlet ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} - All report data
     */
    getAllReports: async (outletId, params = {}) => {
        // Fetch all reports in parallel
        const [
            salesTrend,
            orderTypeBreakdown,
            newCustomersTrend,
            categoryBreakdown,
            deliveryTimeOrders,
            cancellationRefunds,
            quantitySold,
        ] = await Promise.all([
            reportService.getSalesTrend(outletId, params),
            reportService.getOrderTypeBreakdown(outletId, params),
            reportService.getNewCustomersTrend(outletId, params),
            reportService.getCategoryBreakdown(outletId, params),
            reportService.getDeliveryTimeOrders(outletId, params),
            reportService.getCancellationRefunds(outletId, params),
            reportService.getQuantitySold(outletId, params),
        ]);

        return {
            salesTrend,
            orderTypeBreakdown,
            newCustomersTrend,
            categoryBreakdown,
            deliveryTimeOrders,
            cancellationRefunds,
            quantitySold,
        };
    },
};
