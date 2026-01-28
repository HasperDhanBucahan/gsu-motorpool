import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Send, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export default function TripTicketPreviewModal({ isOpen, closeModal, request, onSend, sending, onBack }) {
    if (!request) return null;

    const formatDate = (date) => format(new Date(date), 'MMMM d, yyyy');
    const formatTime = (time) => format(new Date(`2000-01-01 ${time}`), 'h:mm a');

    const handleSend = () => {
        if (onSend) {
            onSend(request.id);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={() => {}}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                            <Dialog.Title as="div" className="flex items-center justify-between border-b p-4 bg-gray-50">
                                <h3 className="text-lg font-medium">Trip Ticket Preview</h3>
                                <button 
                                    onClick={closeModal} 
                                    className="text-gray-400 hover:text-gray-500 hidden"
                                    disabled={sending}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </Dialog.Title>

                            <div className="p-6">
                                {/* Trip Ticket Summary */}
                                <div className="border rounded-lg p-6 bg-white shadow-sm mb-6">
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">TRIP TICKET</h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Ticket #: {request.trip_ticket_number || 'Not Assigned'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                                REQUEST DETAILS
                                            </h3>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-xs text-gray-500">Requestor:</span>
                                                    <p className="font-medium">{request.user?.name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Department:</span>
                                                    <p className="font-medium">{request.user?.department || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                                ASSIGNMENT
                                            </h3>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-xs text-gray-500">Driver:</span>
                                                    <p className="font-medium">{request.driver?.name || 'Not assigned'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Vehicle:</span>
                                                    <p className="font-medium">
                                                        {request.vehicle?.description || 'N/A'} - {request.vehicle?.plate_number || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                            TRIP INFORMATION
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs text-gray-500">Destination:</span>
                                                <p className="font-medium">{request.destination}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Purpose:</span>
                                                <p className="font-medium">{request.purpose}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Travel Date:</span>
                                                <p className="font-medium">{formatDate(request.date_of_travel)}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Travel Time:</span>
                                                <p className="font-medium">{formatTime(request.time_of_travel)}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <span className="text-xs text-gray-500">Authorized Passengers:</span>
                                            <p className="font-medium">{request.authorized_passengers}</p>
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-500 text-center pt-4 border-t">
                                        Generated on {format(new Date(), 'MMMM d, yyyy h:mm a')}
                                    </div>
                                </div>

                                {/* PDF Preview Frame */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        PDF Preview (Use PDF controls to download or print):
                                    </h4>
                                    <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                                        <iframe
                                            src={route('tickets.preview', request.id)}
                                            className="w-full h-full"
                                            title="Trip Ticket PDF Preview"
                                        />
                                    </div>
                                </div>

                                {/* Warning Message */}
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-yellow-700">
                                                You must complete this action. Click "Back to Edit" to modify or "Send to Assignment Admin" to proceed.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between items-center gap-3 pt-4 border-t">
                                    <button
                                        onClick={onBack}
                                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                                        disabled={sending}
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Edit
                                    </button>
                                    
                                    <button
                                        onClick={handleSend}
                                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                                        disabled={sending}
                                    >
                                        <Send className="w-4 h-4" />
                                        {sending ? 'Sending...' : 'Send to Assignment Admin'}
                                    </button>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
