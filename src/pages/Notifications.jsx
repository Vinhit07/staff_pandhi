import { useState, useEffect } from 'react';
import { Check, X, Package, Clock, AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Modal, Input } from '../components/ui';
import toast from 'react-hot-toast';
import { orderService, inventoryService } from '../services';
import { useAuth } from '../hooks/useAuth';

export const Notifications = () => {
    const { user } = useAuth();
    const outletId = user?.outlet?.id;

    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter orders based on search
    const filteredOrders = orders.filter(order =>
        order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Restock modal
    const [restockModal, setRestockModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [restockQty, setRestockQty] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchPendingOrders(),
                fetchLowStock()
            ]);
        } catch (error) {
            console.error('Error fetching notifications data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingOrders = async () => {
        if (!outletId) return;
        try {
            const response = await orderService.getOrders(outletId, { status: 'pending' });
            // apiRequest returns data directly: {orders: [...], total, totalPages, currentPage}
            if (response && response.orders) {
                // Transform backend data to match UI format
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const formattedOrders = (Array.isArray(response.orders) ? response.orders : [])
                    .filter(order => {
                        // Filter out future delivery dates
                        if (order.deliveryDate) {
                            const delivery = new Date(order.deliveryDate);
                            delivery.setHours(0, 0, 0, 0);
                            return delivery <= today;
                        }
                        return true;
                    })
                    .map(order => ({
                        id: order.billNumber || order.orderId || order.id,
                        customer: order.customerName || order.customer || 'Unknown',
                        items: order.items?.map(item => `${item.name || item.product} x${item.quantity}`) || [],
                        total: order.totalAmount || order.total || 0,
                        slot: order.deliverySlot || order.slot || 'N/A'
                    }));
                setOrders(formattedOrders);
            }
        } catch (error) {
            console.error('Error fetching pending orders:', error);
            setOrders([]);
        }
    };

    const fetchLowStock = async () => {
        if (!outletId) return;
        try {
            const response = await inventoryService.getLowStock(outletId);
            // API returns { stocks: [...] }
            if (response && response.stocks) {
                // Filter for items where quantity is below threshold
                const lowStockItems = Array.isArray(response.stocks)
                    ? response.stocks.filter(item => item.quantity < item.threshold)
                    : [];

                console.log('Notifications: Low stock items:', lowStockItems);

                const formattedStock = lowStockItems.map(item => ({
                    id: item.id,
                    name: item.name,
                    current: item.quantity,
                    minimum: item.threshold,
                    unit: 'units'
                }));
                setLowStock(formattedStock);
            } else {
                console.warn('Notifications: Invalid stock response:', response);
            }
        } catch (error) {
            console.error('Error fetching low stock:', error);
            setLowStock([]);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
        toast.success('Data refreshed');
    };

    const handleDeliver = async (orderId) => {
        try {
            // Backend expects {orderId, status, outletId} with UPPERCASE status
            const response = await orderService.updateOrderStatus({
                orderId,
                status: 'DELIVERED',
                outletId
            });
            if (response && response.message) {
                setOrders(prev => prev.filter(o => o.id !== orderId));
                toast.success(response.message || `Order #${orderId} marked as delivered`);
            }
        } catch (error) {
            console.error('Error delivering order:', error);
            toast.error(error.message || 'Failed to update order status');
        }
    };

    const handleCancel = async (orderId) => {
        try {
            // Backend expects {orderId, status, outletId} with UPPERCASE status
            const response = await orderService.updateOrderStatus({
                orderId,
                status: 'CANCELLED',
                outletId
            });
            if (response && response.message) {
                setOrders(prev => prev.filter(o => o.id !== orderId));
                toast.success(response.message || `Order #${orderId} cancelled`);
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error(error.message || 'Failed to cancel order');
        }
    };

    const openRestockModal = (item) => {
        setSelectedItem(item);
        setRestockQty('');
        setRestockModal(true);
    };

    const handleRestock = async () => {
        if (!restockQty || isNaN(restockQty)) {
            toast.error('Please enter a valid quantity');
            return;
        }

        try {
            const response = await inventoryService.updateStock(selectedItem.id, {
                quantity: parseInt(restockQty),
                action: 'add',
                outletId: outletId
            });

            if (response && response.message) {
                // Update local state
                setLowStock(prev => prev.map(item =>
                    item.id === selectedItem.id
                        ? { ...item, current: item.current + parseInt(restockQty) }
                        : item
                ).filter(item => item.current < item.minimum));

                toast.success(`${selectedItem.name} restocked with ${restockQty} ${selectedItem.unit}`);
                setRestockModal(false);

                // Refresh data to get latest from server
                fetchLowStock();
            }
        } catch (error) {
            console.error('Error restocking item:', error);
            toast.error('Failed to restock item');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }


    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">App Orders</h1>
                    <p className="text-muted-foreground">Manage incoming orders and inventory alerts</p>
                </div>
                <Button variant="ghost" onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* Tab Navigation & Search */}
            <div className="flex flex-col md:flex-row gap-4 border-b border-border pb-4 justify-between items-end md:items-center">
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === 'orders' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('orders')}
                    >
                        Orders ({orders.length})
                    </Button>
                    <Button
                        variant={activeTab === 'inventory' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('inventory')}
                    >
                        Inventory ({lowStock.length})
                    </Button>
                </div>

                {/* Search Bar - Only show when on orders tab */}
                {activeTab === 'orders' && (
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search Order # or Customer"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-9"
                        />
                    </div>
                )}
            </div>

            {/* Tab Content */}
            {activeTab === 'orders' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                            <Card key={order.id} className="order-card flex flex-col h-full">
                                <CardContent className="p-4 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-foreground text-lg">#{order.id}</span>
                                            {/* <Badge variant="warning">{order.slot}</Badge> */}
                                        </div>
                                        <p className="font-bold text-primary">₹{order.total}</p>
                                    </div>

                                    <p className="font-medium text-foreground mb-1">{order.customer}</p>

                                    <div className="text-sm text-muted-foreground flex-1 mb-4 space-y-1">
                                        {order.items.map((item, i) => (
                                            <span key={i} className="block line-clamp-1" title={item}>• {item}</span>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-auto pt-2">
                                        <Button size="sm" onClick={() => handleDeliver(order.id)} className="w-full">
                                            <Check className="h-4 w-4 mr-1" />
                                            Deliver
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleCancel(order.id)} className="w-full">
                                            <X className="h-4 w-4 mr-1" />
                                            Cancel
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card className="col-span-full">
                            <CardContent className="py-12 text-center">
                                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium text-foreground">
                                    {searchTerm ? 'No matching orders found' : 'No pending orders'}
                                </p>
                                <p className="text-muted-foreground">
                                    {searchTerm ? 'Try a different search term' : 'All orders have been processed'}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {lowStock.length > 0 ? (
                        lowStock.map(item => (
                            <Card key={item.id}>
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center">
                                                <Package className="h-6 w-6 text-destructive" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.current} {item.unit} left (Min: {item.minimum} {item.unit})
                                                </p>
                                            </div>
                                        </div>
                                        <Button size="sm" onClick={() => openRestockModal(item)}>
                                            Restock
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium text-foreground">Stock levels are good!</p>
                                <p className="text-muted-foreground">No items below minimum threshold</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Restock Modal */}
            <Modal
                isOpen={restockModal}
                onClose={() => setRestockModal(false)}
                title={`Restock ${selectedItem?.name}`}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setRestockModal(false)}>Cancel</Button>
                        <Button onClick={handleRestock}>Confirm Restock</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Current Stock</p>
                        <p className="text-2xl font-bold text-foreground">
                            {selectedItem?.current} {selectedItem?.unit}
                        </p>
                    </div>
                    <Input
                        label={`Quantity to Add (${selectedItem?.unit})`}
                        type="number"
                        value={restockQty}
                        onChange={(e) => setRestockQty(e.target.value)}
                        placeholder="Enter quantity"
                        min="1"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default Notifications;
