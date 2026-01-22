import RequestModal from '../RequestDetailsModal';
import { MapPin, Users, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ClientRequestModal({ isOpen, closeModal, request }) {
    if (!request) return null;

    const formatDate = (date) => format(new Date(date), 'MMMM d, yyyy');
    const formatTime = (time) => format(new Date(`2000-01-01 ${time}`), 'h:mm a');

    return (
        <RequestModal
            isOpen={isOpen}
            closeModal={closeModal}
            title="Request Details"
        >
            <div className="space-y-6">
                {/* Status Badge */}
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium
                    ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    request.status === 'declined' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}
                >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
                            <p className="text-sm font-medium text-gray-500">Travel Date</p>
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

                {/* Decline Reason (if applicable) */}
                {request.decline_reason && (
                    <div className="mt-4 p-4 bg-red-50 rounded-lg">
                        <h4 className="text-sm font-medium text-red-800">Reason for Decline:</h4>
                        <p className="mt-1 text-sm text-red-600">{request.decline_reason}</p>
                    </div>
                )}
            </div>
        </RequestModal>
    );
}