import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function AssignmentPreviewModal({ 
    isOpen, 
    closeModal, 
    request,
    selectedVehicle,
    selectedDriver,
    assignmentAdmin,
    onConfirmAssignment, 
    processing,
    previewUrl 
}) {
    if (!request || !selectedVehicle || !selectedDriver) return null;

    const formatDate = (date) => {
        try {
            return format(new Date(date), 'MMMM d, yyyy');
        } catch {
            return date;
        }
    };

    const formatDateTime = (dateTime) => {
        try {
            return format(new Date(dateTime), 'MMMM d, yyyy h:mm a');
        } catch {
            return dateTime;
        }
    };

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
                        <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                            <Dialog.Title as="div" className="flex items-center justify-between border-b p-4 bg-gray-50">
                                <h3 className="text-lg font-medium">Assignment Preview</h3>
                                <button 
                                    onClick={closeModal} 
                                    className="text-gray-400 hover:text-gray-500"
                                    disabled={processing}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </Dialog.Title>

                            <div className="p-6">
                                {/* Assignment Summary */}
                                <div className="border rounded-lg p-6 bg-white shadow-sm mb-6">
                                    <div className="text-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">VEHICLE ASSIGNMENT CONFIRMATION</h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Request ID: REQ-{String(request.id).padStart(5, '0')}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                                REQUEST INFORMATION
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
                                                <div>
                                                    <span className="text-xs text-gray-500">Destination:</span>
                                                    <p className="font-medium">{request.destination}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Purpose:</span>
                                                    <p className="font-medium">{request.purpose}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                                SCHEDULE
                                            </h3>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-xs text-gray-500">Travel Date:</span>
                                                    <p className="font-medium">{formatDate(request.date_of_travel)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Duration:</span>
                                                    <p className="font-medium">{request.days_of_travel} day(s)</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Start:</span>
                                                    <p className="font-medium">{formatDateTime(request.start_datetime)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">End:</span>
                                                    <p className="font-medium">{formatDateTime(request.end_datetime)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            ASSIGNMENT DETAILS
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-xs text-blue-700">Assigned Vehicle:</span>
                                                <p className="font-medium text-blue-900">
                                                    {selectedVehicle.description}
                                                </p>
                                                <p className="text-sm text-blue-700">
                                                    {selectedVehicle.plate_number}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-blue-700">Assigned Driver:</span>
                                                <p className="font-medium text-blue-900">
                                                    {selectedDriver.name}
                                                </p>
                                                <p className="text-sm text-blue-700">
                                                    {selectedDriver.contact_number}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 mb-4">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                                ASSIGNED BY
                                            </h3>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-xs text-gray-500">Assignment Admin:</span>
                                                    <p className="font-medium">{assignmentAdmin?.name}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Assignment Date:</span>
                                                    <p className="font-medium">{format(new Date(), 'MMMM d, yyyy h:mm a')}</p>
                                                </div>
                                                {/* {assignmentAdmin?.signature_path && (
                                                    <div>
                                                        <span className="text-xs text-gray-500">Signature:</span>
                                                        <div className="border rounded p-2 bg-gray-50 mt-1">
                                                            <img 
                                                                src={`/storage/${assignmentAdmin.signature_path}`} 
                                                                alt="Admin Signature" 
                                                                className="h-12 object-contain"
                                                            />
                                                        </div>
                                                    </div>
                                                )} */}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                                PASSENGERS
                                            </h3>
                                            <div>
                                                <span className="text-xs text-gray-500">Authorized Passengers:</span>
                                                <p className="font-medium">{request.authorized_passengers}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-500 text-center pt-4 border-t">
                                        This assignment will be sent to the Approval Admin for final approval
                                    </div>
                                </div>

                                {/* PDF Preview Frame */}
                                <div className="mb-6">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        PDF Preview (Use PDF controls to download or print):
                                    </h4>
                                    <div className="border rounded-lg overflow-hidden" style={{ height: '500px' }}>
                                        <iframe
                                            src={previewUrl}
                                            className="w-full h-full"
                                            title="Assignment Confirmation PDF Preview"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-between items-center gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md"
                                        disabled={processing}
                                    >
                                        Go Back to Edit
                                    </button>
                                    
                                    <button
                                        onClick={onConfirmAssignment}
                                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        disabled={processing}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        {processing ? 'Confirming Assignment...' : 'Confirm Assignment'}
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