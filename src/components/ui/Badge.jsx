const badgeVariants = {
    default: 'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
    outline: 'text-foreground',
    success: 'border-transparent bg-green-500 text-white',
    warning: 'border-transparent bg-amber-500 text-white',
    info: 'border-transparent bg-blue-500 text-white',
};

export const Badge = ({
    variant = 'default',
    size = 'md',
    className = '',
    children
}) => {
    const baseClasses = `inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold 
    transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`;

    const variantClasses = badgeVariants[variant] || badgeVariants.default;

    const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

    return (
        <div className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}>
            {children}
        </div>
    );
};

export { badgeVariants };
export default Badge;
