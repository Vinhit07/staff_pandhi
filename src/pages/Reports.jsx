import { useState, useEffect, useRef } from 'react';
import { Download, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Loader } from '../components/ui';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, PieChart, Pie, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../hooks/useAuth';
import { reportService } from '../services';

// Chart colors using Admin app theme
const CHART_COLORS = {
    primary: '#D04F99',
    secondary: '#8ACFD1',
    accent: '#FBE2A7',
    chart1: '#E670AB',
    chart2: '#84D2E2',
    chart3: '#FBE2A7',
    chart4: '#F3A0CA',
    chart5: '#D7488E',
};



export const Reports = () => {
    const { outlet } = useAuth();
    const outletId = outlet?.id;
    const reportRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const [fromDate, setFromDate] = useState(dayjs().subtract(7, 'day').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));

    const [salesTrend, setSalesTrend] = useState([]);
    const [orderTypeBreakdown, setOrderTypeBreakdown] = useState([]);
    const [categoryBreakdown, setCategoryBreakdown] = useState([]);
    const [deliveryTimeOrders, setDeliveryTimeOrders] = useState([]);

    useEffect(() => {
        loadData();
    }, [fromDate, toDate, outletId]);

    const loadData = async () => {
        if (!outletId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            // Fetch all chart data in parallel
            const [salesData, categoryData, orderTypeData, deliveryData] = await Promise.all([
                reportService.getSalesTrend(outletId, { from: fromDate, to: toDate }),
                reportService.getCategoryBreakdown(outletId, { from: fromDate, to: toDate }),
                reportService.getOrderTypeBreakdown(outletId, { from: fromDate, to: toDate }),
                reportService.getDeliveryTimeOrders(outletId, { from: fromDate, to: toDate }),
            ]);

            // Sales trend - apiRequest returns data directly
            setSalesTrend(Array.isArray(salesData) ? salesData : salesData.salesTrend || []);

            // Category breakdown with colors
            const categoriesWithColors = (Array.isArray(categoryData) ? categoryData : categoryData.breakdown || []).map((cat, idx) => ({
                ...cat,
                color: Object.values(CHART_COLORS)[idx % 8],
            }));
            setCategoryBreakdown(categoriesWithColors);

            // Order type with colors  
            const orderTypesWithColors = (Array.isArray(orderTypeData) ? orderTypeData : orderTypeData.breakdown || []).map((type, idx) => ({
                ...type,
                color: idx === 0 ? CHART_COLORS.primary : CHART_COLORS.secondary,
            }));
            setOrderTypeBreakdown(orderTypesWithColors);

            // Delivery time orders
            setDeliveryTimeOrders(Array.isArray(deliveryData) ? deliveryData : deliveryData.orders || []);

        } catch (error) {
            console.error('Error loading report data:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const setQuickRange = (days) => {
        setToDate(dayjs().format('YYYY-MM-DD'));
        setFromDate(dayjs().subtract(days, 'day').format('YYYY-MM-DD'));
    };

    const handleExportPDF = async () => {
        if (!reportRef.current) return;

        setExporting(true);
        toast.loading('Generating PDF...');

        try {
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`Staff_Report_${fromDate}_to_${toDate}.pdf`);
            toast.dismiss();
            toast.success('PDF downloaded successfully!');
        } catch (error) {
            toast.dismiss();
            toast.error('Failed to generate PDF');
            console.error(error);
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader size="lg" text="Loading reports..." />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
                    <p className="text-muted-foreground">View sales trends and performance metrics</p>
                </div>
                <Button onClick={handleExportPDF} loading={exporting}>
                    <Download className="h-4 w-4" />
                    Download Report
                </Button>
            </div>

            {/* Date Range Controls */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex gap-2">
                            <Button
                                variant={dayjs(toDate).diff(fromDate, 'day') === 7 ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setQuickRange(7)}
                            >
                                7 Days
                            </Button>
                            <Button
                                variant={dayjs(toDate).diff(fromDate, 'day') === 30 ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setQuickRange(30)}
                            >
                                30 Days
                            </Button>
                            <Button
                                variant={dayjs(toDate).diff(fromDate, 'day') === 90 ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setQuickRange(90)}
                            >
                                90 Days
                            </Button>
                        </div>

                        <div className="flex items-center gap-2 ml-auto">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="px-3 py-2 border-2 border-input rounded-lg text-sm bg-background text-foreground
                  focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                            <span className="text-muted-foreground">to</span>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="px-3 py-2 border-2 border-input rounded-lg text-sm bg-background text-foreground
                  focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts */}
            <div ref={reportRef} className="space-y-6 bg-card p-4 rounded-xl border-2 border-border">
                {/* Row 1: Sales Trend + Order Type */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={salesTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                                    <Bar dataKey="revenue" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order Type Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={orderTypeBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {orderTypeBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Row 2: Category + Delivery Time */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Wise Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={categoryBreakdown}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {categoryBreakdown.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Orders by Delivery Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={deliveryTimeOrders}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="slot" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="orders"
                                        stroke={CHART_COLORS.primary}
                                        strokeWidth={3}
                                        dot={{ fill: CHART_COLORS.primary, strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Reports;
