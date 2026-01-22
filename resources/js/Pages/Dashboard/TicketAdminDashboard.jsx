import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import StatCard from './Components/StatCard';
import { FileText, CheckCircle, Printer, Clock } from 'lucide-react';
import CalendarWidget from '@/Components/CalendarWidget';

export default function TicketAdminDashboard({ data }) {
    const { auth } = usePage().props;

    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Pending Tickets"
                            value={data.pendingTickets}
                            icon={Clock}
                            color="yellow"
                            link={route('tickets.index')}
                        />
                        <StatCard
                            title="Generated Tickets"
                            value={data.generatedTickets}
                            icon={Printer}
                            color="green"
                            link={route('tickets.index')}
                        />
                        <StatCard
                            title="Total Tickets"
                            value={data.totalTickets}
                            icon={FileText}
                            color="blue"
                        />
                        <StatCard
                            title="Approved Requests"
                            value={data.totalTickets}
                            icon={CheckCircle}
                            color="indigo"
                            link={route('tickets.index')}
                        />
                    </div>

                    {/* Recent Tickets
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Recent Tickets</h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {data.recentTickets?.map((ticket) => (
                                <div key={ticket.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {ticket.destination}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Driver: {ticket.driver?.name} | Vehicle: {ticket.vehicle?.plate_no}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-500">
                                                {ticket.date_of_travel}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div> */}

                    <CalendarWidget userRole="ticket_admin" />

                </div>
            </div>
        </div>
    );
}
