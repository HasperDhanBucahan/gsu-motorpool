import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import RequestDetailModal from './RequestDetailModal';
import { Calendar as CalendarIcon } from 'lucide-react';
import axios from 'axios';

export default function CalendarIndex({ auth, userRole }) {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch events from server
    const fetchEvents = async (fetchInfo, successCallback, failureCallback) => {
        try {
            const response = await axios.get('/calendar/events', {
                params: {
                    start: fetchInfo.startStr,
                    end: fetchInfo.endStr,
                },
            });
            successCallback(response.data);
        } catch (error) {
            console.error('Failed to fetch calendar events:', error);
            failureCallback(error);
        }
    };

    // Handle event click
    const handleEventClick = async (clickInfo) => {
        setLoading(true);
        try {
            const response = await axios.get(`/calendar/requests/${clickInfo.event.id}`);
            setSelectedRequest(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to fetch request details:', error);
            alert('Failed to load request details');
        } finally {
            setLoading(false);
        }
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
    };

    // Get header title based on role
    const getHeaderTitle = () => {
        switch (userRole) {
            case 'client':
                return 'My Approved Trips Calendar';
            case 'assignment_admin':
                return 'Assignment Calendar';
            case 'approval_admin':
                return 'Approval Calendar';
            case 'ticket_admin':
                return 'Trip Tickets Calendar';
            default:
                return 'Calendar';
        }
    };

    // Get description based on role
    const getDescription = () => {
        switch (userRole) {
            case 'client':
                return 'View your approved vehicle requests and scheduled trips';
            case 'assignment_admin':
                return 'View all assigned and approved vehicle requests';
            case 'approval_admin':
                return 'View all assigned and approved vehicle requests';
            case 'ticket_admin':
                return 'View all approved requests with trip tickets';
            default:
                return 'Calendar view of vehicle requests';
        }
    };

    return (
        <AuthenticatedLayout 
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{getHeaderTitle()}</h2>
                    </div>
                </div>
            }
        >
            <Head title="Calendar" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    {/* Calendar */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay',
                            }}
                            events={fetchEvents}
                            eventClick={handleEventClick}
                            height="auto"
                            eventTimeFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            }}
                            slotLabelFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                            }}
                            eventDisplay="block"
                            displayEventTime={true}
                            displayEventEnd={false}
                            nowIndicator={true}
                            weekends={true}
                            eventClassNames="cursor-pointer hover:opacity-80 transition"
                        />
                    </div>

                    {/* Loading Overlay */}
                    {loading && (
                        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg p-6">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-gray-700">Loading request details...</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Request Detail Modal */}
            <RequestDetailModal
                isOpen={isModalOpen}
                closeModal={closeModal}
                request={selectedRequest}
                userRole={userRole}
            />
        </AuthenticatedLayout>
    );
}