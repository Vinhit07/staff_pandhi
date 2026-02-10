// Application Constants
// Centralized location for routes, API endpoints, and permission types

/**
 * Frontend route paths
 */
export const ROUTES = {
    SIGN_IN: '/signin',
    SIGN_UP: '/signup',
    DASHBOARD: '/',
    NOTIFICATIONS: '/notifications',
    MANUAL_ORDER: '/manual-order',
    INVENTORY: '/inventory',
    WALLET: '/wallet',
    REPORTS: '/reports',
    SETTINGS: '/settings',
};

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
    // Authentication
    SIGN_UP: '/auth/staff-signup',
    SIGN_IN: '/auth/staff-signin',
    SIGN_OUT: '/auth/signout',
    CHECK_AUTH: '/auth/me',

    // Home & Dashboard
    HOME_DATA: '/staff/outlets/get-home-data/',
    RECENT_ORDERS: '/staff/outlets/get-recent-orders',
    GET_ORDER: '/staff/outlets/get-order',
    UPDATE_ORDER: '/staff/outlets/update-order/',
    TICKETS_COUNT: '/staff/tickets/count/',

    // Orders
    ADD_MANUAL_ORDER: '/staff/outlets/add-manual-order/',
    ORDER_HISTORY: '/staff/outlets/get-order-history/',
    ORDER_DATES: '/staff/outlets/get-orderdates',

    // Inventory
    GET_STOCKS: '/staff/outlets/get-stocks',
    GET_PRODUCTS_IN_STOCK: '/staff/outlets/get-products-in-stock',
    ADD_STOCK: '/staff/outlets/add-stock/',
    DEDUCT_STOCK: '/staff/outlets/deduct-stock/',
    STOCK_HISTORY: '/staff/outlets/get-stock-history',

    // Notifications
    CURRENT_ORDER: '/staff/outlets/get-current-order/',

    // Wallet
    RECHARGE_HISTORY: '/staff/outlets/get-recharge-history',
    RECHARGE_WALLET: '/staff/outlets/recharge-wallet/',

    // Reports
    SALES_TREND: '/staff/outlets/sales-trend',
    ORDER_TYPE_BREAKDOWN: '/staff/outlets/order-type-breakdown',
    NEW_CUSTOMERS_TREND: '/staff/outlets/new-customers-trend',
    CATEGORY_BREAKDOWN: '/staff/outlets/category-breakdown',
    DELIVERY_TIME_ORDERS: '/staff/outlets/delivery-time-orders',
    CANCELLATION_REFUNDS: '/staff/outlets/cancellation-refunds',
    QUANTITY_SOLD: '/staff/outlets/quantity-sold',

    // Profile
    GET_PROFILE: '/staff/profile/',
    UPDATE_PROFILE: '/staff/profile/',
    UPLOAD_IMAGE: '/staff/profile/upload-image/',
    DELETE_IMAGE: '/staff/profile/delete-image/',

    // Security
    CHANGE_PASSWORD: '/staff/security/change-password/',
    GET_2FA_STATUS: '/staff/security/2fa-status/',
    GENERATE_2FA: '/staff/security/generate-2fa/',
    ENABLE_2FA: '/staff/security/enable-2fa/',
    DISABLE_2FA: '/staff/security/disable-2fa/',
    BACKUP_CODES_COUNT: '/staff/security/backup-codes-count/',
};

/**
 * Permission types for role-based access control
 */
export const PERMISSIONS = {
    VIEW_ORDERS: 'VIEW_ORDERS',
    MANAGE_ORDERS: 'MANAGE_ORDERS',
    VIEW_INVENTORY: 'VIEW_INVENTORY',
    MANAGE_INVENTORY: 'MANAGE_INVENTORY',
    VIEW_WALLET: 'VIEW_WALLET',
    MANAGE_WALLET: 'MANAGE_WALLET',
    VIEW_REPORTS: 'VIEW_REPORTS',
    MANAGE_STAFF: 'MANAGE_STAFF',
};

/**
 * Order status types
 */
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    PREPARING: 'PREPARING',
    READY: 'READY',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
};
