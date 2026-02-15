import { useState, useEffect } from 'react';
import { Search, TrendingUp, Users, DollarSign, ShoppingBag, Clock, Delete, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '../components/ui';
import { formatCurrency } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services';
import toast from 'react-hot-toast';

export const Dashboard = () => {
    const { user, outlet } = useAuth();
    const outletId = outlet?.id;

    // State for home data
    const [homeData, setHomeData] = useState(null);
    const [homeLoading, setHomeLoading] = useState(true);

    // State for recent orders
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    // State for order lookup
    const [orderNumber, setOrderNumber] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [orderLoading, setOrderLoading] = useState(false);

    // Fetch home data on mount
    useEffect(() => {
        const fetchHomeData = async () => {
            if (!outletId) {
                setHomeLoading(false);
                return;
            }

            try {
                setHomeLoading(true);
                const data = await orderService.getHomeData();

                // DEBUG: Log the complete response structure
                console.log('=== HOME DATA RESPONSE ===');
                console.log('Full data:', JSON.stringify(data, null, 2));
                console.log('Total Revenue:', data.totalRevenue);
                console.log('App Orders:', data.appOrders);
                console.log('Manual Orders:', data.manualOrders);
                console.log('Low Stock:', data.lowStockProducts);
                console.log('Best Seller:', data.bestSellerProduct);
                console.log('========================');

                setHomeData(data);
            } catch (error) {
                console.error('Error fetching home data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setHomeLoading(false);
            }
        };

        fetchHomeData();
    }, [outletId]);

    // Fetch recent orders on mount
    useEffect(() => {
        const fetchRecentOrders = async () => {
            if (!outletId) {
                setOrdersLoading(false);
                return;
            }

            try {
                setOrdersLoading(true);
                const data = await orderService.getRecentOrders(outletId, { page: 1, limit: 5 });
                setOrders(data.orders || []);
            } catch (error) {
                console.error('Error fetching recent orders:', error);
                toast.error('Failed to load recent orders');
            } finally {
                setOrdersLoading(false);
            }
        };

        fetchRecentOrders();
    }, [outletId]);

    // Calculator functions
    const handleKeyPress = (key) => {
        if (key === 'C') {
            setOrderNumber('');
            setSelectedOrder(null);
            setSelectedItems([]);
        } else if (key === 'DEL') {
            setOrderNumber(prev => prev.slice(0, -1));
        } else {
            setOrderNumber(prev => prev + key);
        }
    };

    const handleSearch = async () => {
        if (!orderNumber || !outletId) return;

        const cleanId = orderNumber.replace('#', '');

        try {
            setOrderLoading(true);
            setSelectedOrder(null);
            const data = await orderService.getOrderById(outletId, cleanId);

            if (data.order) {
                setSelectedOrder({
                    id: data.order.orderId,
                    customer: data.order.customerName,
                    items: data.order.items,
                    total: data.order.totalPrice,
                    status: data.order.orderStatus,
                });
                setSelectedItems([]);
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Order not found');
            setSelectedOrder({ notFound: true });
        } finally {
            setOrderLoading(false);
        }
    };

    // Handle item selection for partial delivery
    const handleItemSelection = (itemId) => {
        setSelectedItems(prev => {
            if (prev.includes(itemId)) {
                return prev.filter(id => id !== itemId);
            } else {
                return [...prev, itemId];
            }
        });
    };

    // Handle order actions (deliver, cancel, etc.)
    const handleOrderAction = async (action) => {
        if (!selectedOrder || !outletId) return;

        try {
            let status;
            const requestData = {
                orderId: parseInt(selectedOrder.id),
                outletId: parseInt(outletId),
            };

            switch (action) {
                case 'delivered':
                    status = 'DELIVERED';
                    requestData.orderItemIds = selectedItems;
                    break;
                case 'partially':
                    status = 'PARTIALLY_DELIVERED';
                    requestData.orderItemIds = selectedItems;
                    break;
                case 'cancel':
                    status = 'CANCELLED';
                    break;
                default:
                    return;
            }

            requestData.status = status;

            await orderService.updateOrderStatus(requestData);
            toast.success(`Order ${action === 'cancel' ? 'cancelled' : 'updated'} successfully`);

            // Refetch order to show updated status
            await handleSearch();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order');
        }
    };

    // Status badge variant
    const getStatusVariant = (status) => {
        switch (status?.toUpperCase()) {
            case 'DELIVERED': case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'destructive';
            case 'PENDING': case 'PREPARING': return 'warning';
            case 'PARTIALLY_DELIVERED': return 'warning';
            default: return 'default';
        }
    };

    // Stats configuration
    const stats = homeData ? [
        {
            title: 'Total Revenue',
            value: formatCurrency(homeData.totalRevenue || 0),
            icon: DollarSign,
            trend: `Today's earnings`,
            color: 'text-primary'
        },
        {
            title: 'App Orders',
            value: homeData.appOrders || 0,
            icon: ShoppingBag,
            trend: 'Orders from app',
            color: 'text-primary'
        },
        {
            title: 'Manual Orders',
            value: homeData.manualOrders || 0,
            icon: Users,
            trend: 'Manual orders',
            color: 'text-blue-500'
        },
        {
            title: 'Low Stock Items',
            value: homeData.lowStockProducts?.length || 0,
            icon: TrendingUp,
            trend: 'Need restocking',
            color: 'text-destructive'
        },
    ] : [];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Welcome back{user?.name ? `, ${user.name}` : ''}! Here's your overview.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {homeLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="pb-2">
                                <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
                                <div className="h-8 bg-muted animate-pulse rounded w-16 mt-2"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-3 bg-muted animate-pulse rounded w-32"></div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    stats.map((stat, index) => (
    <Card key={index}>
        <CardHeader className="pb-2">
            {/* Changed from CardDescription to a bold h3 for a bigger, punchier title */}
            <h3 className="text-lg font-bold text-foreground mb-1">
                {stat.title}
            </h3>
            <CardTitle className={`text-3xl font-extrabold ${stat.color}`}>
                {stat.value}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-xs text-muted-foreground font-medium">
                {stat.trend}
            </p>
        </CardContent>
    </Card>
))
                )}
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Best Seller</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium text-foreground">
                            {homeLoading ? '...' : (homeData?.bestSellerProduct?.name || 'N/A')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Peak Order Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium text-foreground">
                            {homeLoading ? '...' : (homeData?.peakSlot || 'N/A')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Wallet Recharges</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-medium text-foreground">
                            {homeLoading ? '...' : formatCurrency(homeData?.totalRechargedAmount || 0)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Order Lookup and Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Order Lookup Calculator */}
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Order Lookup</CardTitle>
                        <CardDescription className="text-xs">Enter order number to view details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Display */}
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                            <span className="text-2xl font-mono font-bold text-foreground">
                                {orderNumber || '----'}
                            </span>
                        </div>

                        {/* Keypad */}
                        <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <button
                                    key={num}
                                    onClick={() => handleKeyPress(String(num))}
                                    className="calc-btn"
                                >
                                    {num}
                                </button>
                            ))}
                            <button onClick={() => handleKeyPress('C')} className="calc-btn text-destructive">
                                C
                            </button>
                            <button onClick={() => handleKeyPress('0')} className="calc-btn">
                                0
                            </button>
                            <button onClick={() => handleKeyPress('DEL')} className="calc-btn">
                                <Delete className="h-4 w-4" />
                            </button>
                        </div>

                        <Button
                            onClick={handleSearch}
                            disabled={!orderNumber || orderLoading}
                            className="w-full"
                        >
                            {orderLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <Search className="h-4 w-4" />
                                    Search Order
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Order Details or Recent Orders */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                            {selectedOrder && !selectedOrder.notFound ? `Order #${selectedOrder.id}` : 'Recent Orders'}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {selectedOrder && !selectedOrder.notFound ? selectedOrder.customer : 'Latest order activity'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedOrder && !selectedOrder.notFound ? (
                            <div className="space-y-4">
                                {/* Order Items */}
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => handleItemSelection(item.id)}
                                                    className="w-4 h-4"
                                                />
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">{item.productName}</p>
                                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-foreground text-sm">
                                                    {formatCurrency(item.totalPrice)}
                                                </p>
                                                <Badge variant={getStatusVariant(item.itemStatus)}>
                                                    {item.itemStatus}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center pt-4 border-t border-border">
                                    <span className="font-semibold">Total</span>
                                    <span className="text-xl font-bold text-primary">
                                        {formatCurrency(selectedOrder.total)}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <Button
                                        variant="default"
                                        onClick={() => handleOrderAction('delivered')}
                                        disabled={selectedItems.length === 0}
                                        className="flex-1"
                                    >
                                        Deliver Selected
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleOrderAction('cancel')}
                                        className="flex-1"
                                    >
                                        Cancel Order
                                    </Button>
                                </div>

                                <Button variant="secondary" onClick={() => setSelectedOrder(null)} className="w-full">
                                    Back to Orders
                                </Button>
                            </div>
                        ) : selectedOrder?.notFound ? (
                            <div className="text-center py-8">
                                <p className="text-destructive font-medium">Order not found</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Please check the order number and try again
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                {ordersLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No recent orders</p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-muted/30">
                                            <tr>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Order</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
                                                <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {orders.map(order => (
                                                <tr key={order.billNumber} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-3 py-2 font-medium text-primary text-sm">
                                                        #{order.billNumber}
                                                    </td>
                                                    <td className="px-3 py-2 text-sm text-foreground">{order.customerName}</td>
                                                    <td className="px-3 py-2 text-sm font-semibold text-foreground">
                                                        {formatCurrency(order.totalAmount)}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
