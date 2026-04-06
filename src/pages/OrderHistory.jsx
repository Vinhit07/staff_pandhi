import { useState, useEffect } from 'react';
import { Search, Download, Calendar, Eye, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Modal } from '../components/ui';
import { formatCurrency, formatDate, formatDateTime } from '../utils/constants';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services';

export const OrderHistory = () => {
    const { outlet } = useAuth();
    const outletId = outlet?.id;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [fromDate, setFromDate] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));

    // Details modal
    const [detailsModal, setDetailsModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedFilter, setSelectedFilter] = useState('0');
    // Fetch ALL order history once on mount
    useEffect(() => {
        fetchAllOrders();
    }, [outletId]);

    const fetchAllOrders = async () => {
        if (!outletId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // Fetch last 90 days of orders (or adjust as needed for your use case)
            const ninetyDaysAgo = dayjs.utc().subtract(90, 'day').format('YYYY-MM-DD');
            const tomorrow = dayjs.utc().add(1, 'day').format('YYYY-MM-DD');

            const data = await orderService.getOrderHistory({
                outletId,
                from: ninetyDaysAgo,
                to: tomorrow,
            });
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Error fetching order history:', error);
            toast.error('Failed to load order history');
        } finally {
            setLoading(false);
        }
    };

    // Filter orders based on search term AND date filter (frontend only)
    const filteredOrders = orders.filter(order => {
        // Apply search filter
        const matchesSearch =
            order.orderNumber?.toString().includes(searchTerm) ||
            order.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

        // Apply date filter
        const orderDate = dayjs.utc(order.createdAt);
        const today = dayjs.utc();
        let matchesDate = true;

        if (selectedFilter === '0') {
            // Today only:
            // 1. Created today (and not a future preorder)
            // 2. OR Delivery date is today (regardless of creation date)
            const delivery = order.deliveryDate ? dayjs.utc(order.deliveryDate) : null;

            const createdToday = orderDate.isSame(today, 'day');
            const isDeliveryToday = delivery ? delivery.isSame(today, 'day') : false;
            const isFuturePreorder = delivery ? delivery.isAfter(today, 'day') : false;

            matchesDate = isDeliveryToday || (createdToday && !isFuturePreorder);
        }
        /* else if (selectedFilter === '7') {
            // Last 7 days
            matchesDate = orderDate.isAfter(today.subtract(7, 'day'));
        } */
        else if (selectedFilter === '30') {
            // Last 30 days
            matchesDate = orderDate.isAfter(today.subtract(30, 'day'));
        } else if (selectedFilter === 'preorder') {
            // Future delivery dates (pre-orders)
            const delivery = order.deliveryDate ? dayjs.utc(order.deliveryDate) : null;
            matchesDate = delivery ? delivery.isAfter(today, 'day') : false;
        }

        return matchesSearch && matchesDate;
    });

    // Export to Excel
    const handleExport = () => {
        const data = filteredOrders.map(order => ({
            'Order ID': order.orderNumber,
            'Customer': order.customerName,
            'Date': formatDateTime(order.createdAt),
            'Total': order.totalAmount,
            'Status': order.status,
            'Payment': order.paymentMethod,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Orders');

        const filterLabel = selectedFilter === '0' ? 'Today' : selectedFilter === '7' ? '7Days' : '30Days';
        XLSX.writeFile(wb, `Orders_${filterLabel}_${dayjs().format('YYYY-MM-DD')}.xlsx`);
        toast.success('Excel file downloaded');
    };

    // View order details
    const viewDetails = (order) => {
        setSelectedOrder(order);
        setDetailsModal(true);
    };

    // Status badge variant
    const getStatusVariant = (status) => {
        switch (status?.toUpperCase()) {
            case 'DELIVERED': case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'destructive';
            case 'PENDING': case 'PREPARING': return 'warning';
            default: return 'default';
        }
    };

    // Quick date selections (now just updates the filter state)
    const setQuickDate = (days) => {
        setSelectedFilter(days.toString());
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
                    <Button
                        size="sm"
                        variant={selectedFilter === '0' ? 'default' : 'outline'}
                        onClick={() => setQuickDate(0)}
                    >
                        Today
                    </Button>
                    <Button
                        size="sm"
                        variant={selectedFilter === 'preorder' ? 'default' : 'outline'}
                        onClick={() => setQuickDate('preorder')}
                    >
                        Preorder
                    </Button>

                    {/* <Button
                        size="sm"
                        variant={selectedFilter === '7' ? 'default' : 'outline'}
                        onClick={() => setQuickDate(7)}
                    >
                        7 Days
                    </Button> */}
                    {/* <Button
                        size="sm"
                        variant={selectedFilter === '30' ? 'default' : 'outline'}
                        onClick={() => setQuickDate(30)}
                    >
                        30 Days
                    </Button> */}
                </div>
            </div>

            {/* Orders Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <div className="overflow-y-auto" />
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-4 py-8 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground inline" />
                                        </td>
                                    </tr>
                                ) : filteredOrders.length > 0 ? (
                                    filteredOrders.map(order => (
                                        <tr key={order.id} className=" hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-sm">{order.orderNumber}</td>
                                            <td className="px-4 py-3 text-sm">{order.customerName}</td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {selectedFilter === 'preorder'
                                                    ? `Delivery: ${dayjs(order.deliveryDate).format('MMM D, YYYY')}`
                                                    : formatDateTime(order.createdAt)}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(order.totalAmount)}</td>
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
                title={`Order #${selectedOrder?.orderNumber?.replace(/\D/g, '') || selectedOrder?.id}`}
            >
                {selectedOrder && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Customer</p>
                                <p className="font-medium text-foreground">{selectedOrder.customerName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-medium text-foreground">{formatDateTime(selectedOrder.createdAt)}</p>
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
                                {selectedOrder.items?.map((item, i) => (
                                    <div key={`${selectedOrder.id}-item-${i}`} className="flex justify-between p-2 bg-muted/50 rounded-lg">
                                        <span className="text-foreground">{item.name || item.productName} x{item.quantity}</span>
                                        <span className="font-medium text-foreground">{formatCurrency(item.unitPrice)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-border">
                            <span className="text-lg font-bold text-foreground">Total</span>
                            <span className="text-2xl font-bold text-primary">{formatCurrency(selectedOrder.totalAmount)}</span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default OrderHistory;
