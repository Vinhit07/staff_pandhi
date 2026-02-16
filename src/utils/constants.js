// Route constants for navigation
export const ROUTES = {
    HOME: '/',
    SIGNIN: '/signin',
    SIGNUP: '/signup',
    DASHBOARD: '/',
    APP_ORDERS: '/app-orders',
    MANUAL_ORDER: '/manual-order',
    ORDER_HISTORY: '/order-history',
    INVENTORY: '/inventory',
    WALLET: '/wallet',
    REPORTS: '/reports',
    SETTINGS: '/settings',
};

// Permission types
export const PERMISSIONS = {
    BILLING: 'BILLING',
    INVENTORY: 'INVENTORY',
    REPORTS: 'REPORTS',
};

// Order statuses
export const ORDER_STATUS = {
    PENDING: 'PENDING',
    DELIVERED: 'DELIVERED',
    CANCELLED: 'CANCELLED',
    PARTIALLY_DELIVERED: 'PARTIALLY_DELIVERED',
    COMPLETED: 'COMPLETED',
};

// Order types
export const ORDER_TYPE = {
    MANUAL: 'MANUAL',
    APP: 'APP',
};

// Payment methods
export const PAYMENT_METHODS = {
    CASH: 'CASH',
    CARD: 'CARD',
    UPI: 'UPI',
};

// Product categories
export const CATEGORIES = ['All', 'Meals', 'Starters', 'Desserts', 'Beverages', 'SpecialFoods'];

// Delivery slot formatting
export const formatDeliverySlot = (slot) => {
    if (!slot) return 'N/A';
    // Input: "SLOT_11_12" -> Output: "11 AM - 12 PM"
    const match = slot.match(/SLOT_(\d+)_(\d+)/);
    if (!match) return slot;

    const [, startHour, endHour] = match;
    const formatHour = (hour) => {
        const h = parseInt(hour);
        if (h === 0 || h === 12) return `12 ${h === 0 ? 'AM' : 'PM'}`;
        if (h < 12) return `${h} AM`;
        return `${h - 12} PM`;
    };

    return `${formatHour(startHour)} - ${formatHour(endHour)}`;
};

// Format currency
export const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
};

// Format date
export const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
    });
};

// Format datetime
export const formatDateTime = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
    });
};
