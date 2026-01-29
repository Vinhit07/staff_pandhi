import { useMemo } from 'react';

/**
 * Custom hook to get outlet details from localStorage
 * @returns {Object} Outlet details and utility functions
 */
export const useOutletDetails = () => {
    const outletDetails = useMemo(() => {
        try {
            const stored = localStorage.getItem('outletDetails');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error parsing outlet details:', error);
            return null;
        }
    }, []);

    const outletId = outletDetails?.id || null;
    const outletName = outletDetails?.name || 'Unknown Outlet';
    const outletAddress = outletDetails?.address || '';

    const setOutletDetails = (details) => {
        localStorage.setItem('outletDetails', JSON.stringify(details));
    };

    const clearOutletDetails = () => {
        localStorage.removeItem('outletDetails');
    };

    return {
        outletDetails,
        outletId,
        outletName,
        outletAddress,
        setOutletDetails,
        clearOutletDetails,
    };
};

export default useOutletDetails;
