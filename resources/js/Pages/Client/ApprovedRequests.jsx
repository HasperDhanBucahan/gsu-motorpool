import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { MapPin, Users, Calendar, Clock, Car, UserCheck, CheckCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';

export default function ApprovedRequests({ auth, requests }) {
    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMM d, yyyy');
    };

    const formatTime = (timeString) => {
        return format(new Date(`2000-01-01 ${timeString}`), 'h:mm a');
    };

    const { upcoming, completed } = requests.reduce((acc, request) => {
        const travelDate = new Date(request.date_of_travel);
        const isCompleted = isPast(travelDate);
        
        if (isCompleted) {
            acc.completed.push(request);
        } else {
            acc.upcoming.push(request);
        }
        
        return acc;
    }, { upcoming: [], completed: [] });

    const RequestCard = ({ request }) => (
        <div 
            key={request.id} 
            className="bg-white rounded-xl border border-green-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
        >
            {/* Status indicator */}
            <div className="h-1 bg-gradient-to-r from-green-400 to-green-500"></div>
                                
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-xl text-gray-900">
                                {request.destination}
                            </h3>
                            <p className="text-gray-600 mt-1">
                                {request.purpose}
                            </p>
                        </div>
                    </div>
                                        
                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-700 font-medium text-sm">Approved</span>
                    </div>
                </div>

                {/* Trip Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Passengers</p>
                            <p className="font-medium text-gray-900">
                                {request.authorized_passengers} 
                                {request.authorized_passengers === 1 ? ' person' : ' people'}
                            </p>
                        </div>
                    </div>
                                        
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Travel Date</p>
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
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="font-medium text-gray-900">
                                {request.days_of_travel} {request.days_of_travel === 1 ? 'day' : 'days'} 
                                <span className="text-gray-500 text-sm ml-1">
                                    at {formatTime(request.time_of_travel)}
                                </span>
                            </p>
                        </div>
                    </div>
                                        
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Time</p>
                            <p className="font-medium text-gray-900">
                                {formatTime(request.time_of_travel)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Assignment Details */}
                <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Assignment Details</h4>
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
                                <UserCheck className="w-4 h-4 text-amber-600" />
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
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between space-x-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Approved Requests</h2>
                    </div>
                    {requests.length > 0 && (
                        <div className="flex space-x-3">
                            <div className="bg-blue-50 px-4 py-2 rounded-full">
                                <span className="text-blue-700 font-semibold text-sm">
                                    {upcoming.length} upcoming
                                </span>
                            </div>
                            <div className="bg-gray-50 px-4 py-2 rounded-full">
                                <span className="text-gray-700 font-semibold text-sm">
                                    {completed.length} completed
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Approved Requests" />

            <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {requests.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No approved requests</h3>
                        <p className="text-gray-500">You don't have any approved travel requests yet.</p>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {/* Upcoming Requests */}
                        <section>
                            <div className="flex items-center space-x-2 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Upcoming Trips</h3>
                                <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {upcoming.length}
                                </span>
                            </div>
                            {upcoming.length > 0 ? (
                                <div className="space-y-6">
                                    {upcoming.map(request => (
                                        <RequestCard key={request.id} request={request} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-500">No upcoming trips scheduled</p>
                                </div>
                            )}
                        </section>

                        {/* Completed Requests */}
                        <section>
                            <div className="flex items-center space-x-2 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Completed Trips</h3>
                                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {completed.length}
                                </span>
                            </div>
                            {completed.length > 0 ? (
                                <div className="space-y-6 opacity-75">
                                    {completed.map(request => (
                                        <RequestCard key={request.id} request={request} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-500">No completed trips yet</p>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}