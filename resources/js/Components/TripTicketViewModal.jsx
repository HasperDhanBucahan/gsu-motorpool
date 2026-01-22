import React from 'react';
import { Dialog } from '@headlessui/react';
import { X, Download, Eye, Calendar, Clock, MapPin, Users, FileText } from 'lucide-react';
import { format } from 'date-fns';

const TripTicketViewModal = ({ isOpen, closeModal, request }) => {
    if (!request) return null;

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMMM d, yyyy');
    };

    const formatTime = (timeString) => {
        return format(new Date(`2000-01-01 ${timeString}`), 'h:mm a');
    };

    // Check if this is a real database record (not preview/temporary)
    const isRealRecord = request.id && request.id !== 'preview' && typeof request.id === 'number';

    const handlePreview = () => {
        if (isRealRecord) {
            window.open(route('tickets.preview', request.id), '_blank');
        }
    };

    const handleDownload = () => {
        if (isRealRecord) {
            window.location.href = route('tickets.download', request.id);
        }
    };

    return (
        <Dialog open={isOpen} onClose={closeModal} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-lg shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <Dialog.Title className="text-xl font-semibold text-gray-900">
                                Trip Ticket Details
                            </Dialog.Title>
                            <p className="text-sm text-gray-500 mt-1">
                                View trip ticket information
                            </p>
                        </div>
                        <button
                            onClick={closeModal}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        {/* Trip Ticket Number Badge */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500 rounded-lg">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-900">Trip Ticket Number</p>
                                    <p className="text-2xl font-bold text-blue-600">#{request.trip_ticket_number}</p>
                                </div>
                            </div>
                            {request.ticket_sent_at && (
                                <div className="text-right">
                                    <p className="text-xs text-blue-600 font-medium">Sent to Assignment Admin</p>
                                    <p className="text-xs text-blue-500">
                                        {format(new Date(request.ticket_sent_at), 'MMM d, yyyy h:mm a')}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Request Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Requestor */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Requestor</label>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-900">{request.user?.name || 'N/A'}</p>
                                </div>
                            </div>

                            {/* Driver */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Driver</label>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-900">{request.driver?.name || 'Not assigned'}</p>
                                </div>
                            </div>

                            {/* Vehicle */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Vehicle</label>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-900">
                                        {request.vehicle?.model || 'N/A'} - {request.vehicle?.plate_number || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Travel Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Travel Information
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Date of Travel
                                    </label>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-900">{formatDate(request.date_of_travel)}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Time of Travel
                                    </label>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-900">{formatTime(request.time_of_travel)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Destination
                                </label>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-900">{request.destination}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    Authorized Passengers
                                </label>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                        {request.authorized_passengers || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Purpose</label>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                        {request.purpose}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                        {isRealRecord ? (
                            <>
                                <button
                                    onClick={handlePreview}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    Preview PDF
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                            </>
                        ) : (
                            <div className="text-sm text-gray-500 italic">
                                PDF will be available after the ticket is saved
                            </div>
                        )}
                        <button
                            onClick={closeModal}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default TripTicketViewModal;