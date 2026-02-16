import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Tooltip component that renders via a portal so it's never clipped
 * by parent overflow. Positions itself relative to the trigger element.
 */
export const Tooltip = ({ children, content, side = 'right' }) => {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);

    useEffect(() => {
        if (visible && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            if (side === 'right') {
                setPosition({
                    top: rect.top + rect.height / 2,
                    left: rect.right + 8,
                });
            } else if (side === 'bottom') {
                setPosition({
                    top: rect.bottom + 8,
                    left: rect.left + rect.width / 2,
                });
            }
        }
    }, [visible, side]);

    return (
        <div
            ref={triggerRef}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
        >
            {children}
            {visible &&
                content &&
                createPortal(
                    <div
                        className="fixed z-[9999] whitespace-nowrap rounded-md border bg-popover px-3 py-1.5 text-sm font-semibold text-popover-foreground shadow-md pointer-events-none"
                        style={
                            side === 'right'
                                ? {
                                    top: position.top,
                                    left: position.left,
                                    transform: 'translateY(-50%)',
                                }
                                : {
                                    top: position.top,
                                    left: position.left,
                                    transform: 'translateX(-50%)',
                                }
                        }
                    >
                        {content}
                    </div>,
                    document.body
                )}
        </div>
    );
};

export default Tooltip;
