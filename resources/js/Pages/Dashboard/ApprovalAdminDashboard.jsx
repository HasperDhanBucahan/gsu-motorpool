import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Pen, CheckCircle } from 'lucide-react';
import CalendarWidget from '@/Components/CalendarWidget';
import SignatureModal from '@/Components/SignatureModal';

export default function AssignmentAdminDashboard({ data }) {
    const { auth } = usePage().props;
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            active: 'bg-green-100 text-green-800',
            completed: 'bg-blue-100 text-blue-800',
            pending: 'bg-yellow-100 text-yellow-800',
        };
        return `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`;
    };

    return (
        <div className="space-y-6">
            {/* Signature Section
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Digital Signature</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Your signature will be used on approved documents
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {auth.user?.signature_path ? (
                            <div className="flex items-center gap-3">
                                <div className="border rounded-lg p-2 bg-gray-50">
                                    <img 
                                        src={`/storage/${auth.user.signature_path}`} 
                                        alt="Current Signature" 
                                        className="h-12 max-w-xs object-contain"
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Signature Set</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-amber-600">No signature set</p>
                        )}
                        
                        <button
                            onClick={() => setIsSignatureModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                            <Pen className="w-4 h-4" />
                            {auth.user?.signature_path ? 'Update Signature' : 'Create Signature'}
                        </button>
                    </div>
                </div>
            </div> */}

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    title="Pending Assignments"
                    value={data?.stats?.pending_assignments || 0}
                    icon="clock"
                    color="yellow"
                    link={route('admin.requests.management')}
                />
                <StatCard
                    title="Active Assignments"
                    value={data?.stats?.active_assignments || 0}
                    icon="activity"
                    color="green"
                />
                <StatCard
                    title="Available Vehicles"
                    value={data?.stats?.available_vehicles || 0}
                    icon="truck"
                    color="blue"
                />
                <StatCard
                    title="Available Drivers"
                    value={data?.stats?.available_drivers || 0}
                    icon="users"
                    color="purple"
                />
            </div>

            {/* Recent Activity
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Recent Assignments
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Latest vehicle and driver assignments
                    </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    {!data?.recentActivity?.length ? (
                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full table-auto">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Requester</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Vehicle</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Driver</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Updated</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {data.recentActivity.map((assignment) => (
                                        <tr key={assignment.id}>
                                            <td className="px-4 py-2 text-sm font-medium text-gray-900">
                                                {assignment.request.user.name}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {assignment.vehicle ? `${assignment.vehicle.make} ${assignment.vehicle.description}` : 'N/A'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {assignment.driver ? assignment.driver.name : 'N/A'}
                                            </td>
                                            <td className="px-4 py-2">
                                                <span className={getStatusBadge(assignment.status)}>
                                                    {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-500">
                                                {formatDateTime(assignment.updated_at)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div> */}

            <CalendarWidget userRole="approval_admin" />

            {/* Signature Modal */}
            <SignatureModal 
                isOpen={isSignatureModalOpen}
                closeModal={() => setIsSignatureModalOpen(false)}
                currentSignature={auth.user?.signature_path}
            />
        </div>
    );
}

function StatCard({ title, value, icon, color, link }) {
    const iconColors = {
        yellow: 'bg-yellow-100 text-yellow-600',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    const icons = {
        clock: (
            <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
            />
        ),
        activity: (
            <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
            />
        ),
        truck: (
            <>
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </>
        ),
        users: (
            <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
            />
        ),
    };

    const content = (
        <div className="p-5">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${iconColors[color]}`}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            {icons[icon]}
                        </svg>
                    </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd className="text-lg font-medium text-gray-900">{value}</dd>
                    </dl>
                </div>
            </div>
        </div>
    );

    return link ? (
        <Link href={link} className="block bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition">
            {content}
        </Link>
    ) : (
        <div className="bg-white overflow-hidden shadow rounded-lg">{content}</div>
    );
}