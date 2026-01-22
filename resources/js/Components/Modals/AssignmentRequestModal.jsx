import RequestModal from '../RequestDetailsModal';
import { MapPin, Users, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from '@inertiajs/react';

export default function AssignmentRequestModal({ isOpen, closeModal, request }) {
    if (!request) return null;

    const formatDate = (date) => format(new Date(date), 'MMMM d, yyyy');
    const formatTime = (time) => format(new Date(`2000-01-01 ${time}`), 'h:mm a');

    return (
        <RequestModal
            isOpen={isOpen}
            closeModal={closeModal}
            title="New Request for Assignment"
        >
            <div className="space-y-6">
                {/* Requestor Info */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Requestor</p>
                        <p className="mt-1 text-sm text-gray-900">{request.user?.name}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Department</p>
                        <p className="mt-1 text-sm text-gray-900">{request.user?.department}</p>
                    </div>
                </div>

                {/* Request Details */}
                <div className="space-y-4">
                    <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Destination</p>
                            <p className="mt-1 text-sm text-gray-900">{request.destination}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Authorized Passengers</p>
                            <p className="mt-1 text-sm text-gray-900">
                                {request.authorized_passengers} passengers
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Travel Schedule</p>
                            <p className="mt-1 text-sm text-gray-900">
                                {formatDate(request.date_of_travel)}
                                {request.days_of_travel > 1 && ` (${request.days_of_travel} days)`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2">
                        <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Departure Time</p>
                            <p className="mt-1 text-sm text-gray-900">
                                {formatTime(request.time_of_travel)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t">
                    <Link
                        href={route('assignment.requests.assign.view', request.id)}
                        className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Assign Driver & Vehicle
                    </Link>
                </div>
            </div>
        </RequestModal>
    );
}