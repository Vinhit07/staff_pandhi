import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Package, RefreshCw, History, Loader2 } from 'lucide-react';
import { Card, CardContent, Badge, Button, Modal, Input } from '../components/ui';
import { CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { useAuth } from '../hooks/useAuth';
import { inventoryService } from '../services';

export const Inventory = () => {
    const { user } = useAuth();
    const outletId = user?.outlet?.id;

    const [activeTab, setActiveTab] = useState('stock');
    const [inventory, setInventory] = useState([]);
    const [history, setHistory] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Stock modal
    const [stockModal, setStockModal] = useState(false);
    const [modalType, setModalType] = useState('add');
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState('');
    const [processing, setProcessing] = useState(false);

    // Fetch stocks on mount
    useEffect(() => {
        fetchStocks();
    }, [outletId]);

    // Fetch stock history when switching to history tab
    useEffect(() => {
        if (activeTab === 'history' && outletId) {
            fetchHistory();
        }
    }, [activeTab, outletId]);

    const fetchStocks = async () => {
        if (!outletId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await inventoryService.getStocks(outletId);
            setInventory(data.stocks || []);
        } catch (error) {
            console.error('Error fetching stocks:', error);
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        if (!outletId) return;

        try {
            const data = await inventoryService.getStockHistory({ outletId });
            setHistory(data.history || []);
        } catch (error) {
            console.error('Error fetching stock history:', error);
            toast.error('Failed to load history');
        }
    };

    // Filter inventory
    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.productName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Refresh
    const handleRefresh = () => {
        setRefreshing(true);
        fetchStocks().finally(() => setRefreshing(false));
    };

    // Open stock modal
    const openStockModal = (item, type) => {
        setSelectedItem(item);
        setModalType(type);
        setQuantity('');
        setStockModal(true);
    };

    // Update stock
    const handleUpdateStock = async () => {
        const qty = parseInt(quantity);
        if (!qty || qty <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        try {
            setProcessing(true);
            const stockData = {
                outletId: parseInt(outletId),
                productId: selectedItem.productId,
                quantity: qty,
            };

            if (modalType === 'add') {
                await inventoryService.addStock(stockData);
                toast.success(`Added ${qty} ${selectedItem.unit} of ${selectedItem.productName}`);
            } else {
                await inventoryService.deductStock(stockData);
                toast.success(`Deducted ${qty} ${selectedItem.unit} of ${selectedItem.productName}`);
            }

            setStockModal(false);
            fetchStocks(); // Refresh stocks
        } catch (error) {
            console.error('Error updating stock:', error);
            toast.error('Failed to update stock');
        } finally {
            setProcessing(false);
        }
    };

    // Status badge variant
    const getStatusVariant = (currentStock, minimumStock) => {
        if (currentStock < minimumStock * 0.5) return 'destructive';
        if (currentStock < minimumStock) return 'warning';
        return 'success';
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
                    <p className="text-sm text-muted-foreground">Manage stock levels and track changes</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRefresh}>
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant={activeTab === 'stock' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('stock')}
                >
                    <Package className="h-4 w-4" />
                    Stock Availability
                </Button>
                <Button
                    size="sm"
                    variant={activeTab === 'history' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('history')}
                >
                    <History className="h-4 w-4" />
                    Stock History
                </Button>
            </div>

            {/* Tab Content */}
            {activeTab === 'stock' ? (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground 
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
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

                    {/* Inventory Grid */}
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredInventory.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No inventory items found
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredInventory.map(item => (
                                <Card key={item.productId}>
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-semibold text-foreground">{item.productName}</p>
                                                <p className="text-xs text-muted-foreground">{item.category || 'N/A'}</p>
                                            </div>
                                            <Badge variant={getStatusVariant(item.currentStock, item.minimumStock)}>
                                                {item.currentStock < item.minimumStock * 0.5 ? 'LOW' :
                                                    item.currentStock < item.minimumStock ? 'WARNING' : 'GOOD'}
                                            </Badge>
                                        </div>
                                        <div className="bg-muted/30 rounded-lg p-3 mb-3">
                                            <p className="text-xs text-muted-foreground">Current Stock</p>
                                            <p className="text-xl font-bold text-foreground">
                                                {item.currentStock} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground">Min: {item.minimumStock} {item.unit}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1" onClick={() => openStockModal(item, 'add')}>
                                                <Plus className="h-3 w-3" />
                                                Add
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => openStockModal(item, 'deduct')}>
                                                <Minus className="h-3 w-3" />
                                                Deduct
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/30">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Item</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Quantity</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">By</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {history.length > 0 ? history.map(entry => (
                                        <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">{entry.productName}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={entry.transactionType === 'ADD' ? 'success' : 'warning'}>
                                                    {entry.transactionType === 'ADD' ? '+' : '-'} {entry.transactionType}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-foreground">
                                                {entry.quantity} {entry.unit}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-sm">
                                                {dayjs(entry.createdAt).format('DD/MM/YYYY HH:mm')}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-sm">{entry.staffName || 'System'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                                                No history available
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Stock Update Modal */}
            <Modal
                isOpen={stockModal}
                onClose={() => setStockModal(false)}
                title={`${modalType === 'add' ? 'Add to' : 'Deduct from'} ${selectedItem?.name}`}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setStockModal(false)} disabled={processing}>Cancel</Button>
                        <Button onClick={handleUpdateStock} loading={processing}>
                            {modalType === 'add' ? 'Add Stock' : 'Deduct Stock'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Current Stock</p>
                        <p className="text-2xl font-bold text-foreground">
                            {selectedItem?.currentStock} {selectedItem?.unit}
                        </p>
                    </div>
                    <Input
                        label={`Quantity to ${modalType} (${selectedItem?.unit})`}
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        min="1"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default Inventory;
