import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import { ThemeToggle } from './ThemeToggle';

// Map routes to page titles
const pageTitles = {
    [ROUTES.DASHBOARD]: 'Dashboard',
    [ROUTES.APP_ORDERS]: 'App Orders',
    [ROUTES.MANUAL_ORDER]: 'Manual Order',
    [ROUTES.ORDER_HISTORY]: 'Order History',
    [ROUTES.INVENTORY]: 'Inventory',
    [ROUTES.WALLET]: 'Wallet',
    [ROUTES.REPORTS]: 'Reports',
    [ROUTES.SETTINGS]: 'Settings',
};

export const Header = () => {
    const location = useLocation();
    const { user } = useAuth();

    const currentPageTitle = pageTitles[location.pathname] || 'Dashboard';

    // Get initials from user name
    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="px-6 py-4 flex items-center justify-between">
            {/* Logo Section - Pill shaped */}
            <div className="header-pill">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-lg">H</span>
                </div>
                <div>
                    <h1 className="font-bold text-foreground text-lg">HungerBox Staff</h1>
                </div>
            </div>

            {/* Page Title in Center - Pill shaped */}
            <div className="header-pill">
                <div className="flex-1 flex justify-center">
                    <h2 className="text-xl font-semibold text-foreground">{currentPageTitle}</h2>
                </div>
            </div>

            {/* User Section - Pill shaped */}
            <div className="header-pill">
                <ThemeToggle />
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{user?.name || 'Staff User'}</p>
                        <p className="text-xs text-muted-foreground">{user?.designation || 'Staff Member'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        {user?.imageUrl ? (
                            <img
                                src={user.imageUrl}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-primary-foreground font-medium">
                                {getInitials(user?.name)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
