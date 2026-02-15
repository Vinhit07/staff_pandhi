import { useState, useEffect } from 'react';
import { Search, Plus, Minus, ShoppingCart, CreditCard, Smartphone, Banknote, X, Check, Edit2, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Modal } from '../components/ui';
import { formatCurrency, CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';
import { inventoryService, orderService } from '../services';
import { useAuth } from '../context/AuthContext';

// Veg/Non-Veg Icon Component
const VegIcon = ({ isVeg }) => (
    <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 mt-0.5 ${isVeg ? 'border-green-600' : 'border-red-600'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
    </div>
);

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

            if (response && response.products) {
                const formattedMenu = response.products.map(item => ({
                    id: item.id || item.productId,
                    name: item.name || item.productName,
                    price: item.price || item.sellingPrice || 0,
                    category: item.category || 'Other',
                    description: item.description || '',
                    imageUrl: item.imageUrl || null,
                    quantityAvailable: item.quantityAvailable || 0,
                    available: (item.quantityAvailable || 0) > 0,
                    isVeg: item.isVeg === true || item.is_veg === true,
                }));
                setMenuItems(formattedMenu);
            } else {
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

    const filteredMenu = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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

    const handlePayment = async () => {
        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }

        setProcessing(true);
        try {
            const outletId = outlet?.id || user?.staffDetails?.outletId || user?.outlet?.id;
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

            if (response && response.order) {
                const newOrderId = response.order?.id || `ORD${Date.now().toString().slice(-6)}`;
                setOrderId(newOrderId);
                setOrderComplete(true);
                toast.success(response.message || 'Order created successfully!');
            } else {
                throw new Error(response?.message || 'Failed to create order');
            }
        } catch (error) {
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
            <div className="flex-1 flex flex-col min-w-0">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Manual Order</h1>
                    <p className="text-muted-foreground">Create orders for walk-in customers</p>
                </div>

                <div className="mt-4 space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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

                <div className="flex-1 overflow-y-auto mt-4 px-1">
                    {filteredMenu.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredMenu.map(item => {
                                const stockPercent = Math.min(100, ((item.quantityAvailable || 0) / 100) * 100);
                                const isLowStock = (item.quantityAvailable || 0) < 10;
                                const cartItem = cart.find(c => c.id === item.id);

                                return (
                                    <Card key={item.id} className="flex flex-col h-full transition-all hover:shadow-lg border border-border/50">
                                        <CardContent className="p-4 pt-5 flex flex-col h-full">
                                            
                                            {/* 1. Header: Icon + Name + Price */}
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-start gap-2 overflow-hidden">
                                                    <h3 className="font-bold text-foreground text-sm line-clamp-2 leading-tight">
                                                        {item.name}
                                                    </h3>
                                                </div>
                                                <span className="font-bold text-foreground text-sm shrink-0">
                                                    {formatCurrency(item.price)}
                                                </span>
                                            </div>

                                            {/* 2. Category */}
                                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
                                                {item.category}
                                            </p>

                                            {/* 3. Description: Increased line-clamp for better visibility */}
                                            <div className="mb-4">
                                                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed min-h-[48px]">
                                                    {item.description || 'No description available'}
                                                </p>
                                            </div>

                                            {/* 4. Stock Section */}
                                            <div className="mt-auto space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-muted-foreground">Stock</span>
                                                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                                        isLowStock 
                                                        ? 'bg-red-50 border-red-200 text-red-600' 
                                                        : 'bg-muted border-border text-muted-foreground'
                                                    }`}>
                                                        {item.quantityAvailable || 0} units
                                                    </div>
                                                </div>
                                                
                                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all ${isLowStock ? 'bg-red-500' : 'bg-green-500'}`}
                                                        style={{ width: `${stockPercent}%` }}
                                                    />
                                                </div>

                                                {/* 5. Add to Cart Button */}
                                                <Button
                                                    size="sm"
                                                    className={`w-full mt-4 font-bold text-xs h-9 shadow-sm`}
                                                    onClick={() => addToCart(item)}
                                                    disabled={item.quantityAvailable <= 0}
                                                >
                                                    {cartItem ? (
                                                        <><Check className="h-3 w-3 mr-1" /> In Cart ({cartItem.qty})</>
                                                    ) : (
                                                        <><Plus className="h-3 w-3 mr-1" /> Add to Cart</>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
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

            <Card className="w-80 flex flex-col shrink-0 bg-muted/30 border-l border-border shadow-xl">
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <ShoppingCart className="h-6 w-6 text-primary" />
                            Order Summary
                        </CardTitle>
                        <Badge variant="secondary" className="px-2 py-0.5">
                            {cartCount} {cartCount === 1 ? 'item' : 'items'}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col min-h-0 px-4">
                    {cart.length > 0 ? (
                        <>
                            <div className="flex-1 overflow-y-auto pr-1 space-y-3 mb-4">
                                {cart.map(item => (
                                    <div key={item.id} className="group bg-card p-3 rounded-xl border border-border/50 shadow-sm transition-all hover:border-primary/30">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <p className="font-bold text-foreground text-sm line-clamp-1">{item.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatCurrency(item.price)} each</p>
                                            </div>
                                            <p className="font-bold text-primary text-sm whitespace-nowrap ml-2">
                                                {formatCurrency(item.price * item.qty)}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center bg-muted rounded-sm ">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 rounded-md hover:bg-card"
                                                    onClick={() => updateQty(item.id, -1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-7 w-7 rounded-md hover:bg-card"
                                                    onClick={() => updateQty(item.id, 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                onClick={() => updateQty(item.id, -item.qty)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-card p-4 rounded-xl mt-auto space-y-4">
                                <div className="space-y-1.5 pt-1">
                                    <div className="flex justify-between text-base font-semibold border-t border-border pt-2 mt-2">
                                        <span className="text-foreground">Total Amount</span>
                                        <span className="text-primary text-lg font-black">{formatCurrency(cartTotal)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={clearCart} className="flex-1 font-semibold border-2">
                                        Clear
                                    </Button>
                                    <Button onClick={() => setPaymentModal(true)} className="flex-[2] font-black text-base shadow-lg shadow-primary/20">
                                        Checkout
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <p className="font-bold text-foreground text-lg">Cart is empty</p>
                            <p className="text-sm text-muted-foreground mt-1 px-8">
                                Add items from the menu to build an order
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal
                isOpen={paymentModal}
                onClose={orderComplete ? resetOrder : () => setPaymentModal(false)}
                title={orderComplete ? 'Order Complete' : 'Payment'}
                size="md"
            >
                {orderComplete ? (
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
            </Modal>
        </div>
    );
};

export default ManualOrder;