import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Clock, CheckCircle, Calendar as CalendarIcon, Plus, TrendingUp, MapPin, User } from 'lucide-react';
import CalendarWidget from '@/Components/CalendarWidget';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';

export default function ClientDashboard({ data }) {
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        return new Date(`2000-01-01 ${timeStr}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            
            <div className="py-10 bg-gray-50 min-h-[calc(100vh-80px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Hero Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Pending Requests */}
                            <StatCard
                                title="Pending"
                                value={data.pendingRequests}
                                icon={Clock}
                                color="amber"
                                subtitle="Awaiting assignment"
                            />

                            {/* Assigned Requests */}
                            <StatCard
                                title="Assigned"
                                value={data.assignedRequests}
                                icon={TrendingUp}
                                color="blue"
                                subtitle="Awaiting approval"
                            />

                            {/* Approved Requests */}
                            <StatCard
                                title="Approved"
                                value={data.approvedRequests}
                                icon={CheckCircle}
                                color="green"
                                subtitle="Ready to go"
                            />

                            {/* Active Today */}
                            <StatCard
                                title="Active Today"
                                value={data.activeToday}
                                icon={CalendarIcon}
                                color="purple"
                                subtitle="Trips happening now"
                            />

                            {/* Completed */}
                            <StatCard
                                title="Completed"
                                value={data.completedRequests}
                                icon={CheckCircle}
                                color="gray"
                                subtitle="Past trips"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="flex justify-end">
                            <Link
                                href={route('requests.create')}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
                            >
                                <Plus className="w-5 h-5" />
                                Request Vehicle
                            </Link>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Recent Requests Timeline - 2 columns */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-bold text-gray-900">Recent Requests</h3>
                                        <p className="text-sm text-gray-600 mt-0.5">Track your request history</p>
                                    </div>
                                    <div className="p-6">
                                        {data.recentRequests?.length > 0 ? (
                                            <div className="space-y-4">
                                                {data.recentRequests.map((request, idx) => (
                                                    <div
                                                        key={request.id}
                                                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
                                                        style={{
                                                            animation: `slideIn 0.3s ease-out ${idx * 0.1}s both`
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-start gap-3 flex-1">
                                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                    <MapPin className="w-5 h-5 text-white" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-semibold text-gray-900 truncate">
                                                                        {request.destination}
                                                                    </h4>
                                                                    <p className="text-sm text-gray-500 mt-0.5">
                                                                        {formatDate(request.date_of_travel)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <StatusBadge status={request.status} size="sm" />
                                                        </div>
                                                        
                                                        {(request.vehicle || request.driver) && (
                                                            <div className="ml-13 space-y-1">
                                                                {request.vehicle && (
                                                                    <p className="text-xs text-gray-600 flex items-center gap-1.5">
                                                                        <span className="font-medium">Vehicle:</span>
                                                                        <span>{request.vehicle}</span>
                                                                    </p>
                                                                )}
                                                                {request.driver && (
                                                                    <p className="text-xs text-gray-600 flex items-center gap-1.5">
                                                                        <span className="font-medium">Driver:</span>
                                                                        <span>{request.driver}</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState
                                                icon={Clock}
                                                title="No requests yet"
                                                description="Your request history will appear here once you submit a vehicle request."
                                                action={
                                                    <Link
                                                        href={route('requests.create')}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Create First Request
                                                    </Link>
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming Trips - 1 column */}
                            <div>
                                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-100 px-6 py-4 border-b border-green-200">
                                        <h3 className="text-lg font-bold text-gray-900">Upcoming Trips</h3>
                                        <p className="text-sm text-gray-600 mt-0.5">Your scheduled journeys</p>
                                    </div>
                                    <div className="p-6">
                                        {data.upcomingTrips?.length > 0 ? (
                                            <div className="space-y-3">
                                                {data.upcomingTrips.map((trip, idx) => (
                                                    <div
                                                        key={trip.id}
                                                        className="border-l-4 border-green-500 bg-green-50 rounded-r-lg p-3 hover:bg-green-100 transition-colors"
                                                        style={{
                                                            animation: `slideIn 0.3s ease-out ${idx * 0.1}s both`
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h4 className="font-semibold text-gray-900 text-sm">
                                                                {trip.destination}
                                                            </h4>
                                                        </div>
                                                        <div className="space-y-1 text-xs text-gray-600">
                                                            <p className="flex items-center gap-1.5">
                                                                <CalendarIcon className="w-3.5 h-3.5" />
                                                                {trip.date} at {trip.time}
                                                            </p>
                                                            <p className="flex items-center gap-1.5">
                                                                <User className="w-3.5 h-3.5" />
                                                                {trip.driver}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState
                                                icon={CalendarIcon}
                                                title="No upcoming trips"
                                                description="You don't have any approved trips scheduled."
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Widget */}
                        <CalendarWidget userRole="client" />

                        <style>{`
                            @keyframes slideIn {
                                from {
                                    opacity: 0;
                                    transform: translateY(10px);
                                }
                                to {
                                    opacity: 1;
                                    transform: translateY(0);
                                }
                            }
                        `}</style>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// Stat Card Component
function StatCard({ title, value, icon: Icon, color, subtitle }) {
    const colorClasses = {
        amber: 'from-amber-500 to-orange-600',
        blue: 'from-blue-500 to-indigo-600',
        green: 'from-green-500 to-emerald-600',
        purple: 'from-purple-500 to-indigo-600',
        gray: 'from-gray-500 to-slate-600',
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <div className={`bg-gradient-to-br ${colorClasses[color]} p-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-white/90 text-sm font-medium mb-1">{title}</p>
                        <p className="text-white text-3xl font-bold">{value}</p>
                        <p className="text-white/80 text-xs mt-1">{subtitle}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
}