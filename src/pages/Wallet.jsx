import { useState } from 'react';
import { RefreshCw, Search, Plus, Wallet as WalletIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button, Modal, Input } from '../components/ui';
import { formatCurrency, formatDate } from '../utils/constants';
import toast from 'react-hot-toast';

// Mock recharge history
const MOCK_RECHARGES = [
    { id: 'TXN001', customerId: 1, customerName: 'Rahul Sharma', date: '2026-01-28', amount: 500, method: 'CASH' },
    { id: 'TXN002', customerId: 2, customerName: 'Priya Patel', date: '2026-01-28', amount: 1000, method: 'UPI' },
    { id: 'TXN003', customerId: 3, customerName: 'Amit Kumar', date: '2026-01-27', amount: 750, method: 'CARD' },
    { id: 'TXN004', customerId: 4, customerName: 'Sneha Reddy', date: '2026-01-27', amount: 300, method: 'CASH' },
    { id: 'TXN005', customerId: 5, customerName: 'Vikram Singh', date: '2026-01-26', amount: 2000, method: 'UPI' },
];

export const Wallet = () => {
    const [recharges, setRecharges] = useState(MOCK_RECHARGES);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Recharge modal
    const [rechargeModal, setRechargeModal] = useState(false);
    const [formData, setFormData] = useState({
        customerId: '',
        amount: '',
        method: 'CASH',
        notes: '',
    });
    const [processing, setProcessing] = useState(false);

    // Filter recharges
    const filteredRecharges = recharges.filter(r =>
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle refresh
    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            toast.success('Data refreshed');
        }, 500);
    };

    // Handle form change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle recharge
    const handleRecharge = async () => {
        if (!formData.customerId) {
            toast.error('Please enter customer ID');
            return;
        }

        const amount = parseFloat(formData.amount);
        if (!amount || amount <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        setProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const newRecharge = {
            id: `TXN${String(recharges.length + 1).padStart(3, '0')}`,
            customerId: parseInt(formData.customerId),
            customerName: `Customer ${formData.customerId}`,
            date: new Date().toISOString().split('T')[0],
            amount: amount,
            method: formData.method,
        };

        setRecharges(prev => [newRecharge, ...prev]);

        toast.success(`Wallet recharged with ${formatCurrency(amount)}`);
        setRechargeModal(false);
        setFormData({ customerId: '', amount: '', method: 'CASH', notes: '' });
        setProcessing(false);
    };

    // Get method badge variant
    const getMethodVariant = (method) => {
        switch (method) {
            case 'CASH': return 'success';
            case 'UPI': return 'info';
            case 'CARD': return 'secondary';
            default: return 'default';
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Wallet Recharge</h1>
                    <p className="text-muted-foreground">Manage customer wallet recharges</p>
                </div>
                <Button onClick={() => setRechargeModal(true)}>
                    <Plus className="h-4 w-4" />
                    Manual Recharge
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Today's Recharges</CardDescription>
                        <CardTitle className="text-3xl text-primary">
                            {formatCurrency(recharges.filter(r => r.date === '2026-01-28').reduce((sum, r) => sum + r.amount, 0))}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            {recharges.filter(r => r.date === '2026-01-28').length} transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>This Week</CardDescription>
                        <CardTitle className="text-3xl text-secondary">
                            {formatCurrency(recharges.reduce((sum, r) => sum + r.amount, 0))}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">
                            {recharges.length} transactions
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardDescription>Average Recharge</CardDescription>
                        <CardTitle className="text-3xl text-foreground">
                            {formatCurrency(recharges.reduce((sum, r) => sum + r.amount, 0) / recharges.length || 0)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Per transaction</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recharge History */}
            <Card>
                <CardHeader>
                    <CardTitle>Recharge History</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div className="relative flex-1 min-w-[250px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by Transaction ID or Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-input rounded-lg bg-background text-foreground
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <Button variant="ghost" onClick={handleRefresh}>
                            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Transaction ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Method</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredRecharges.length > 0 ? (
                                    filteredRecharges.map(recharge => (
                                        <tr key={recharge.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-mono font-medium text-foreground">#{recharge.id}</td>
                                            <td className="px-4 py-3 text-foreground">{recharge.customerName}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{formatDate(recharge.date)}</td>
                                            <td className="px-4 py-3">
                                                <Badge variant={getMethodVariant(recharge.method)}>{recharge.method}</Badge>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-primary">
                                                {formatCurrency(recharge.amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                                            No transactions found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Manual Recharge Modal */}
            <Modal
                isOpen={rechargeModal}
                onClose={() => {
                    setRechargeModal(false);
                    setFormData({ customerId: '', amount: '', method: 'CASH', notes: '' });
                }}
                title="Manual Wallet Recharge"
                footer={
                    <>
                        <Button variant="ghost" onClick={() => setRechargeModal(false)}>Cancel</Button>
                        <Button onClick={handleRecharge} loading={processing}>Recharge Wallet</Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <Input
                        label="Customer ID"
                        type="number"
                        name="customerId"
                        value={formData.customerId}
                        onChange={handleChange}
                        placeholder="Enter customer ID"
                    />

                    <Input
                        label="Amount"
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="Enter amount"
                        min="1"
                    />

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Payment Method
                        </label>
                        <select
                            name="method"
                            value={formData.method}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border-2 border-input rounded-lg bg-background text-foreground
                focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="CASH">Cash</option>
                            <option value="CARD">Card</option>
                            <option value="UPI">UPI</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Any additional notes..."
                            rows={3}
                            className="w-full px-4 py-2.5 border-2 border-input rounded-lg bg-background text-foreground
                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Wallet;
