import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { MapPin, Users, Calendar, Clock, X, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function RequestDetailsModal({ 
    isOpen, 
    closeModal, 
    request, 
    onSubmit, 
    ticketNumber, 
    setTicketNumber,
    processing 
}) {
    if (!request) return null;

    const formatDate = (date) => format(new Date(date), 'MMMM d, yyyy');
    const formatTime = (time) => format(new Date(`2000-01-01 ${time}`), 'h:mm a');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const trimmedTicket = ticketNumber.trim();
        
        if (!trimmedTicket) {
            alert('Please enter a ticket number');
            return;
        }
        
        // Updated regex: YYYY-MM-XX (01-99) or YYYY-MM-XXX (100-999)
        if (!/^\d{4}-\d{2}-(0[1-9]|[1-9]\d|[1-9]\d{2})$/.test(trimmedTicket)) {
            alert('Please enter a valid ticket number:\n- Format: YYYY-MM-XX (01-99) or YYYY-MM-XXX (100-999)\n- Examples: 2026-01-01, 2026-01-45, 2026-01-100');
            return;
        }
        
        onSubmit(request.id, trimmedTicket);
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
                        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                            <Dialog.Title as="div" className="flex items-center justify-between border-b p-4">
                                <h3 className="text-lg font-medium">
                                    {request.trip_ticket_number ? 'Update' : 'Assign'} Trip Ticket Number
                                </h3>
                                <button 
                                    onClick={closeModal} 
                                    className="text-gray-400 hover:text-gray-500"
                                    disabled={processing}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </Dialog.Title>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Requestor</p>
                                        <p className="mt-1">{request.user?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Department</p>
                                        <p className="mt-1">{request.user?.department || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Destination</p>
                                            <p className="mt-1">{request.destination}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Purpose</p>
                                            <p className="mt-1">{request.purpose}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Travel Date</p>
                                            <p className="mt-1">{formatDate(request.date_of_travel)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Passengers</p>
                                            <p className="mt-1">{request.authorized_passengers ?? "N/A"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Time</p>
                                            <p className="mt-1">{formatTime(request.time_of_travel)}</p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                     
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Trip Ticket Number
                                        </label>
                                        <input
                                            type="text"
                                            value={ticketNumber}
                                            onChange={(e) => setTicketNumber(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            placeholder="Enter trip ticket number"
                                            required
                                            disabled={processing}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-md disabled:opacity-50"
                                            disabled={processing}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={processing}
                                        >
                                            {processing ? 'Saving...' : 'Assign Ticket Number'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}