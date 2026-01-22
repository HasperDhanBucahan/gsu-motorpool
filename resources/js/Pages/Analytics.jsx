import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Car, FileText, Clock, Download, Calendar, BarChart3, Activity } from 'lucide-react';

export default function Analytics({
    auth,
    isClient,
    dateRange,
    stats,
    statusDistribution,
    monthlyTrends,
    requestsByDepartment,
    vehicleUtilization,
    driverWorkload,
    fuelTrends,
    vehicleStatusDistribution,
    recentApproved,
    topVehicles,
    topDestinations,
    recentRequests,
}) {
    const [selectedRange, setSelectedRange] = useState(dateRange);
    const [showCustomDate, setShowCustomDate] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    const dateRangeOptions = [
        { value: 'last_7_days', label: 'Last 7 Days' },
        { value: 'last_30_days', label: 'Last 30 Days' },
        { value: 'last_3_months', label: 'Last 3 Months' },
        { value: 'last_6_months', label: 'Last 6 Months' },
        { value: 'this_year', label: 'This Year' },
        { value: 'all_time', label: 'All Time' },
        { value: 'custom', label: 'Custom Range' },
    ];

    const handleDateRangeChange = (range) => {
        setSelectedRange(range);
        if (range === 'custom') {
            setShowCustomDate(true);
        } else {
            setShowCustomDate(false);
            router.get(route('analytics.index'), { range }, { preserveState: true });
        }
    };

    const handleCustomDateSubmit = () => {
        if (customStart && customEnd) {
            router.get(
                route('analytics.index'),
                { range: 'custom', start_date: customStart, end_date: customEnd },
                { preserveState: true }
            );
        }
    };

    const handleExport = () => {
        window.print();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Client Analytics View
    if (isClient) {
        return (
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <div className="flex justify-between items-center gap-4">
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            My Analytics
                        </h2>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                        >
                            <Download className="w-4 h-4" />
                            Export Report
                        </button>
                    </div>
                }
            >
                <Head title="My Analytics" />

                {/* Date Range Filter */}
                <div className="mb-6 bg-white rounded-lg shadow p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Date Range:</span>
                        <select
                            value={selectedRange}
                            onChange={(e) => handleDateRangeChange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            {dateRangeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        {showCustomDate && (
                            <>
                                <input
                                    type="date"
                                    value={customStart}
                                    onChange={(e) => setCustomStart(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                                <span>to</span>
                                <input
                                    type="date"
                                    value={customEnd}
                                    onChange={(e) => setCustomEnd(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                />
                                <button
                                    onClick={handleCustomDateSubmit}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                                >
                                    Apply
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Requests</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total_requests}</p>
                            </div>
                            <FileText className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <Clock className="w-10 h-10 text-yellow-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                            </div>
                            <TrendingUp className="w-10 h-10 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
                            </div>
                            <Activity className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg Trip Days</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.avg_trip_duration}</p>
                            </div>
                            <Calendar className="w-10 h-10 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Request Trends */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request History (Last 6 Months)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Requests" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Destinations */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Frequent Destinations</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topDestinations}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="destination" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#10b981" name="Times Visited" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Vehicles & Recent Requests */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Vehicles */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Used Vehicles</h3>
                        <div className="space-y-3">
                            {topVehicles.map((vehicle, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Car className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{vehicle.vehicle?.description || 'Unknown'}</p>
                                            <p className="text-sm text-gray-500">{vehicle.vehicle?.plate_number || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <span className="text-lg font-semibold text-blue-600">{vehicle.count} trips</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Requests */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
                        <div className="space-y-3">
                            {recentRequests.map((request) => (
                                <div key={request.id} className="p-3 border border-gray-200 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-900">{request.destination}</span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                            request.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                            request.status === 'approved' || request.status === 'assigned' ? 'bg-green-100 text-green-700' :
                                            request.status === 'declined' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {request.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">{formatDate(request.date_of_travel)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // Admin Analytics View
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        System Analytics
                    </h2>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                    >
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            }
        >
            <Head title="Analytics Dashboard" />

            {/* Date Range Filter */}
            <div className="mb-6 bg-white rounded-lg shadow p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Date Range:</span>
                    <select
                        value={selectedRange}
                        onChange={(e) => handleDateRangeChange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                        {dateRangeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    {showCustomDate && (
                        <>
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                            <span>to</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                            />
                            <button
                                onClick={handleCustomDateSubmit}
                                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                            >
                                Apply
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Requests (This Month)</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.current_month_requests}</p>
                        </div>
                        <FileText className="w-10 h-10 text-blue-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Requests</p>
                            <p className="text-3xl font-bold text-yellow-600">{stats.pending_requests}</p>
                        </div>
                        <Clock className="w-10 h-10 text-yellow-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active Trips</p>
                            <p className="text-3xl font-bold text-green-600">{stats.active_trips}</p>
                        </div>
                        <Activity className="w-10 h-10 text-green-500" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Available Vehicles</p>
                            <p className="text-3xl font-bold text-blue-600">{stats.available_vehicles}</p>
                        </div>
                        <Car className="w-10 h-10 text-blue-500" />
                    </div>
                </div>
            </div>

            {/* Processing Time Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-100">Avg Approval Time</p>
                            <p className="text-3xl font-bold">{stats.avg_approval_time}h</p>
                        </div>
                        <Clock className="w-10 h-10 text-blue-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-100">Avg Assignment Time</p>
                            <p className="text-3xl font-bold">{stats.avg_assignment_time}h</p>
                        </div>
                        <Users className="w-10 h-10 text-green-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-100">Avg Ticket Generation</p>
                            <p className="text-3xl font-bold">{stats.avg_ticket_time}h</p>
                        </div>
                        <FileText className="w-10 h-10 text-purple-200" />
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Request Status Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusDistribution}
                                dataKey="count"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {statusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Request Trends */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Request Trends (Last 6 Months)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyTrends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Requests" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Requests by Department */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests by Department</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={requestsByDepartment}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#10b981" name="Requests" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Vehicle Status Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={vehicleStatusDistribution}
                                dataKey="count"
                                nameKey="status"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {vehicleStatusDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Vehicle Utilization */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Utilization (Trips per Vehicle)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={vehicleUtilization}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="vehicle" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="trips" fill="#f59e0b" name="Trips" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Driver Workload */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Driver Workload (Trips per Driver)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={driverWorkload}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="driver" angle={-45} textAnchor="end" height={100} />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="trips" fill="#8b5cf6" name="Trips" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Fuel Consumption Trends */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuel Consumption Trends (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={fuelTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="liters" stroke="#ef4444" strokeWidth={2} name="Liters" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top 5 Most Used Vehicles */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Most Used Vehicles</h3>
                    <div className="space-y-3">
                        {topVehicles.map((vehicle, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                        <span className="text-sm font-bold text-orange-600">{index + 1}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{vehicle.vehicle}</p>
                                        <p className="text-sm text-gray-500">{vehicle.plate_number}</p>
                                    </div>
                                </div>
                                <span className="text-lg font-semibold text-orange-600">{vehicle.trips} trips</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Approved Requests */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Approved Requests</h3>
                    <div className="space-y-3">
                        {recentApproved.slice(0, 5).map((request) => (
                            <div key={request.id} className="p-3 border border-gray-200 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-900">{request.user.name}</span>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        request.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                        request.status === 'approved' || request.status === 'assigned' ? 'bg-green-100 text-green-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {request.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-1">{request.destination}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{formatDate(request.date_of_travel)}</span>
                                    <span>•</span>
                                    <span>{request.vehicle?.plate_number || 'N/A'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}