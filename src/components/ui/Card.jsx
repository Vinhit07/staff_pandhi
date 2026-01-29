import { forwardRef } from 'react';

// Utility to merge class names
const cn = (...classes) => classes.filter(Boolean).join(' ');

const Card = forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-xl border bg-card text-card-foreground shadow",
            className
        )}
        {...props}
    />
));
Card.displayName = "Card";

const CardHeader = forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("font-semibold leading-none tracking-tight", className)}
        {...props}
    />
));
CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

const CardContent = forwardRef(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";

// Simple Card with title for backward compatibility
const SimpleCard = ({ title, headerAction, className = '', noPadding = false, children }) => {
    return (
        <Card className={className}>
            {title && (
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    {headerAction && <div>{headerAction}</div>}
                </CardHeader>
            )}
            <CardContent className={noPadding ? 'p-0' : ''}>
                {children}
            </CardContent>
        </Card>
    );
};

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, SimpleCard };
export default SimpleCard;
