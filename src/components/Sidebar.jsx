import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
    ChevronLeft,
    ChevronRight,
    User
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROUTES, PERMISSIONS } from '../utils/constants';
import { ThemeToggle } from './ThemeToggle';
import { Tooltip } from './ui/Tooltip';

const menuItems = [
    {
        path: ROUTES.DASHBOARD,
        label: 'Dashboard',
        icon: LayoutDashboard,
        permission: null,
    },
    {
        path: ROUTES.APP_ORDERS,
        label: 'App Orders',
        icon: Bell,
        permission: null,
    },
    {
        path: ROUTES.MANUAL_ORDER,
        label: 'Manual Order',
        icon: PlusCircle,
        permission: PERMISSIONS.BILLING,
    },
    {
        path: ROUTES.ORDER_HISTORY,
        label: 'Order History',
        icon: Clock,
        permission: PERMISSIONS.BILLING,
    },
    {
        path: ROUTES.INVENTORY,
        label: 'Inventory',
        icon: Package,
        permission: PERMISSIONS.INVENTORY,
    },
    {
        path: ROUTES.WALLET,
        label: 'Wallet',
        icon: Wallet,
        permission: null,
    },
    {
        path: ROUTES.REPORTS,
        label: 'Reports',
        icon: BarChart3,
        permission: PERMISSIONS.REPORTS,
    },
    {
        path: ROUTES.SETTINGS,
        label: 'Settings',
        icon: Settings,
        permission: null,
    },
];

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const { hasPermission, signOut, user, refreshPermissions } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Refresh permissions when route changes
    useEffect(() => {
        if (refreshPermissions) {
            refreshPermissions();
        }
    }, [location.pathname, refreshPermissions]);

    const handleLogout = async () => {
        try {
            await signOut();
            navigate(ROUTES.SIGNIN);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <aside
            className={`${isCollapsed ? 'w-20' : 'w-64'
                } flex flex-col h-full bg-card border-r-2 border-border/50 shadow-lg transition-all duration-300 z-40`}
        >
            {/* Header / Brand */}
            <div
                className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'
                    } border-b border-border/50 h-16`}
            >
                {!isCollapsed && (
                    <div className="flex items-center gap-2 font-bold text-primary truncate">
                        <User size={24} />
                        <span className="text-lg">Staff Panel</span>
                    </div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                >
                    {isCollapsed ? (
                        <ChevronRight size={18} />
                    ) : (
                        <ChevronLeft size={18} />
                    )}
                </button>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const hasAccess =
                        !item.permission || hasPermission(item.permission);
                    const isActive =
                        location.pathname === item.path ||
                        (item.path !== '/' &&
                            location.pathname.startsWith(item.path));

                    const linkContent = (
                        <NavLink
                            key={item.path}
                            to={hasAccess ? item.path : '#'}
                            onClick={(e) => !hasAccess && e.preventDefault()}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''
                                } ${isActive && hasAccess
                                    ? 'bg-primary text-primary-foreground shadow-md font-semibold'
                                    : hasAccess
                                        ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        : 'text-muted-foreground cursor-not-allowed opacity-50'
                                }`}
                        >
                            <span
                                className={`shrink-0 transition-transform duration-200 ${isActive && hasAccess
                                    ? 'scale-110'
                                    : 'group-hover:scale-110'
                                    }`}
                            >
                                {hasAccess ? (
                                    <Icon size={20} />
                                ) : (
                                    <Lock size={18} />
                                )}
                            </span>
                            {!isCollapsed && (
                                <span className="text-sm truncate">
                                    {item.label}
                                </span>
                            )}
                        </NavLink>
                    );

                    if (isCollapsed) {
                        return (
                            <Tooltip
                                key={item.path}
                                content={item.label}
                                side="right"
                            >
                                {linkContent}
                            </Tooltip>
                        );
                    }

                    return (
                        <div key={item.path}>{linkContent}</div>
                    );
                })}
            </nav>

            {/* Footer — Theme toggle + Logout */}
            <div className="px-3 py-2 border-t border-border/50 bg-muted/30 flex flex-col gap-2">
                <div
                    className={`flex flex-col gap-2 ${isCollapsed ? 'items-center' : ''
                        }`}
                >
                    {/* Theme Toggle */}
                    <div
                        className={`flex items-center gap-2 ${isCollapsed
                            ? 'flex-col'
                            : 'justify-between w-full'
                            }`}
                    >
                        {isCollapsed ? (
                            <ThemeToggle />
                        ) : (
                            <div className="flex items-center justify-between w-full bg-muted/50 p-1 rounded-xl border border-border/50">
                                <span className="text-xs font-medium ml-2 text-muted-foreground">
                                    Dark mode
                                </span>
                                <ThemeToggle />
                            </div>
                        )}
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 ${isCollapsed
                            ? 'w-10 h-10 justify-center'
                            : 'w-full text-sm font-semibold'
                            }`}
                        title="Logout"
                    >
                        <LogOut size={18} />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
