import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { MapPin, Users, Calendar, Clock, Edit3, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function PendingRequests({ auth, requests }) {
    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMM d, yyyy');
    };

    const formatTime = (timeString) => {
        return format(new Date(`2000-01-01 ${timeString}`), 'h:mm a');
    };

    const handleDelete = (requestId, e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this request?')) {
            router.delete(`/requests/${requestId}`);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
                    </div>
                    {requests.length > 0 && (
                        <div className="bg-blue-50 px-4 py-2 rounded-full">
                            <span className="text-blue-700 font-semibold text-sm">
                                {requests.length} pending
                            </span>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Pending Requests" />

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {requests.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                        <p className="text-gray-500">You don't have any travel requests waiting for approval.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div 
                                key={request.id} 
                                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                                <MapPin className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-900">
                                                    {request.destination}
                                                </h3>
                                                <p className="text-gray-600 text-sm mt-1">
                                                    {request.purpose}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => router.visit(route('client.requests.edit', request.id))}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit request"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(request.id, e)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete request"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="flex items-center text-sm text-gray-600 gap-1">
                                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                                            <span className="ml-1">
                                                {request.authorized_passengers === 1 ? 'Passenger: ' : 'Passengers: '}
                                            </span>
                                            <span className="font-medium">{request.authorized_passengers}</span>
                                            
                                        </div>
                                        
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                            <span>
                                                {formatDate(request.date_of_travel)} 
                                                <span className="text-gray-500 ml-1">
                                                    ({request.days_of_travel} {request.days_of_travel === 1 ? 'day' : 'days'})
                                                </span>
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                            <span>{formatTime(request.time_of_travel)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}