import { forwardRef } from 'react';

const Table = forwardRef(({ className = '', children, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
        <table
            ref={ref}
            className={`w-full caption-bottom text-sm ${className}`}
            {...props}
        >
            {children}
        </table>
    </div>
));
Table.displayName = 'Table';

const TableHeader = forwardRef(({ className = '', children, ...props }, ref) => (
    <thead ref={ref} className={`[&_tr]:border-b [&_tr]:border-border/40 ${className}`} {...props}>
        {children}
    </thead>
));
TableHeader.displayName = 'TableHeader';

const TableBody = forwardRef(({ className = '', children, ...props }, ref) => (
    <tbody
        ref={ref}
        className={`[&_tr:last-child]:border-0 ${className}`}
        {...props}
    >
        {children}
    </tbody>
));
TableBody.displayName = 'TableBody';

const TableFooter = forwardRef(({ className = '', children, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={`border-t bg-muted/50 font-medium [&>tr]:last:border-b-0 ${className}`}
        {...props}
    >
        {children}
    </tfoot>
));
TableFooter.displayName = 'TableFooter';

const TableRow = forwardRef(({ className = '', children, ...props }, ref) => (
    <tr
        ref={ref}
        className={`border-b border-border/30 transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
        {...props}
    >
        {children}
    </tr>
));
TableRow.displayName = 'TableRow';

const TableHead = forwardRef(({ className = '', children, ...props }, ref) => (
    <th
        ref={ref}
        className={`h-11 px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-wider text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${className}`}
        {...props}
    >
        {children}
    </th>
));
TableHead.displayName = 'TableHead';

const TableCell = forwardRef(({ className = '', children, ...props }, ref) => (
    <td
        ref={ref}
        className={`px-4 py-3.5 align-middle text-sm [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] ${className}`}
        {...props}
    >
        {children}
    </td>
));
TableCell.displayName = 'TableCell';

const TableCaption = forwardRef(({ className = '', children, ...props }, ref) => (
    <caption
        ref={ref}
        className={`mt-4 text-sm text-muted-foreground ${className}`}
        {...props}
    >
        {children}
    </caption>
));
TableCaption.displayName = 'TableCaption';

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
};
export default Table;
