import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Clock } from 'lucide-react';
import { Utensils } from 'lucide-react';
import dayjs from 'dayjs';

export const Header = () => {
    const { user } = useAuth();
    const [currentTime, setCurrentTime] = useState(dayjs().format('hh:mm:ss A'));

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(dayjs().format('hh:mm:ss A'));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        /* ADDED: flex, justify-between, items-center, w-full, and padding */
        <header className="main-header flex items-center justify-between w-full px-6 py-3 border-b border-border bg-card select-none">
            
            {/* Left: Logo + Cafeteria */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30">
                    <Utensils className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    UPS Cafe
                </h1>
            </div>

            {/* Right: Time + Staff Name */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-lg border border-border">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-mono tabular-nums text-foreground">
                        {currentTime}
                    </span>
                </div>

                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Current Staff
                    </span>
                    <span className="text-sm font-bold text-foreground">
                        {user?.name || 'staff1'}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default Header;
