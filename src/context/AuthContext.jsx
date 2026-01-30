// Authentication Context Provider
// Manages global authentication state with permissions and outlet data

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext();

// Action types
const ACTION_TYPES = {
    LOADING: 'LOADING',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    UPDATE_PERMISSIONS: 'UPDATE_PERMISSIONS',
    LOGOUT: 'LOGOUT',
    ERROR: 'ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer to manage auth state
const authReducer = (state, action) => {
    switch (action.type) {
        case ACTION_TYPES.LOADING:
            return { ...state, loading: true, error: null };

        case ACTION_TYPES.LOGIN_SUCCESS:
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload.user,
                outlet: action.payload.outlet,
                permissions: action.payload.permissions,
                error: null,
            };

        case ACTION_TYPES.UPDATE_PERMISSIONS:
            return {
                ...state,
                permissions: action.payload.permissions,
                user: action.payload.user,
            };

        case ACTION_TYPES.LOGOUT:
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                outlet: null,
                permissions: [],
                error: null,
            };

        case ACTION_TYPES.ERROR:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case ACTION_TYPES.CLEAR_ERROR:
            return { ...state, error: null };

        default:
            return state;
    }
};

// Initial state
const initialState = {
    isAuthenticated: false,
    user: null,
    outlet: null,
    permissions: [],
    loading: true,
    error: null,
};

/**
 * AuthProvider Component
 * Wraps the application to provide auth state and methods
 */
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Helper: Clear error
    const clearError = useCallback(() => {
        dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
    }, []);

    // Helper: Check if user has specific permission
    const hasPermission = useCallback((permissionType) => {
        return state.permissions.some(
            (perm) => perm.type === permissionType && perm.isGranted === true
        );
    }, [state.permissions]);

    // Helper: Get outlet details from localStorage
    const getStoredOutletDetails = useCallback(() => {
        try {
            const storedOutlet = localStorage.getItem('outletDetails');
            return storedOutlet ? JSON.parse(storedOutlet) : null;
        } catch (error) {
            console.error('Error parsing stored outlet details:', error);
            return null;
        }
    }, []);

    // Helper: Store outlet details in localStorage
    const storeOutletDetails = useCallback((outletData) => {
        try {
            localStorage.setItem('outletDetails', JSON.stringify(outletData));
        } catch (error) {
            console.error('Error storing outlet details:', error);
        }
    }, []);

    // Helper: Clear all stored data
    const clearStoredData = useCallback(() => {
        try {
            localStorage.removeItem('outletDetails');
            localStorage.removeItem('token');
        } catch (error) {
            console.error('Error clearing stored data:', error);
        }
    }, []);

    // Check auth status on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Check authentication status
    const checkAuthStatus = async () => {
        dispatch({ type: ACTION_TYPES.LOADING });
        try {
            const response = await authService.checkAuth();
            if (response && response.user) {
                const userData = {
                    user: response.user,
                    outlet: response.user.outlet,
                    permissions: response.user.staffDetails?.permissions || [],
                };

                // Store outlet details in localStorage
                if (response.user.outlet) {
                    storeOutletDetails(response.user.outlet);
                }

                dispatch({ type: ACTION_TYPES.LOGIN_SUCCESS, payload: userData });
            } else {
                clearStoredData();
                dispatch({ type: ACTION_TYPES.LOGOUT });
            }
        } catch (error) {
            clearStoredData();
            dispatch({ type: ACTION_TYPES.LOGOUT });
        }
    };

    // Refresh permissions without full re-authentication
    const refreshPermissions = useCallback(async () => {
        if (!state.isAuthenticated) return;

        try {
            const response = await authService.checkAuth();
            if (response && response.user) {
                const userData = {
                    user: response.user,
                    permissions: response.user.staffDetails?.permissions || [],
                };
                dispatch({ type: ACTION_TYPES.UPDATE_PERMISSIONS, payload: userData });
            }
        } catch (error) {
            console.error('Error refreshing permissions:', error);
        }
    }, [state.isAuthenticated]);

    // Sign up
    const signUp = async (userData) => {
        dispatch({ type: ACTION_TYPES.LOADING });
        try {
            // Clear any existing data first
            clearStoredData();

            const response = await authService.signUp(userData);
            const loginData = {
                user: response.user,
                outlet: response.user.outlet,
                permissions: response.user.staffDetails?.permissions || [],
            };

            // Store outlet details in localStorage
            if (response.user.outlet) {
                storeOutletDetails(response.user.outlet);
            }

            // Note: Don't auto-login on signup - let user signin separately

            return response;
        } catch (error) {
            dispatch({ type: ACTION_TYPES.ERROR, payload: error.message });
            throw error;
        }
    };

    // Sign in
    const signIn = async (credentials) => {
        dispatch({ type: ACTION_TYPES.LOADING });
        try {
            // Clear any existing data first
            clearStoredData();

            const response = await authService.signIn(credentials);
            console.log('SignIn success:', response);

            const loginData = {
                user: response.user,
                outlet: response.user.outlet,
                permissions: response.user.staffDetails?.permissions || [],
            };

            // Store outlet details in localStorage
            if (response.user.outlet) {
                storeOutletDetails(response.user.outlet);
                console.log('Outlet details stored in localStorage:', response.user.outlet);
            }

            dispatch({ type: ACTION_TYPES.LOGIN_SUCCESS, payload: loginData });
            return response;
        } catch (error) {
            console.error('SignIn error:', error);
            dispatch({ type: ACTION_TYPES.ERROR, payload: error.message });
            throw error;
        }
    };

    // Sign out
    const signOut = async () => {
        dispatch({ type: ACTION_TYPES.LOADING });
        try {
            await authService.signOut();
            // Clear all stored data
            clearStoredData();
            dispatch({ type: ACTION_TYPES.LOGOUT });
        } catch (error) {
            dispatch({ type: ACTION_TYPES.ERROR, payload: error.message });
            // Clear stored data even if signout fails
            clearStoredData();
            dispatch({ type: ACTION_TYPES.LOGOUT });
        }
    };

    const value = {
        ...state,
        signUp,
        signIn,
        signOut,
        clearError,
        hasPermission,
        getStoredOutletDetails,
        refreshPermissions,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Custom hook to use auth context
 * Must be used within AuthProvider
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { AuthContext };
