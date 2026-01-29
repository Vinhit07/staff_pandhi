import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './utils/constants';

// Layout
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PermissionRoute from './components/PermissionRoute';
import { PERMISSIONS } from './utils/constants';

// Auth Pages
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';

// Main Pages
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import ManualOrder from './pages/ManualOrder';
import OrderHistory from './pages/OrderHistory';
import Inventory from './pages/Inventory';
import Wallet from './pages/Wallet';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.SIGNIN} element={<SignIn />} />
            <Route path={ROUTES.SIGNUP} element={<SignUp />} />

            {/* Protected Routes */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                {/* Dashboard - accessible to all authenticated users */}
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Navigate to="/" replace />} />

                {/* App Orders (Notifications) - accessible to all */}
                <Route path="app-orders" element={<Notifications />} />

                {/* Manual Order - requires BILLING permission */}
                <Route
                    path="manual-order"
                    element={
                        <PermissionRoute permission={PERMISSIONS.BILLING}>
                            <ManualOrder />
                        </PermissionRoute>
                    }
                />

                {/* Order History - requires BILLING permission */}
                <Route
                    path="order-history"
                    element={
                        <PermissionRoute permission={PERMISSIONS.BILLING}>
                            <OrderHistory />
                        </PermissionRoute>
                    }
                />

                {/* Inventory - requires INVENTORY permission */}
                <Route
                    path="inventory"
                    element={
                        <PermissionRoute permission={PERMISSIONS.INVENTORY}>
                            <Inventory />
                        </PermissionRoute>
                    }
                />

                {/* Wallet - accessible to all */}
                <Route path="wallet" element={<Wallet />} />

                {/* Reports - requires REPORTS permission */}
                <Route
                    path="reports"
                    element={
                        <PermissionRoute permission={PERMISSIONS.REPORTS}>
                            <Reports />
                        </PermissionRoute>
                    }
                />

                {/* Settings - accessible to all */}
                <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
