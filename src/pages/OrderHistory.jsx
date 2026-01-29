import { useState } from 'react';
import { Search, Download, Calendar, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Modal } from '../components/ui';
import { formatCurrency, formatDate, formatDateTime } from '../utils/constants';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

// Mock data
const MOCK_ORDERS = [
    { id: '1001', customer: 'Rahul Sharma', date: '2026-01-28T10:30:00', items: [{ name: 'Butter Chicken', qty: 1, price: 250 }], total: 250, status: 'DELIVERED', paymentMethod: 'CASH' },
    { id: '1002', customer: 'Priya Patel', date: '2026-01-28T11:15:00', items: [{ name: 'Veg Thali', qty: 2, price: 240 }], total: 240, status: 'DELIVERED', paymentMethod: 'UPI' },
    { id: '1003', customer: 'Amit Kumar', date: '2026-01-27T12:00:00', items: [{ name: 'Biryani', qty: 1, price: 180 }], total: 180, status: 'CANCELLED', paymentMethod: 'CARD' },
    { id: '1004', customer: 'Sneha Reddy', date: '2026-01-27T09:45:00', items: [{ name: 'Samosa', qty: 4, price: 80 }], total: 80, status: 'DELIVERED', paymentMethod: 'CASH' },
    { id: '1005', customer: 'Vikram Singh', date: '2026-01-26T14:20:00', items: [{ name: 'Cold Coffee', qty: 2, price: 180 }], total: 180, status: 'DELIVERED', paymentMethod: 'UPI' },
];

export const OrderHistory = () => {
    const [orders] = useState(MOCK_ORDERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));

    // Details modal
    const [detailsModal, setDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filter orders
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.includes(searchTerm) ||
            order.customer.toLowerCase().includes(searchTerm.toLowerCase());
        const orderDate = dayjs(order.date);
        const matchesDate = orderDate.isAfter(dayjs(fromDate).subtract(1, 'day')) &&
            orderDate.isBefore(dayjs(toDate).add(1, 'day'));
        return matchesSearch && matchesDate;
    });

    // Export to Excel
    const handleExport = () => {
        const data = filteredOrders.map(order => ({
            'Order ID': order.id,
            'Customer': order.customer,
            'Date': formatDateTime(order.date),
            'Items': order.items.map(i => `${i.name} x${i.qty}`).join(', '),
            'Total': order.total,
            'Status': order.status,
            'Payment': order.paymentMethod,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Orders');
        XLSX.writeFile(wb, `Orders_${fromDate}_to_${toDate}.xlsx`);
        toast.success('Excel file downloaded');
    };

    // View order details
    const viewDetails = (order) => {
        setSelectedOrder(order);
        setDetailsModal(true);
    };

    // Status badge variant
    const getStatusVariant = (status) => {
        switch (status) {
            case 'DELIVERED': return 'success';
            case 'CANCELLED': return 'destructive';
            case 'PENDING': return 'warning';
            default: return 'default';
        }
    };

    // Quick date selections
    const setQuickDate = (days) => {
        setToDate(dayjs().format('YYYY-MM-DD'));
        setFromDate(dayjs().subtract(days, 'day').format('YYYY-MM-DD'));
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Order History</h1>
                    <p className="text-muted-foreground">View and export past orders</p>
                </div>
                <Button onClick={handleExport}>
                    <Download className="h-4 w-4" />
                    Export Excel
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by Order ID or Customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-input rounded-lg bg-background text-foreground 
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        {/* Quick Date Buttons */}
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setQuickDate(1)}>Today</Button>
                            <Button size="sm" variant="outline" onClick={() => setQuickDate(7)}>7 Days</Button>
                            <Button size="sm" variant="outline" onClick={() => setQuickDate(30)}>30 Days</Button>
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="px-3 py-2 border-2 border-input rounded-lg text-sm bg-background text-foreground 
                  focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <span className="text-muted-foreground">to</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="px-3 py-2 border-2 border-input rounded-lg text-sm bg-background text-foreground 
                  focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map(order => (
                                        <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">#{order.id}</td>
                                            <td className="px-4 py-3 text-foreground">{order.customer}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{formatDateTime(order.date)}</td>
                                            <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(order.total)}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Button size="sm" variant="ghost" onClick={() => viewDetails(order)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center text-muted-foreground">
                                            No orders found for the selected criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Order Details Modal */}
            <Modal
                isOpen={detailsModal}
                onClose={() => setDetailsModal(false)}
                title={`Order #${selectedOrder?.id}`}
            >
                {selectedOrder && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Customer</p>
                                <p className="font-medium text-foreground">{selectedOrder.customer}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-medium text-foreground">{formatDateTime(selectedOrder.date)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Payment Method</p>
                                <p className="font-medium text-foreground">{selectedOrder.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant={getStatusVariant(selectedOrder.status)}>{selectedOrder.status}</Badge>
                            </div>
                        </div>

                        <div className="border-t border-border pt-4">
                            <p className="font-medium text-foreground mb-2">Items</p>
                            <div className="space-y-2">
                                {selectedOrder.items.map((item, i) => (
                                    <div key={i} className="flex justify-between p-2 bg-muted/50 rounded-lg">
                                        <span className="text-foreground">{item.name} x{item.qty}</span>
                                        <span className="font-medium text-foreground">{formatCurrency(item.price)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-border">
                            <span className="text-lg font-bold text-foreground">Total</span>
                            <span className="text-2xl font-bold text-primary">{formatCurrency(selectedOrder.total)}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrderHistory;
