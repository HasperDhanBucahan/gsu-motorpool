import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Send } from 'lucide-react';
import { format } from 'date-fns';

export default function ClientRequestPreviewModal({ 
    isOpen, 
    closeModal, 
    formData,
    onConfirm,
    processing 
}) {
    if (!formData) return null;

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return format(new Date(date), 'MMMM d, yyyy');
    };

    const formatTime = (time) => {
        if (!time) return 'N/A';
        try {
            return format(new Date(`2000-01-01 ${time}`), 'h:mm a');
        } catch {
            return time;
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
                        <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                            <Dialog.Title as="div" className="flex items-center justify-between border-b p-4 bg-gray-50">
                                <h3 className="text-lg font-medium">Preview Your Request</h3>
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
                                            Please review your request details before submitting
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Trip Details */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                                                TRIP INFORMATION
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-xs text-gray-500">Destination:</span>
                                                    <p className="font-medium">{formData.destination}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Date of Travel:</span>
                                                    <p className="font-medium">{formatDate(formData.date_of_travel)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Time of Travel:</span>
                                                    <p className="font-medium">{formatTime(formData.time_of_travel)}</p>
                                                </div>
                                                <div>
                                                    <span className="text-xs text-gray-500">Days of Travel:</span>
                                                    <p className="font-medium">{formData.days_of_travel || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <span className="text-xs text-gray-500">Purpose:</span>
                                                <p className="font-medium">{formData.purpose}</p>
                                            </div>
                                            <div className="mt-4">
                                                <span className="text-xs text-gray-500">Authorized Passengers:</span>
                                                <p className="font-medium">{formData.authorized_passengers}</p>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                                            <p className="text-sm text-blue-800">
                                                ℹ️ After submission, your request will be sent to the Assignment Admin for vehicle and driver assignment.
                                            </p>
                                        </div>
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
                                        Cancel
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                        disabled={processing}
                                    >
                                        <Send className="w-4 h-4" />
                                        {processing ? 'Submitting...' : 'Confirm & Submit Request'}
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