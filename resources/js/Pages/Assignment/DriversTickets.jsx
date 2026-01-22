import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { format } from "date-fns";
import { FileText, Download, Eye, Printer } from "lucide-react";

export default function DriversTickets({ auth, tickets }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDriver, setFilterDriver] = useState('all');

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMMM d, yyyy');
    };

    const formatTime = (timeString) => {
        return format(new Date(`2000-01-01 ${timeString}`), 'h:mm a');
    };

    // Get unique drivers for filter
    const uniqueDrivers = [...new Set(tickets.map(t => t.driver?.name).filter(Boolean))];

    // Filter tickets
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch = 
            ticket.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.driver?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.trip_ticket_number.toString().includes(searchTerm) ||
            ticket.destination.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDriver = filterDriver === 'all' || ticket.driver?.name === filterDriver;

        return matchesSearch && matchesDriver;
    });

    const handlePreview = (ticketId) => {
        window.open(route('tickets.preview', ticketId), '_blank');
    };

    const handleDownload = (ticketId) => {
        window.location.href = route('tickets.download', ticketId);
    };

    const handlePrint = (ticketId) => {
        const printWindow = window.open(route('tickets.preview', ticketId), '_blank');
        printWindow.addEventListener('load', () => {
            printWindow.print();
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Driver's Tickets
                    </h2>
                    
                </div>
            }
        >
            <Head title="Driver's Tickets" />
            <div className="p-6">
                {/* Filters and Search */}
                <div className="mb-6 bg-white rounded-lg shadow p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search
                            </label>
                            <input
                                type="text"
                                placeholder="Search by requestor, driver, ticket number, or destination..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Driver Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Driver
                            </label>
                            <select
                                value={filterDriver}
                                onChange={(e) => setFilterDriver(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Drivers</option>
                                {uniqueDrivers.map((driver) => (
                                    <option key={driver} value={driver}>
                                        {driver}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FileText className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                                <p className="text-2xl font-bold text-gray-900">{uniqueDrivers.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FileText className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Filtered Results</p>
                                <p className="text-2xl font-bold text-gray-900">{filteredTickets.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tickets Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-left">
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Trip Ticket #
                                </th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Requestor
                                </th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Driver
                                </th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Vehicle
                                </th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Travel Date & Time
                                </th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Destination
                                </th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-12 h-12 mb-2 text-gray-400" />
                                            <p>No tickets found matching your criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                            #{ticket.trip_ticket_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {ticket.user.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {ticket.driver?.name || 'Not assigned'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>{ticket.vehicle?.model || 'N/A'}</div>
                                            <div className="text-xs text-gray-500">
                                                {ticket.vehicle?.plate_number || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div>{formatDate(ticket.date_of_travel)}</div>
                                            <div className="text-xs text-gray-500">
                                                {formatTime(ticket.time_of_travel)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                            {ticket.destination}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handlePreview(ticket.id)}
                                                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                                                    title="Preview Ticket"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(ticket.id)}
                                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                                                    title="Download Ticket"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handlePrint(ticket.id)}
                                                    className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
                                                    title="Print Ticket"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}