import { useState, useEffect } from 'react';
import { Search, Plus, Minus, ShoppingCart, CreditCard, Smartphone, Banknote, X, Check } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Modal } from '../components/ui';
import { formatCurrency, CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';
import { inventoryService, orderService } from '../services';
import { useAuth } from '../context/AuthContext';

export const ManualOrder = () => {
    const { user, outlet } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Payment modal
    const [paymentModal, setPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            const outletId = outlet?.id || user?.staffDetails?.outletId || user?.outlet?.id;

            if (!outletId) {
                toast.error('No outlet ID found');
                return;
            }

            const response = await inventoryService.getProductsInStock(outletId);

            // apiRequest returns data directly, not {success, data}
            if (response && response.products) {
                // Transform backend data to match UI format
                const formattedMenu = response.products.map(item => ({
                    id: item.id || item.productId,
                    name: item.name || item.productName,
                    price: item.price || item.sellingPrice || 0,
                    category: item.category || 'Other',
                    description: item.description || '',
                    imageUrl: item.imageUrl || null,
                    quantityAvailable: item.quantityAvailable || 0,
                    available: (item.quantityAvailable || 0) > 0
                }));
                setMenuItems(formattedMenu);
            } else {
                console.warn('No products found in response:', response);
                setMenuItems([]);
            }
        } catch (error) {
            console.error('Error fetching menu items:', error);
            toast.error('Failed to load menu items');
            setMenuItems([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter menu
    const filteredMenu = menuItems.filter(item => {
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

        try {
            const outletId = outlet?.id || user?.staffDetails?.outletId || user?.outlet?.id;

            // Prepare order data
            const orderData = {
                outletId,
                items: cart.map(item => ({
                    productId: item.id,
                    name: item.name,
                    quantity: item.qty,
                    price: item.price
                })),
                totalAmount: cartTotal,
                paymentMethod,
                orderType: 'MANUAL',
                status: 'COMPLETED'
            };

            const response = await orderService.addManualOrder(orderData);

            // Backend returns {message: "...", order: {...}} directly
            if (response && response.order) {
                const newOrderId = response.order?.id || `ORD${Date.now().toString().slice(-6)}`;
                setOrderId(newOrderId);
                setOrderComplete(true);
                toast.success(response.message || 'Order created successfully!');
            } else {
                throw new Error(response?.message || 'Failed to create order');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            toast.error(error.message || 'Failed to process payment');
        } finally {
            setProcessing(false);
        }
    };

    const resetOrder = () => {
        setPaymentModal(false);
        setPaymentMethod(null);
        setOrderComplete(false);
        setOrderId(null);
        clearCart();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

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
                    {filteredMenu.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredMenu.map(item => (
                                <Card
                                    key={item.id}
                                    className={`cursor-pointer transition-all hover:scale-[1.02] overflow-hidden ${!item.available ? 'opacity-50' : ''
                                        }`}
                                    onClick={() => addToCart(item)}
                                >
                                    <CardContent className="p-0">
                                        {/* Product Image */}
                                        {item.imageUrl && (
                                            <div className="w-full h-32 bg-muted overflow-hidden">
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => e.target.style.display = 'none'}
                                                />
                                            </div>
                                        )}

                                        {/* Product Details */}
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-foreground line-clamp-1">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground">{item.category}</p>
                                                </div>
                                                {!item.available && (
                                                    <Badge variant="destructive" size="sm">Out</Badge>
                                                )}
                                            </div>

                                            {/* Description */}
                                            {item.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                    {item.description}
                                                </p>
                                            )}

                                            {/* Price and Stock */}
                                            <div className="flex justify-between items-center mt-2">
                                                <p className="font-bold text-primary text-lg">{formatCurrency(item.price)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Stock: <span className="font-medium">{item.quantityAvailable || 0}</span>
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <p className="text-lg font-medium text-foreground">No items found</p>
                                <p className="text-muted-foreground">Try adjusting your search or filters</p>
                            </div>
                        </div>
                    )}
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
            < Modal
                isOpen={paymentModal}
                onClose={orderComplete ? resetOrder : () => setPaymentModal(false)}
                title={orderComplete ? 'Order Complete' : 'Payment'}
                size="md"
            >
                {
                    orderComplete ? (
                        <div className="text-center py-6" >
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
                                disabled={!paymentMethod || processing}
                            >
                                {processing ? 'Processing...' : 'Complete Payment'}
                            </Button>
                        </div>
                    )}
            </Modal >
        </div >
    );
};

export default ManualOrder;
