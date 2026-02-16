// useFetch Hook
// Generic hook for data fetching with loading, error, and data states

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for data fetching
 * @param {Function} fetchFn - Async function that fetches data
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Auto-fetch on mount (default: false)
 * @param {Array} options.dependencies - Dependencies to re-fetch (default: [])
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useFetch = (fetchFn, options = {}) => {
    const { autoFetch = false, dependencies = [] } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchFn();
            setData(result);
            return result;
        } catch (err) {
            setError(err.message || 'An error occurred');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [autoFetch, fetchData, ...dependencies]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
    };
};
