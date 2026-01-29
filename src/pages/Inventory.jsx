import { useState } from 'react';
import { Search, Plus, Minus, Package, RefreshCw, History } from 'lucide-react';
import { Card, CardContent, Badge, Button, Modal, Input } from '../components/ui';
import { CATEGORIES } from '../utils/constants';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

// Mock inventory
const MOCK_INVENTORY = [
    { id: 1, name: 'Chicken Breast', category: 'Meals', stock: 25, minimum: 20, unit: 'kg', status: 'good' },
    { id: 2, name: 'Paneer', category: 'Meals', stock: 12, minimum: 15, unit: 'kg', status: 'warning' },
    { id: 3, name: 'Rice', category: 'Meals', stock: 50, minimum: 30, unit: 'kg', status: 'good' },
    { id: 4, name: 'Cooking Oil', category: 'Starters', stock: 8, minimum: 20, unit: 'L', status: 'low' },
    { id: 5, name: 'Mango Pulp', category: 'Beverages', stock: 15, minimum: 10, unit: 'L', status: 'good' },
    { id: 6, name: 'Sugar', category: 'Desserts', stock: 5, minimum: 10, unit: 'kg', status: 'low' },
];

const MOCK_HISTORY = [
    { id: 1, item: 'Chicken Breast', type: 'add', qty: 10, unit: 'kg', date: '2026-01-28T10:30:00', by: 'John Staff' },
    { id: 2, item: 'Rice', type: 'deduct', qty: 5, unit: 'kg', date: '2026-01-28T09:15:00', by: 'John Staff' },
    { id: 3, item: 'Paneer', type: 'add', qty: 8, unit: 'kg', date: '2026-01-27T14:00:00', by: 'Admin' },
    { id: 4, item: 'Cooking Oil', type: 'deduct', qty: 3, unit: 'L', date: '2026-01-27T11:30:00', by: 'John Staff' },
];

export const Inventory = () => {
    const [activeTab, setActiveTab] = useState('stock');
    const [inventory, setInventory] = useState(MOCK_INVENTORY);
    const [history] = useState(MOCK_HISTORY);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    // Stock modal
    const [stockModal, setStockModal] = useState(false);
    const [modalType, setModalType] = useState('add');
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState('');

    // Filter inventory
    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Refresh
    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
            toast.success('Data refreshed');
        }, 500);
    };

    // Open stock modal
    const openStockModal = (item, type) => {
        setSelectedItem(item);
        setModalType(type);
        setQuantity('');
        setStockModal(true);
    };

    // Update stock
    const handleUpdateStock = () => {
        const qty = parseInt(quantity);
        if (!qty || qty <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        setInventory(prev => prev.map(item => {
            if (item.id === selectedItem.id) {
                const newStock = modalType === 'add' ? item.stock + qty : Math.max(0, item.stock - qty);
                let status = 'good';
                if (newStock < item.minimum * 0.5) status = 'low';
                else if (newStock < item.minimum) status = 'warning';
                return { ...item, stock: newStock, status };
            }
            return item;
        }));

        toast.success(`${modalType === 'add' ? 'Added' : 'Deducted'} ${qty} ${selectedItem.unit} of ${selectedItem.name}`);
        setStockModal(false);
    };

    // Status badge variant
    const getStatusVariant = (status) => {
        switch (status) {
            case 'good': return 'success';
            case 'warning': return 'warning';
            case 'low': return 'destructive';
            default: return 'default';
        }
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredInventory.map(item => (
                            <Card key={item.id}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-semibold text-foreground">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">{item.category}</p>
                                        </div>
                                        <Badge variant={getStatusVariant(item.status)}>
                                            {item.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <div className="bg-muted/30 rounded-lg p-3 mb-3">
                                        <p className="text-xs text-muted-foreground">Current Stock</p>
                                        <p className="text-xl font-bold text-foreground">
                                            {item.stock} <span className="text-sm font-normal text-muted-foreground">{item.unit}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">Min: {item.minimum} {item.unit}</p>
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
                                    {history.map(entry => (
                                        <tr key={entry.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">{entry.item}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={entry.type === 'add' ? 'success' : 'warning'}>
                                                    {entry.type === 'add' ? '+' : '-'} {entry.type.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-foreground">
                                                {entry.qty} {entry.unit}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-sm">
                                                {dayjs(entry.date).format('DD/MM/YYYY HH:mm')}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground text-sm">{entry.by}</td>
                                        </tr>
                                    ))}
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
                        <Button variant="ghost" onClick={() => setStockModal(false)}>Cancel</Button>
                        <Button onClick={handleUpdateStock}>
                            {modalType === 'add' ? 'Add Stock' : 'Deduct Stock'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Current Stock</p>
                        <p className="text-2xl font-bold text-foreground">
                            {selectedItem?.stock} {selectedItem?.unit}
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
