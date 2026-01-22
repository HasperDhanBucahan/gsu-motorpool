import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { router } from '@inertiajs/react';
import RequestDetailModal from '@/Pages/Calendar/RequestDetailModal';
import axios from 'axios';

export default function CalendarWidget({ userRole }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Debug log
    console.log('CalendarWidget userRole:', userRole);
    console.log('Events loaded:', events.length);

    // Fetch events for current month
    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            const response = await axios.get('/calendar/events', {
                params: {
                    start: startOfMonth.toISOString(),
                    end: endOfMonth.toISOString(),
                },
            });
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle event click
    const handleEventClick = async (eventId) => {
        try {
            const response = await axios.get(`/calendar/requests/${eventId}`);
            setSelectedRequest(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error('Failed to fetch request details:', error);
            alert('Failed to load request details');
        }
    };

    // Generate calendar days
    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startingDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        const days = [];
        
        // Previous month's days
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({ date: null, isCurrentMonth: false });
        }
        
        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayEvents = events.filter(event => {
                const eventStart = new Date(event.start);
                return eventStart.getDate() === day && 
                       eventStart.getMonth() === month && 
                       eventStart.getFullYear() === year;
            });
            
            days.push({
                date: day,
                fullDate: date,
                isCurrentMonth: true,
                isToday: isToday(date),
                events: dayEvents,
            });
        }
        
        return days;
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const days = generateCalendarDays();

    return (
        <>
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                                {userRole === 'client' ? 'My Trips' : 'Scheduled Trips'}
                            </h3>
                        </div>
                        <button
                            onClick={() => router.visit(route('calendar.index'))}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            <Eye className="w-4 h-4" />
                            Full Calendar
                        </button>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={previousMonth}
                            className="p-1 hover:bg-white rounded transition"
                            disabled={loading}
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        <div className="flex items-center gap-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h4>
                            <button
                                onClick={goToToday}
                                className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            >
                                Today
                            </button>
                        </div>

                        <button
                            onClick={nextMonth}
                            className="p-1 hover:bg-white rounded transition"
                            disabled={loading}
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-4">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, index) => (
                                <div
                                    key={index}
                                    className={`min-h-[60px] p-1 border rounded ${
                                        !day.isCurrentMonth
                                            ? 'bg-gray-50'
                                            : day.isToday
                                            ? 'bg-blue-50 border-blue-300'
                                            : 'bg-white hover:bg-gray-50'
                                    } ${day.events?.length > 0 ? 'cursor-pointer' : ''}`}
                                >
                                    {day.date && (
                                        <>
                                            <div className={`text-xs font-medium mb-1 ${
                                                day.isToday ? 'text-blue-600' : 'text-gray-700'
                                            }`}>
                                                {day.date}
                                            </div>
                                            
                                            {/* Event Indicators */}
                                            <div className="space-y-1">
                                                {day.events?.slice(0, 2).map((event, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => handleEventClick(event.id)}
                                                        className="text-[10px] px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition"
                                                        style={{
                                                            backgroundColor: event.backgroundColor,
                                                            color: 'white',
                                                        }}
                                                        title={`${event.title} - ${event.extendedProps?.formatted_duration || ''}`}
                                                    >
                                                        {event.title}
                                                    </div>
                                                ))}
                                                {day.events?.length > 2 && (
                                                    <div className="text-[10px] text-gray-500 px-1">
                                                        +{day.events.length - 2} more
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="px-4 pb-4 flex flex-wrap gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-green-500"></div>
                        <span className="text-gray-600">Approved</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded bg-purple-500"></div>
                        <span className="text-gray-600">Completed</span>
                    </div>
                </div>

                {/* Event Count Summary */}
                {events.length > 0 && (
                    <div className="px-4 pb-4">
                        <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-900">
                            <strong>{events.length}</strong> {events.length === 1 ? 'trip' : 'trips'} this month
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <RequestDetailModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                request={selectedRequest}
                userRole={userRole}
            />
        </>
    );
}