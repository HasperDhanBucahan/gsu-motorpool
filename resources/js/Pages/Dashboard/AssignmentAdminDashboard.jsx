import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Clock, CheckCircle, Car, Users, AlertTriangle, Activity, Calendar } from 'lucide-react';
import CalendarWidget from '@/Components/CalendarWidget';
import EmptyState from '@/Components/EmptyState';

export default function AssignmentAdminDashboard({ data }) {
    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Assignment Dashboard" />
                
            <div className="py-10 bg-gray-50 min-h-[calc(100vh-80px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                title="Pending Assignments"
                                value={data.pendingAssignments}
                                icon={Clock}
                                color="amber"
                                subtitle="Needs attention"
                                link={route('assignment.requests.index')}
                            />
                            <StatCard
                                title="Assigned Requests"
                                value={data.assignedRequests}
                                icon={CheckCircle}
                                color="blue"
                                subtitle="Forwarded"
                            />
                            <StatCard
                                title="Available Vehicles"
                                value={`${data.availableVehicles}/${data.totalVehicles}`}
                                icon={Car}
                                color="green"
                                subtitle="Ready for assignment"
                                link={route('assignment.vehicles')}
                            />
                            <StatCard
                                title="Available Drivers"
                                value={`${data.availableDrivers}/${data.totalDrivers}`}
                                icon={Users}
                                color="purple"
                                subtitle="On standby"
                                link={route('assignment.drivers')}
                            />
                        </div>

                        {/* Active Today Banner */}
                        {data.activeToday > 0 && (
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                            <Activity className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold">{data.activeToday} Active {data.activeToday === 1 ? 'Trip' : 'Trips'}</h3>
                                            <p className="text-white/90 text-sm">Vehicles and drivers currently deployed today</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Conflicts Alert */}
                        {data.conflicts && data.conflicts.length > 0 && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center gap-3">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Scheduling Conflicts Detected</h3>
                                        <p className="text-red-100 text-sm">{data.conflicts.length} conflict{data.conflicts.length !== 1 ? 's' : ''} need{data.conflicts.length === 1 ? 's' : ''} resolution</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {data.conflicts.slice(0, 5).map((conflict, idx) => (
                                            <div key={idx} className="flex items-start gap-4 p-4 bg-white border border-red-200 rounded-lg">
                                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {conflict.type === 'vehicle' ? '🚗 Vehicle' : '👤 Driver'} Conflict: {conflict.resource}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        <span className="font-medium">{conflict.requester}</span> and <span className="font-medium">{conflict.conflicting_requester}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">{conflict.datetime}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {data.conflicts.length > 5 && (
                                        <p className="text-sm text-gray-600 mt-4 text-center">
                                            +{data.conflicts.length - 5} more conflicts
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Pending Queue - 2 columns */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-100 px-6 py-4 border-b border-amber-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">Pending Assignment Queue</h3>
                                                <p className="text-sm text-gray-600 mt-0.5">
                                                    {data.pendingQueue?.length || 0} request{data.pendingQueue?.length !== 1 ? 's' : ''} awaiting assignment
                                                </p>
                                            </div>
                                            <Link
                                                href={route('assignment.requests.index')}
                                                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                                            >
                                                View All
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        {data.pendingQueue && data.pendingQueue.length > 0 ? (
                                            <div className="space-y-3">
                                                {data.pendingQueue.map((request, idx) => (
                                                    <Link
                                                        key={request.id}
                                                        href={route('assignment.requests.assign.view', request.id)}
                                                        className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-gray-50"
                                                        style={{
                                                            animation: `slideIn 0.3s ease-out ${idx * 0.05}s both`
                                                        }}
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-gray-900 truncate">
                                                                    {request.requester}
                                                                </h4>
                                                                <p className="text-sm text-gray-600 mt-0.5 truncate">
                                                                    {request.destination}
                                                                </p>
                                                            </div>
                                                            {request.days_waiting > 2 && (
                                                                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                                                                    {request.days_waiting}d waiting
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                {request.date_of_travel}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                {request.time_of_travel}
                                                            </span>
                                                            <span className="text-gray-400">•</span>
                                                            <span>{request.formatted_duration}</span>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState
                                                icon={CheckCircle}
                                                title="No pending assignments"
                                                description="All requests have been assigned. Great job!"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Assigned Today - 1 column */}
                            <div>
                                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-100 px-6 py-4 border-b border-blue-200">
                                        <h3 className="text-lg font-bold text-gray-900">Assigned Today</h3>
                                        <p className="text-sm text-gray-600 mt-0.5">Recent assignments</p>
                                    </div>
                                    <div className="p-6">
                                        {data.assignedToday && data.assignedToday.length > 0 ? (
                                            <div className="space-y-3">
                                                {data.assignedToday.map((request, idx) => (
                                                    <div
                                                        key={request.id}
                                                        className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-3"
                                                        style={{
                                                            animation: `slideIn 0.3s ease-out ${idx * 0.1}s both`
                                                        }}
                                                    >
                                                        <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                                            {request.requester}
                                                        </h4>
                                                        <p className="text-xs text-gray-600 truncate mb-2">
                                                            {request.destination}
                                                        </p>
                                                        <div className="space-y-1 text-xs text-gray-600">
                                                            <p>🚗 {request.vehicle}</p>
                                                            <p>👤 {request.driver}</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            Assigned at {request.assigned_at}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState
                                                icon={Clock}
                                                title="No assignments today"
                                                description="No requests have been assigned yet today."
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Calendar Widget */}
                        <CalendarWidget userRole="assignment_admin" />

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
function StatCard({ title, value, icon: Icon, color, subtitle, link }) {
    const colorClasses = {
        amber: 'from-amber-500 to-orange-600',
        blue: 'from-blue-500 to-indigo-600',
        green: 'from-green-500 to-emerald-600',
        purple: 'from-purple-500 to-indigo-600',
    };

    const content = (
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
    );

    return link ? (
        <Link
            href={link}
            className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-200 transform hover:scale-105 block"
        >
            {content}
        </Link>
    ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {content}
        </div>
    );
}