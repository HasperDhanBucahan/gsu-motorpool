import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Download, Printer, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function RequestFormPreviewModal({ 
    isOpen, 
    closeModal, 
    request, 
    action, 
    declineReason,
    processing 
}) {
    if (!request) return null;

    const formatDate = (date) => format(new Date(date), 'MMMM d, yyyy');
    const formatTime = (time) => {
        if (!time) return 'N/A';
        try {
            return format(new Date(`2000-01-01 ${time}`), 'h:mm a');
        } catch {
            return time;
        }
    };

    const formatDateTime = (dateTime) => format(new Date(dateTime), 'MMMM d, yyyy h:mm a');

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
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
                                <div className="flex items-center gap-2">
                                    {action === 'approve' ? (
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                    <h3 className="text-lg font-medium">
                                        Request Form Preview - {action === 'approve' ? 'Approved' : 'Declined'}
                                    </h3>
                                </div>
                                <button 
                                    onClick={closeModal} 
                                    className="text-gray-400 hover:text-gray-500"
                                    disabled={processing}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </Dialog.Title>

                            <div className="p-6">
                                {/* Request Form Preview */}
                                <div className="border rounded-lg p-6 bg-white shadow-sm mb-6">
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">VEHICLE REQUEST FORM</h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Request ID: {request.id}
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Request Information */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                                REQUEST DETAILS
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-xs text-gray-500">Date Requested:</span>
                                                    <p className="font-medium">{formatDateTime(request.created_at)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Requestor:</span>
                                                    <p className="font-medium">{request.user?.name}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Trip Details */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                                TRIP INFORMATION
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <span className="text-xs text-gray-500">Destination:</span>
                                                    <p className="font-medium">{request.destination}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Date of Travel:</span>
                                                    <p className="font-medium">{formatDate(request.date_of_travel)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Time of Travel:</span>
                                                    <p className="font-medium">{formatTime(request.time_of_travel)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Days of Travel:</span>
                                                    <p className="font-medium">{request.days_of_travel || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <span className="text-xs text-gray-500">Purpose:</span>
                                                <p className="font-medium">{request.purpose}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Authorized Passengers:</span>
                                                <p className="font-medium">{request.authorized_passengers}</p>
                                            </div>
                                        </div>

                                        {/* Assignment Details */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                                ASSIGNMENT
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-xs text-gray-500">Assigned Vehicle:</span>
                                                    <p className="font-medium">
                                                        {request.vehicle 
                                                            ? `${request.vehicle.description} - ${request.vehicle.plate_number}`
                                                            : 'Not assigned'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Assigned Driver:</span>
                                                    <p className="font-medium">
                                                        {request.driver?.name || 'Not assigned'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Approval Status */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                                APPROVAL STATUS
                                            </h3>
                                            <div className="flex items-center gap-4 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={action === 'approve'} 
                                                        readOnly 
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-sm font-medium text-green-700">Approved</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={action === 'decline'} 
                                                        readOnly 
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-sm font-medium text-red-700">Declined</span>
                                                </div>
                                            </div>
                                            
                                            {action === 'decline' && declineReason && (
                                                <div className="bg-red-50 border border-red-200 rounded p-3">
                                                    <span className="text-xs text-gray-500 font-medium">Decline Reason:</span>
                                                    <p className="text-sm text-red-900 mt-1">{declineReason}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Signatures */}
                                        <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                                            <div>
                                                <span className="text-xs text-gray-500">Requestor's Signature:</span>
                                                <div className="mt-2 h-16 border-b border-gray-400 flex items-end">
                                                    {request.user?.signature_path ? (
                                                        <img 
                                                            src={`/storage/${request.user.signature_path}`} 
                                                            alt="Requestor Signature" 
                                                            className="h-12 object-contain"
                                                        />
                                                    ) : (
                                                        <span className="text-sm italic text-gray-400">Not available</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">{request.user?.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-gray-500">Approval Admin's Signature:</span>
                                                <div className="mt-2 h-16 border-b border-gray-400 flex items-end">
                                                    <span className="text-sm italic text-gray-400">Will be added upon approval</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-500 text-center pt-4 border-t mt-6">
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
                                            src={route('admin.request-form.preview', request.id)}
                                            className="w-full h-full"
                                            title="Request Form PDF Preview"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end items-center gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md"
                                        disabled={processing}
                                    >
                                        Close
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