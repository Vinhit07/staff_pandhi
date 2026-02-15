import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Package, RefreshCw, History, Loader2 } from 'lucide-react';
import { Card, CardContent, Badge, Button, Modal, Input } from '../components/ui';
import { CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { useAuth } from '../hooks/useAuth';
import { inventoryService } from '../services';

export const Inventory = () => {
    const { user, outlet } = useAuth();
    const outletId = outlet?.id;

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

    useEffect(() => {
        fetchStocks();
    }, [outletId]);

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
            const endDate = dayjs().format('YYYY-MM-DD');
            const startDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
            const data = await inventoryService.getStockHistory({ outletId, startDate, endDate });
            setHistory(data.history || []);
        } catch (error) {
            toast.error('Failed to load history');
        }
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleRefresh = () => {
        setRefreshing(true);
        fetchStocks().finally(() => setRefreshing(false));
    };

    const openStockModal = (item, type) => {
        setSelectedItem(item);
        setModalType(type);
        setQuantity('');
        setStockModal(true);
    };

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
                productId: selectedItem.id,
                quantity: qty,
            };

            if (modalType === 'add') {
                await inventoryService.addStock(stockData);
                toast.success(`Added ${qty} units of ${selectedItem.name}`);
            } else {
                await inventoryService.deductStock(stockData);
                toast.success(`Deducted ${qty} units of ${selectedItem.name}`);
            }

            setStockModal(false);
            fetchStocks();
        } catch (error) {
            toast.error('Failed to update stock');
        } finally {
            setProcessing(false);
        }
    };

    // Updated helper to use yellow for warning states
    const getStockColorClass = (quantity, threshold) => {
        if (quantity < threshold * 0.5) return 'bg-red-500';
        if (quantity < threshold) return 'bg-yellow-500'; // Changed from orange
        return 'bg-green-500';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
                    <p className="text-sm text-muted-foreground">Manage stock levels and track changes</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleRefresh}>
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="flex gap-2">
                <Button size="sm" variant={activeTab === 'stock' ? 'default' : 'outline'} onClick={() => setActiveTab('stock')}>
                    <Package className="h-4 w-4" /> Stock Availability
                </Button>
                <Button size="sm" variant={activeTab === 'history' ? 'default' : 'outline'} onClick={() => setActiveTab('history')}>
                    <History className="h-4 w-4" /> Stock History
                </Button>
            </div>

            {activeTab === 'stock' ? (
                <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {CATEGORIES.map(cat => (
                                <Button key={cat} size="sm" variant={selectedCategory === cat ? 'default' : 'outline'} onClick={() => setSelectedCategory(cat)}>
                                    {cat}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredInventory.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">No inventory items found</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredInventory.map(item => (
                                <Card key={item.id} className="overflow-hidden">
                                    <CardContent className="p-4">
                                        {/* Header Info */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                
                                                <h3 className="font-bold text-lg text-foreground capitalize leading-tight mt-4">
                                                    {item.name}
                                                </h3>
                                                <p className="text-[10px] font-bold text-primary uppercase tracking-wider leading-none">
                                                    {item.category || 'N/A'}
                                                </p>
                                            </div>
                                    </div>

                                    {/* Manual Order Style Stock Bar */}
                                    <div className="space-y-1.5 mb-5">
                                        <div className="flex justify-between text-[11px] text-muted-foreground">
                                            <span className="font-medium">Current Stock</span>
                                            <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded">
                                                {item.quantity} units
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${getStockColorClass(item.quantity, item.threshold)}`}
                                                style={{ width: `${Math.min((item.quantity / (item.threshold * 2 || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground italic">
                                            Min required: {item.threshold} units
                                        </p>
                                    </div>

                                        {/* Action Buttons Updated to Primary Yellow */}
                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => openStockModal(item, 'add')}>
                                                <Plus className="h-3.5 w-3.5 mr-1" /> Add
                                            </Button>
                                            <Button size="sm" variant="outline" className="flex-1 border-primary/20 hover:bg-primary/5" onClick={() => openStockModal(item, 'deduct')}>
                                                <Minus className="h-3.5 w-3.5 mr-1" /> Deduct
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* History Table */
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
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {history.map(entry => (
                                        <tr key={entry.id} className="hover:bg-muted/20">
                                            <td className="px-4 py-3 font-medium text-foreground">{entry.product?.name || 'Unknown'}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={entry.action === 'ADD' ? 'success' : 'warning'}>
                                                    {entry.action === 'ADD' ? '+' : '-'} {entry.action}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-foreground">{entry.quantity} units</td>
                                            <td className="px-4 py-3 text-muted-foreground text-sm">{dayjs(entry.timestamp).format('DD/MM/YYYY HH:mm')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Modal
                isOpen={stockModal}
                onClose={() => setStockModal(false)}
                title={`${modalType === 'add' ? 'Add to' : 'Deduct from'} ${selectedItem?.name}`}
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setStockModal(false)} disabled={processing}>Cancel</Button>
                        <Button onClick={handleUpdateStock} loading={processing} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            {modalType === 'add' ? 'Add Stock' : 'Deduct Stock'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Current Stock</p>
                        <p className="text-2xl font-bold text-foreground">{selectedItem?.quantity} units</p>
                    </div>
                    <Input
                        label={`Quantity to ${modalType} (units)`}
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