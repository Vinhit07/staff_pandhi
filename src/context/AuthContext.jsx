import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

// Mock user data for demo purposes
const MOCK_USER = {
    id: 1,
    name: 'John Staff',
    email: 'staff@hungerbox.com',
    designation: 'Staff Member',
    phone: '+91 9876543210',
    imageUrl: null,
    outlet: {
        id: 1,
        name: 'Main Cafeteria',
        address: 'Building A, Ground Floor',
    },
    staffDetails: {
        permissions: [
            { type: 'BILLING', isGranted: true },
            { type: 'INVENTORY', isGranted: true },
            { type: 'REPORTS', isGranted: true },
        ],
    },
};

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [outlet, setOutlet] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check for existing session on mount
    useEffect(() => {
        const initAuth = () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const storedOutlet = localStorage.getItem('outletDetails');

            if (token && storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    const outletData = storedOutlet ? JSON.parse(storedOutlet) : null;

                    setUser(userData);
                    setOutlet(outletData || userData.outlet);
                    setPermissions(userData.staffDetails?.permissions || []);
                    setIsAuthenticated(true);
                } catch (e) {
                    console.error('Error parsing stored auth data:', e);
                    clearAuth();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const clearAuth = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('outletDetails');
        setUser(null);
        setOutlet(null);
        setPermissions([]);
        setIsAuthenticated(false);
        setError(null);
    }, []);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            // Mock authentication - in production, call API
            // const response = await authService.signIn(email, password);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Mock validation
            if (email === 'staff@hungerbox.com' && password === 'password') {
                const userData = { ...MOCK_USER, email };
                const token = 'mock-jwt-token-' + Date.now();

                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('outletDetails', JSON.stringify(userData.outlet));

                setUser(userData);
                setOutlet(userData.outlet);
                setPermissions(userData.staffDetails?.permissions || []);
                setIsAuthenticated(true);

                return { success: true, user: userData };
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const signup = useCallback(async (name, email, password, outletCode) => {
        setLoading(true);
        setError(null);

        try {
            // Mock registration - in production, call API
            await new Promise(resolve => setTimeout(resolve, 800));

            // Mock validation
            if (outletCode !== 'OUTLET001') {
                throw new Error('Invalid outlet code');
            }

            return { success: true, message: 'Registration successful! Please sign in.' };
        } catch (err) {
            setError(err.message);
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        clearAuth();
    }, [clearAuth]);

    const hasPermission = useCallback((permissionType) => {
        return permissions.some(
            perm => perm.type === permissionType && perm.isGranted === true
        );
    }, [permissions]);

    const updateProfile = useCallback(async (profileData) => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            const updatedUser = { ...user, ...profileData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));

            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        } finally {
            setLoading(false);
        }
    }, [user]);

    const value = {
        user,
        outlet,
        permissions,
        isAuthenticated,
        loading,
        error,
        login,
        signup,
        logout,
        hasPermission,
        updateProfile,
        clearError: () => setError(null),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
