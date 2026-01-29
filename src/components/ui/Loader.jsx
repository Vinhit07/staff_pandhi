export const Loader = ({ size = 'md', text = '', fullScreen = false }) => {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-2',
        lg: 'h-12 w-12 border-3',
    };

    const spinner = (
        <div className="flex flex-col items-center gap-3">
            <div
                className={`
          animate-spin rounded-full 
          border-muted border-t-primary
          ${sizeClasses[size] || sizeClasses.md}
        `}
            />
            {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
};

export default Loader;
