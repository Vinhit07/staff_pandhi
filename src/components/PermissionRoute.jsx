import { Navigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import { Card, CardContent, Button } from './ui';

export const PermissionRoute = ({ children, permission }) => {
    const { hasPermission, isAuthenticated, loading } = useAuth();

    // Show loader while checking auth status
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to={ROUTES.SIGNIN} replace />;
    }

    // Check permission
    if (permission && !hasPermission(permission)) {
        return (
            <div className="flex items-center justify-center h-full">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground mb-2">Access Restricted</h2>
                        <p className="text-muted-foreground mb-6">
                            You don't have permission to access this page.
                            Please contact your administrator.
                        </p>
                        <Button variant="secondary" onClick={() => window.history.back()}>
                            Go Back
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return children;
};

export default PermissionRoute;
