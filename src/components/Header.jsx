import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';

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
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);

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

    // Handle logout
    const handleLogout = async (e) => {
        e.stopPropagation();
        setShowDropdown(false);
        try {
            await signOut();
            navigate('/signin');
        } catch (error) {
            console.error('Logout error:', error);
        }
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
            <div className="header-pill relative">
                <ThemeToggle />
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => setShowDropdown(!showDropdown)}
                >
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
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowDropdown(false)}
                        />
                        <div className="absolute right-0 top-full mt-2 w-48 bg-background border-2 border-border rounded-xl shadow-lg z-50">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors rounded-xl"
                            >
                                <LogOut className="h-4 w-4 text-destructive" />
                                <span className="text-sm font-medium text-destructive">Logout</span>
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};

export default Header;
