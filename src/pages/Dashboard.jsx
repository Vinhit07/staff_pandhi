import { useState } from 'react';
import { Search, TrendingUp, Users, DollarSign, ShoppingBag, Clock, Delete, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from '../components/ui';
import { formatCurrency } from '../utils/constants';

// Mock data
const MOCK_STATS = [
    { title: 'Total Revenue', value: '₹12,345', icon: DollarSign, trend: '+20.1% from last month', color: 'text-primary' },
    { title: 'Active Orders', value: '156', icon: ShoppingBag, trend: '+12 new today', color: 'text-primary' },
    { title: 'Customers', value: '2,345', icon: Users, trend: '+180 this week', color: 'text-foreground' },
    { title: 'Avg. Order Value', value: '₹52.80', icon: TrendingUp, trend: '+5.2% from last month', color: 'text-foreground' },
];

const MOCK_ORDERS = [
    { id: '1001', customer: 'Rahul Sharma', items: 3, total: 450, status: 'PENDING', time: '10:30 AM' },
    { id: '1002', customer: 'Priya Patel', items: 2, total: 280, status: 'DELIVERED', time: '10:15 AM' },
    { id: '1003', customer: 'Amit Kumar', items: 5, total: 750, status: 'PENDING', time: '10:00 AM' },
    { id: '1004', customer: 'Sneha Reddy', items: 1, total: 120, status: 'CANCELLED', time: '09:45 AM' },
    { id: '1005', customer: 'Vikram Singh', items: 4, total: 580, status: 'DELIVERED', time: '09:30 AM' },
];

const MOCK_ORDER_DETAILS = {
    id: '1001',
    customer: 'Rahul Sharma',
    items: [
        { name: 'Butter Chicken', qty: 1, price: 250, delivered: false },
        { name: 'Naan (2 pcs)', qty: 1, price: 60, delivered: true },
        { name: 'Mango Lassi', qty: 2, price: 140, delivered: false },
    ],
    total: 450,
    status: 'PENDING',
};

export const Dashboard = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const ordersPerPage = 5;

    // Calculator functions
    const handleKeyPress = (key) => {
        if (key === 'C') {
            setOrderNumber('');
            setSelectedOrder(null);
        } else if (key === 'DEL') {
            setOrderNumber(prev => prev.slice(0, -1));
        } else {
            setOrderNumber(prev => prev + key);
        }
    };

    const handleSearch = () => {
        if (orderNumber) {
            setSelectedOrder(MOCK_ORDER_DETAILS);
        }
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

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Welcome back! Here's your overview.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MOCK_STATS.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-xs">{stat.title}</CardDescription>
                            <CardTitle className={`text-2xl ${stat.color}`}>{stat.value}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">{stat.trend}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom Row - System Status, Recent Activity, Pending Tasks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-foreground">Server</span>
                            <Badge variant="success">Online</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-foreground">Database</span>
                            <Badge variant="success">Healthy</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">5 new orders in the last hour</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Pending Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">3 tickets awaiting response</p>
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
                            disabled={!orderNumber}
                            className="w-full"
                        >
                            <Search className="h-4 w-4" />
                            Search Order
                        </Button>
                    </CardContent>
                </Card>

                {/* Order Details or Recent Orders */}
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">{selectedOrder ? `Order #${selectedOrder.id}` : 'Recent Orders'}</CardTitle>
                        <CardDescription className="text-xs">
                            {selectedOrder ? selectedOrder.customer : 'Latest order activity'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedOrder ? (
                            <div className="space-y-4">
                                {/* Order Items */}
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.delivered ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                                    }`}>
                                                    {item.delivered ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground text-sm">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-foreground text-sm">{formatCurrency(item.price)}</p>
                                                <Button size="sm" variant={item.delivered ? 'secondary' : 'default'}>
                                                    {item.delivered ? 'Delivered' : 'Deliver'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center pt-4 border-t border-border">
                                    <span className="font-semibold">Total</span>
                                    <span className="text-xl font-bold text-primary">{formatCurrency(selectedOrder.total)}</span>
                                </div>

                                <Button variant="secondary" onClick={() => setSelectedOrder(null)} className="w-full">
                                    Back to Orders
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/30">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Order</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Items</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
                                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {MOCK_ORDERS.slice(0, ordersPerPage).map(order => (
                                            <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-3 py-2 font-medium text-primary text-sm">#{order.id}</td>
                                                <td className="px-3 py-2 text-sm text-foreground">{order.customer}</td>
                                                <td className="px-3 py-2 text-sm text-muted-foreground">{order.items} items</td>
                                                <td className="px-3 py-2 text-sm font-semibold text-foreground">{formatCurrency(order.total)}</td>
                                                <td className="px-3 py-2">
                                                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
