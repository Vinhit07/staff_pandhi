import { useState } from 'react';
import { Check, X, Package, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Modal, Input } from '../components/ui';
import toast from 'react-hot-toast';

// Mock data
const MOCK_PENDING_ORDERS = [
    { id: '1001', customer: 'Rahul Sharma', items: ['Butter Chicken x1', 'Naan x2'], total: 350, slot: '12:00 - 12:30' },
    { id: '1002', customer: 'Priya Patel', items: ['Veg Thali x1'], total: 180, slot: '12:00 - 12:30' },
    { id: '1003', customer: 'Amit Kumar', items: ['Fish Curry x1', 'Rice x1', 'Lassi x1'], total: 420, slot: '12:30 - 1:00' },
];

const MOCK_LOW_STOCK = [
    { id: 1, name: 'Chicken Breast', current: 5, minimum: 20, unit: 'kg' },
    { id: 2, name: 'Paneer', current: 3, minimum: 15, unit: 'kg' },
    { id: 3, name: 'Cooking Oil', current: 10, minimum: 30, unit: 'L' },
];

export const Notifications = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState(MOCK_PENDING_ORDERS);
    const [lowStock, setLowStock] = useState(MOCK_LOW_STOCK);
    const [refreshing, setRefreshing] = useState(false);

    // Restock modal
    const [restockModal, setRestockModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [restockQty, setRestockQty] = useState('');

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            toast.success('Data refreshed');
        }, 500);
    };

    const handleDeliver = (orderId) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        toast.success(`Order #${orderId} marked as delivered`);
    };

    const handleCancel = (orderId) => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        toast.success(`Order #${orderId} cancelled`);
    };

    const openRestockModal = (item) => {
        setSelectedItem(item);
        setRestockQty('');
        setRestockModal(true);
    };

    const handleRestock = () => {
        if (!restockQty || isNaN(restockQty)) {
            toast.error('Please enter a valid quantity');
            return;
        }

        setLowStock(prev => prev.map(item =>
            item.id === selectedItem.id
                ? { ...item, current: item.current + parseInt(restockQty) }
                : item
        ).filter(item => item.current < item.minimum));

        toast.success(`${selectedItem.name} restocked with ${restockQty} ${selectedItem.unit}`);
        setRestockModal(false);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">App Orders</h1>
                    <p className="text-muted-foreground">Manage incoming orders and inventory alerts</p>
                </div>
                <Button variant="ghost" onClick={handleRefresh}>
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
