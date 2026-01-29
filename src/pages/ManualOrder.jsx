import { useState } from 'react';
import { Search, Plus, Minus, ShoppingCart, CreditCard, Smartphone, Banknote, X, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Modal } from '../components/ui';
import { formatCurrency, CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';

// Mock menu items
const MOCK_MENU = [
    { id: 1, name: 'Butter Chicken', price: 250, category: 'Meals', available: true },
    { id: 2, name: 'Chicken Biryani', price: 180, category: 'Meals', available: true },
    { id: 3, name: 'Veg Thali', price: 120, category: 'Meals', available: true },
    { id: 4, name: 'Paneer Tikka', price: 150, category: 'Starters', available: true },
    { id: 5, name: 'Samosa (2 pcs)', price: 40, category: 'Starters', available: true },
    { id: 6, name: 'Gulab Jamun', price: 60, category: 'Desserts', available: true },
    { id: 7, name: 'Ice Cream', price: 80, category: 'Desserts', available: false },
    { id: 8, name: 'Mango Lassi', price: 70, category: 'Beverages', available: true },
    { id: 9, name: 'Cold Coffee', price: 90, category: 'Beverages', available: true },
    { id: 10, name: 'Fresh Lime', price: 50, category: 'Beverages', available: true },
];

export const ManualOrder = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState([]);

    // Payment modal
    const [paymentModal, setPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState(null);

    // Filter menu
    const filteredMenu = MOCK_MENU.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Cart functions
    const addToCart = (item) => {
        if (!item.available) {
            toast.error('Item not available');
            return;
        }

        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };

    const updateQty = (itemId, delta) => {
        setCart(prev => {
            return prev.map(item => {
                if (item.id === itemId) {
                    const newQty = item.qty + delta;
                    return newQty > 0 ? { ...item, qty: newQty } : null;
                }
                return item;
            }).filter(Boolean);
        });
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

    // Payment
    const handlePayment = async () => {
        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }

        setProcessing(true);

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        const newOrderId = `ORD${Date.now().toString().slice(-6)}`;
        setOrderId(newOrderId);
        setOrderComplete(true);
        setProcessing(false);
    };

    const resetOrder = () => {
        setPaymentModal(false);
        setPaymentMethod(null);
        setOrderComplete(false);
        setOrderId(null);
        clearCart();
    };

    return (
        <div className="h-full flex gap-6">
            {/* Menu Section */}
            <div className="flex-1 flex flex-col min-w-0">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Manual Order</h1>
                    <p className="text-muted-foreground">Create orders for walk-in customers</p>
                </div>

                {/* Search and Categories */}
                <div className="mt-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-input rounded-lg bg-background text-foreground 
                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <Button
                                key={cat}
                                size="sm"
                                variant={selectedCategory === cat ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="flex-1 overflow-y-auto mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {filteredMenu.map(item => (
                            <Card
                                key={item.id}
                                className={`cursor-pointer transition-all hover:scale-[1.02] ${!item.available ? 'opacity-50' : ''
                                    }`}
                                onClick={() => addToCart(item)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-foreground">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">{item.category}</p>
                                        </div>
                                        {!item.available && (
                                            <Badge variant="destructive" size="sm">Out</Badge>
                                        )}
                                    </div>
                                    <p className="font-bold text-primary mt-2">{formatCurrency(item.price)}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart Section */}
            <Card className="w-80 flex flex-col shrink-0">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Cart ({cartCount})
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    {cart.length > 0 ? (
                        <>
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-foreground text-sm">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => updateQty(item.id, -1)}>
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="w-6 text-center font-medium">{item.qty}</span>
                                            <Button size="icon" variant="ghost" onClick={() => updateQty(item.id, 1)}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-border pt-4 mt-4 space-y-3">
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-foreground">Total</span>
                                    <span className="text-primary">{formatCurrency(cartTotal)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={clearCart} className="flex-1">
                                        <X className="h-4 w-4" />
                                        Clear
                                    </Button>
                                    <Button onClick={() => setPaymentModal(true)} className="flex-1">
                                        Pay
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center">
                            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3" />
                            <p className="font-medium text-foreground">Cart is empty</p>
                            <p className="text-sm text-muted-foreground">Add items from the menu</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Payment Modal */}
            <Modal
                isOpen={paymentModal}
                onClose={orderComplete ? resetOrder : () => setPaymentModal(false)}
                title={orderComplete ? 'Order Complete' : 'Payment'}
                size="md"
            >
                {orderComplete ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">Order #{orderId}</h3>
                        <p className="text-muted-foreground mt-2">Payment successful!</p>
                        <p className="text-2xl font-bold text-primary mt-4">{formatCurrency(cartTotal)}</p>
                        <Button onClick={resetOrder} className="mt-6 w-full">
                            New Order
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-3xl font-bold text-primary">{formatCurrency(cartTotal)}</p>
                        </div>

                        <p className="font-medium text-foreground">Select Payment Method</p>

                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'CASH', icon: Banknote, label: 'Cash' },
                                { id: 'UPI', icon: Smartphone, label: 'UPI' },
                                { id: 'CARD', icon: CreditCard, label: 'Card' },
                            ].map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`p-4 rounded-lg border-2 transition-all ${paymentMethod === method.id
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-input hover:border-primary/50 text-foreground'
                                        }`}
                                >
                                    <method.icon className="h-6 w-6 mx-auto mb-2" />
                                    <p className="text-sm font-medium">{method.label}</p>
                                </button>
                            ))}
                        </div>

                        <Button
                            onClick={handlePayment}
                            className="w-full"
                            loading={processing}
                            disabled={!paymentMethod}
                        >
                            {processing ? 'Processing...' : 'Complete Payment'}
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ManualOrder;
