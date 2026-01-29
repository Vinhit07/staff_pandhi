import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import { Loader } from './ui/Loader';

/**
 * Protected route component - redirects to signin if not authenticated
 */
export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" text="Loading..." />
            </div>
        );
    }

    if (!isAuthenticated) {
        // Save the attempted URL for redirect after login
        return <Navigate to={ROUTES.SIGNIN} state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
