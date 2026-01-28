
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Clock, CheckCircle, XCircle, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import CalendarWidget from '@/Components/CalendarWidget';
import StatusBadge from '@/Components/StatusBadge';
import EmptyState from '@/Components/EmptyState';

export default function ApprovalAdminDashboard({ data }) {
    const formatDateTime = (dateStr) => {
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
            <Head title="Approval Dashboard" />
            
            <div className="py-10 bg-gray-50 min-h-[calc(100vh-80px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Pending Approvals"
                    value={data.pendingApprovals}
                    icon={Clock}
                    color="amber"
                    subtitle="Awaiting decision"
                    link={route('admin.requests.management')}
                />
                <StatCard
                    title="Approved Today"
                    value={data.approvedToday}
                    icon={CheckCircle}
                    color="green"
                    subtitle="Completed"
                />
                <StatCard
                    title="Declined This Week"
                    value={data.declinedThisWeek}
                    icon={XCircle}
                    color="red"
                    subtitle="Rejected"
                />
                <StatCard
                    title="Approval Rate"
                    value={`${data.approvalRate}%`}
                    icon={TrendingUp}
                    color="blue"
                    subtitle="This month"
                />
            </div>

            {/* Urgent Requests Alert */}
            {data.urgentRequests && data.urgentRequests.length > 0 && (
                <div className="bg-gradient-to-r from-red-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-1">⚠️ Urgent Approvals Needed</h3>
                            <p className="text-white/90 text-sm mb-3">
                                {data.urgentRequests.length} request{data.urgentRequests.length !== 1 ? 's' : ''} with travel dates within 48 hours
                            </p>
                            <div className="space-y-2">
                                {data.urgentRequests.slice(0, 3).map((request) => (
                                    <div key={request.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                        <p className="font-semibold">{request.requester} → {request.destination}</p>
                                        <p className="text-sm text-white/80 mt-1">
                                            Departing in {request.hours_until} hours ({request.start_datetime})
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Approvals Queue - 2 columns */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-50 to-orange-100 px-6 py-4 border-b border-amber-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Pending Approval Queue</h3>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                        {data.pendingQueue?.length || 0} request{data.pendingQueue?.length !== 1 ? 's' : ''} awaiting your review
                                    </p>
                                </div>
                                <Link
                                    href={route('admin.requests.management')}
                                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                                >
                                    Review All
                                </Link>
                            </div>
                        </div>
                        <div className="p-6">
                            {data.pendingQueue && data.pendingQueue.length > 0 ? (
                                <div className="space-y-3">
                                    {data.pendingQueue.map((request, idx) => (
                                        <Link
                                            key={request.id}
                                            href={route('admin.requests.preview-approval', request.id)}
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
                                            <div className="grid grid-cols-2 gap-3 mb-3">
                                                <div className="text-xs">
                                                    <span className="text-gray-500">Vehicle:</span>
                                                    <p className="font-medium text-gray-700 truncate">{request.vehicle}</p>
                                                </div>
                                                <div className="text-xs">
                                                    <span className="text-gray-500">Driver:</span>
                                                    <p className="font-medium text-gray-700 truncate">{request.driver}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {request.date_of_travel}
                                                </span>
                                                <span className="text-gray-400">•</span>
                                                <span>{request.time_of_travel}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={CheckCircle}
                                    title="All caught up!"
                                    description="There are no requests pending your approval."
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Decisions - 1 column */}
                <div>
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-100 px-6 py-4 border-b border-blue-200">
                            <h3 className="text-lg font-bold text-gray-900">Recent Decisions</h3>
                            <p className="text-sm text-gray-600 mt-0.5">Your approval history</p>
                        </div>
                        <div className="p-6">
                            {data.recentDecisions && data.recentDecisions.length > 0 ? (
                                <div className="space-y-3">
                                    {data.recentDecisions.map((decision, idx) => (
                                        <div
                                            key={decision.id}
                                            className={`border-l-4 rounded-r-lg p-3 ${
                                                decision.status === 'approved'
                                                    ? 'border-green-500 bg-green-50'
                                                    : 'border-red-500 bg-red-50'
                                            }`}
                                            style={{
                                                animation: `slideIn 0.3s ease-out ${idx * 0.1}s both`
                                            }}
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <h4 className="font-semibold text-gray-900 text-sm">
                                                    {decision.requester}
                                                </h4>
                                                <StatusBadge status={decision.status} size="sm" />
                                            </div>
                                            <p className="text-xs text-gray-600 truncate mb-1">
                                                {decision.destination}
                                            </p>
                                            {decision.decline_reason && (
                                                <p className="text-xs text-red-700 bg-red-100 rounded px-2 py-1 mt-2">
                                                    Reason: {decision.decline_reason}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-2">
                                                {decision.decision_at}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Clock}
                                    title="No recent decisions"
                                    description="Your approval history will appear here."
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Calendar Widget */}
            <CalendarWidget userRole="approval_admin" />

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
        green: 'from-green-500 to-emerald-600',
        red: 'from-red-500 to-rose-600',
        blue: 'from-blue-500 to-indigo-600',
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