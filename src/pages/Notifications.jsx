import { useState, useEffect } from 'react';
import { Check, X, Package, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Modal, Input } from '../components/ui';
import toast from 'react-hot-toast';
import { orderService, inventoryService } from '../services';

export const Notifications = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

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
        try {
            const response = await orderService.getOrders({ status: 'pending' });
            if (response.success && response.data) {
                // Transform backend data to match UI format
                const formattedOrders = (Array.isArray(response.data) ? response.data : []).map(order => ({
                    id: order.orderId || order.id,
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
        try {
            const response = await inventoryService.getLowStock();
            if (response.success && response.data) {
                // Transform backend data to match UI format
                const formattedStock = (Array.isArray(response.data) ? response.data : []).map(item => ({
                    id: item.id,
                    name: item.name || item.itemName,
                    current: item.currentStock || item.current || 0,
                    minimum: item.minimumStock || item.minimum || 0,
                    unit: item.unit || 'units'
                }));
                setLowStock(formattedStock);
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
            const response = await orderService.updateOrderStatus(orderId, 'delivered');
            if (response.success) {
                setOrders(prev => prev.filter(o => o.id !== orderId));
                toast.success(`Order #${orderId} marked as delivered`);
            }
        } catch (error) {
            console.error('Error delivering order:', error);
            toast.error('Failed to update order status');
        }
    };

    const handleCancel = async (orderId) => {
        try {
            const response = await orderService.updateOrderStatus(orderId, 'cancelled');
            if (response.success) {
                setOrders(prev => prev.filter(o => o.id !== orderId));
                toast.success(`Order #${orderId} cancelled`);
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            toast.error('Failed to cancel order');
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
                action: 'add'
            });

            if (response.success) {
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

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-border pb-2">
                <Button
                    variant={activeTab === 'orders' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('orders')}
                >
                    <Clock className="h-4 w-4" />
                    Orders ({orders.length})
                </Button>
                <Button
                    variant={activeTab === 'inventory' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('inventory')}
                >
                    <AlertTriangle className="h-4 w-4" />
                    Inventory ({lowStock.length})
                </Button>
            </div>

            {/* Tab Content */}
            {activeTab === 'orders' ? (
                <div className="space-y-4">
                    {orders.length > 0 ? (
                        orders.map(order => (
                            <Card key={order.id} className="order-card">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-bold text-foreground text-lg">#{order.id}</span>
                                            <Badge variant="warning">{order.slot}</Badge>
                                        </div>
                                        <p className="font-medium text-foreground">{order.customer}</p>
                                        <div className="text-sm text-muted-foreground mt-1">
                                            {order.items.map((item, i) => (
                                                <span key={i} className="block">{item}</span>
                                            ))}
                                        </div>
                                        <p className="font-bold text-primary mt-2">₹{order.total}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button size="sm" onClick={() => handleDeliver(order.id)}>
                                            <Check className="h-4 w-4" />
                                            Deliver
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleCancel(order.id)}>
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-lg font-medium text-foreground">No pending orders</p>
                                <p className="text-muted-foreground">All orders have been processed</p>
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
