import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    Calendar, Clock, MapPin, Users, Car, User as UserIcon, 
    Edit3, Trash2, CheckCircle, XCircle, AlertCircle, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import RequestDetailModal from '@/Components/RequestDetailModal';
import { Eye } from 'lucide-react';

export default function MyRequests({ 
    auth, 
    pendingRequests,
    assignedRequests, 
    approvedRequests,
    completedRequests,
    declinedRequests
}) {
    const [activeTab, setActiveTab] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const tabs = [
        { id: 'pending', label: 'Pending', count: pendingRequests.length, color: 'yellow' },
        { id: 'assigned', label: 'Assigned', count: assignedRequests.length, color: 'blue' },
        { id: 'approved', label: 'Approved', count: approvedRequests.length, color: 'green' },
        { id: 'completed', label: 'Completed', count: completedRequests.length, color: 'purple' },
        { id: 'declined', label: 'Declined', count: declinedRequests.length, color: 'red' }
    ];

    const getCurrentRequests = () => {
        switch(activeTab) {
            case 'pending': return pendingRequests;
            case 'assigned': return assignedRequests;
            case 'approved': return approvedRequests;
            case 'completed': return completedRequests;
            case 'declined': return declinedRequests;
            default: return [];
        }
    };

    const currentRequests = getCurrentRequests();

    const openDetailModal = (request) => {
        setSelectedRequest(request);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedRequest(null);
    };

    // Filter requests
    const filteredRequests = currentRequests.filter(request => {
        const matchesSearch = 
            request.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.purpose.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesSearch;
    });

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMM d, yyyy');
    };

    const formatTime = (timeString) => {
        return format(new Date(`2000-01-01 ${timeString}`), 'h:mm a');
    };

    const handleDelete = (requestId) => {
        if (confirm('Are you sure you want to delete this request?')) {
            router.delete(route('client.requests.destroy', requestId));
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
            assigned: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Assigned' },
            approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
            completed: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Completed' },
            declined: { bg: 'bg-red-100', text: 'text-red-800', label: 'Declined' },
        };
        
        const badge = badges[status] || badges.pending;
        
        return (
            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const getTabColor = (color) => {
        const colors = {
            blue: 'border-blue-500 text-blue-600',
            yellow: 'border-yellow-500 text-yellow-600',
            green: 'border-green-500 text-green-600',
            purple: 'border-purple-500 text-purple-600',
            red: 'border-red-500 text-red-600'
        };
        return colors[color] || 'border-gray-500 text-gray-600';
    };

    const getCardBorderColor = () => {
        const colors = {
            approved: 'border-green-200',
            completed: 'border-purple-200',
            declined: 'border-red-200',
            assigned: 'border-blue-200',
            pending: 'border-gray-200'
        };
        return colors[activeTab] || 'border-gray-200';
    };

    const getCardStripeColor = () => {
        const colors = {
            approved: 'bg-gradient-to-r from-green-400 to-green-500',
            completed: 'bg-gradient-to-r from-purple-400 to-purple-500',
            declined: 'bg-gradient-to-r from-red-400 to-red-500',
            assigned: 'bg-gradient-to-r from-blue-400 to-blue-500',
            pending: 'bg-gradient-to-r from-yellow-400 to-yellow-500'
        };
        return colors[activeTab] || 'bg-gradient-to-r from-yellow-400 to-yellow-500';
    };

    const getIconBgColor = () => {
        const colors = {
            approved: 'bg-green-50',
            completed: 'bg-purple-50',
            declined: 'bg-red-50',
            assigned: 'bg-blue-50',
            pending: 'bg-yellow-50'
        };
        return colors[activeTab] || 'bg-yellow-50';
    };

    const getIconColor = () => {
        const colors = {
            approved: 'text-green-600',
            completed: 'text-purple-600',
            declined: 'text-red-600',
            assigned: 'text-blue-600',
            pending: 'text-yellow-600'
        };
        return colors[activeTab] || 'text-yellow-600';
    };

    const RequestCard = ({ request, showActions = false }) => (
        <div 
            className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${getCardBorderColor()}`}
        >
            {/* Status indicator stripe */}
            <div className={`h-1 ${getCardStripeColor()}`}></div>
            
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconBgColor()}`}>
                            <MapPin className={`w-6 h-6 ${getIconColor()}`} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-xl text-gray-900">
                                {request.destination}
                            </h3>
                            <p className="text-gray-600 mt-1">
                                {request.purpose}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        
                        {showActions && (
                            <div className="flex items-center gap-1 ml-2">
                                <button
                                    onClick={() => router.visit(route('client.requests.edit', request.id))}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit request"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(request.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete request"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Passengers</p>
                            <p className="font-medium text-gray-900 text-sm">
                                {request.authorized_passengers}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Date</p>
                            <p className="font-medium text-gray-900">
                                {formatDate(request.date_of_travel)}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                            <Clock className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Time & Duration</p>
                            <p className="font-medium text-gray-900">
                                {formatTime(request.time_of_travel)}
                                <span className="text-gray-500 text-sm ml-1">
                                    ({request.days_of_travel}d)
                                </span>
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                            <FileText className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Submitted</p>
                            <p className="font-medium text-gray-900">
                                {formatDate(request.created_at)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Assignment Details - Show for assigned, approved, and completed */}
                {(activeTab === 'assigned' || activeTab === 'approved' || activeTab === 'completed') && (
                    <div className="bg-gray-50 rounded-xl p-4 mt-4">
                        <h4 className="font-medium text-gray-900 mb-3 text-sm">Assignment Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                    <Car className="w-4 h-4 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Vehicle</p>
                                    <p className="font-medium text-gray-900">
                                        {request.vehicle ? 
                                            `${request.vehicle.description} (${request.vehicle.plate_number})` : 
                                            <span className="text-gray-400">Not assigned</span>
                                        }
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                                    <UserIcon className="w-4 h-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Driver</p>
                                    <p className="font-medium text-gray-900">
                                        {request.driver ? 
                                            request.driver.name : 
                                            <span className="text-gray-400">Not assigned</span>
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="mt-4 flex justify-end space-x-2">
                    <button
                        onClick={() => openDetailModal(request)}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1"
                    >
                        <Eye className="w-4 h-4" />
                        View Details
                    </button>
                    
                    {(activeTab === 'approved' || activeTab === 'completed' || activeTab === 'declined') && (
                        <>
                            <a
                                href={route('client.requests.pdf.preview', request.id)}
                                target="_blank"
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1"
                            >
                                <FileText className="w-4 h-4" />
                                View PDF
                            </a>
                            <a
                                href={route('client.requests.pdf', request.id)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1"
                            >
                                <FileText className="w-4 h-4" />
                                Download PDF
                            </a>
                        </>
                    )}
                </div>

                {/* Decline Reason */}
                {activeTab === 'declined' && request.decline_reason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-900 mb-1">Decline Reason:</p>
                        <p className="text-sm text-red-800">{request.decline_reason}</p>
                    </div>
                )}

                {/* Completed Badge */}
                {activeTab === 'completed' && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                        <p className="text-sm font-medium text-purple-900">
                            This trip has been completed
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout 
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Requests</h2>
                    </div>
                </div>
            }
        >
            <Head title="My Requests" />

            <div className="py-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {/* Tabs */}
                        <div className="border-b border-gray-200 overflow-x-auto">
                            <nav className="-mb-px flex">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-6 text-sm font-medium whitespace-nowrap ${
                                            activeTab === tab.id
                                                ? `border-b-2 ${getTabColor(tab.color)}`
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {tab.label} ({tab.count})
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Search Bar */}
                        <div className="p-6 bg-gray-50 border-b border-gray-200">
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search by destination or purpose..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Requests List */}
                        <div className="p-6">
                            {filteredRequests.length === 0 ? (
                                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        No {activeTab} requests
                                    </h3>
                                    <p className="text-gray-500">
                                        {searchTerm 
                                            ? 'No requests match your search criteria.'
                                            : `You don't have any ${activeTab} requests.`}
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredRequests.map((request) => (
                                        <RequestCard 
                                            key={request.id} 
                                            request={request} 
                                            showActions={activeTab === 'pending'}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Summary Stats */}
                        {filteredRequests.length > 0 && (
                            <div className="p-6 bg-gray-50 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Showing {filteredRequests.length} of {currentRequests.length} {activeTab} requests
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Request Detail Modal */}
            <RequestDetailModal
                isOpen={isDetailModalOpen}
                onClose={closeDetailModal}
                request={selectedRequest}
            />
        </AuthenticatedLayout>
    );
}