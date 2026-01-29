import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Bell,
    PlusCircle,
    Clock,
    Package,
    Wallet,
    BarChart3,
    Settings,
    LogOut,
    Lock,
    Info,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES, PERMISSIONS } from '../utils/constants';

const menuItems = [
    {
        path: ROUTES.DASHBOARD,
        label: 'Dashboard',
        icon: LayoutDashboard,
        permission: null
    },
    {
        path: ROUTES.APP_ORDERS,
        label: 'App Orders',
        icon: Bell,
        permission: null
    },
    {
        path: ROUTES.MANUAL_ORDER,
        label: 'Manual Order',
        icon: PlusCircle,
        permission: PERMISSIONS.BILLING
    },
    {
        path: ROUTES.ORDER_HISTORY,
        label: 'Order History',
        icon: Clock,
        permission: PERMISSIONS.BILLING
    },
    {
        path: ROUTES.INVENTORY,
        label: 'Inventory',
        icon: Package,
        permission: PERMISSIONS.INVENTORY
    },
    {
        path: ROUTES.WALLET,
        label: 'Wallet',
        icon: Wallet,
        permission: null
    },
    {
        path: ROUTES.REPORTS,
        label: 'Reports',
        icon: BarChart3,
        permission: PERMISSIONS.REPORTS
    },
    {
        path: ROUTES.SETTINGS,
        label: 'Settings',
        icon: Settings,
        permission: null
    },
];

export const Sidebar = () => {
    const { hasPermission, logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate(ROUTES.SIGNIN);
    };

    return (
        <aside className="flex flex-col items-center justify-between p-4 h-screen sticky top-0 gap-4">
            {/* First pill - Navigation icons */}
            <div className="sidebar-pill">
                <nav className="flex flex-col items-center gap-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const hasAccess = !item.permission || hasPermission(item.permission);

                        return (
                            <NavLink
                                key={item.path}
                                to={hasAccess ? item.path : '#'}
                                title={item.label}
                                onClick={(e) => !hasAccess && e.preventDefault()}
                                className={({ isActive }) => `
                  sidebar-icon
                  ${isActive && hasAccess
                                        ? 'sidebar-icon-active'
                                        : hasAccess
                                            ? 'sidebar-icon-inactive'
                                            : 'text-muted-foreground cursor-not-allowed opacity-50'
                                    }
                `}
                            >
                                {hasAccess ? (
                                    <Icon size={22} />
                                ) : (
                                    <Lock size={18} />
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* Second pill - Utility icons (Info and Logout) */}
            <div className="bg-sidebar border-2 border-sidebar-border rounded-full flex flex-col items-center py-4 px-3 shadow-lg gap-3">
                <button
                    title="Info"
                    className="sidebar-icon sidebar-icon-inactive"
                >
                    <Info size={22} />
                </button>
                <button
                    title="Logout"
                    onClick={handleLogout}
                    className="sidebar-icon text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground hover:scale-110 transition-all duration-200"
                >
                    <LogOut size={22} />
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
