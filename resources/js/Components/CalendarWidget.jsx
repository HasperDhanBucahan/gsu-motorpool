import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Eye, AlertCircle } from 'lucide-react';
import { router } from '@inertiajs/react';
import RequestDetailModal from '@/Pages/Calendar/RequestDetailModal';
import axios from 'axios';

export default function CalendarWidget({ userRole }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch events for current month
    useEffect(() => {
        fetchEvents();
    }, [currentDate]);

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
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
            setError('Failed to load calendar events. Please try again.');
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

    const getLegendItems = () => {
        const base = [
            { color: 'bg-green-500', label: 'Approved' },
            { color: 'bg-purple-500', label: 'Completed' },
        ];
        
        if (userRole === 'assignment_admin' || userRole === 'approval_admin') {
            base.unshift({ color: 'bg-blue-500', label: 'Assigned' });
        }
        
        return base;
    };

    return (
        <>
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 border-b border-blue-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">
                                {userRole === 'client' ? 'My Trips' : 'Scheduled Trips'}
                            </h3>
                        </div>
                        <button
                            onClick={() => router.visit(route('calendar.index'))}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-200 text-sm font-medium border border-white/20"
                        >
                            <Eye className="w-4 h-4" />
                            Full Calendar
                        </button>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            onClick={previousMonth}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                            disabled={loading}
                        >
                            <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        
                        <div className="flex items-center gap-3">
                            <h4 className="text-2xl font-bold text-white">
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </h4>
                            <button
                                onClick={goToToday}
                                className="px-3 py-1.5 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-200 text-xs font-semibold border border-white/20"
                            >
                                Today
                            </button>
                        </div>

                        <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
                            disabled={loading}
                        >
                            <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-900">Error loading calendar</p>
                                <p className="text-sm text-red-700 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-2 mb-3">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center text-xs font-bold text-gray-600 py-2 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="flex flex-col items-center gap-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                <p className="text-sm text-gray-500">Loading calendar...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-2">
                            {days.map((day, index) => (
                                <div
                                    key={index}
                                    className={`min-h-[70px] p-2 border rounded-lg transition-all duration-200 ${
                                        !day.isCurrentMonth
                                            ? 'bg-gray-50 border-gray-100'
                                            : day.isToday
                                            ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                                            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                    } ${day.events?.length > 0 ? 'cursor-pointer' : ''}`}
                                >
                                    {day.date && (
                                        <>
                                            <div className={`text-xs font-bold mb-1.5 ${
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
                                                        className="text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-all duration-200 font-medium"
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
                                                    <div className="text-[10px] text-gray-500 px-1.5 font-medium">
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

                {/* Legend & Summary */}
                <div className="px-6 pb-6">
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 text-xs mb-4">
                        {getLegendItems().map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded ${item.color}`}></div>
                                <span className="text-gray-600 font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Event Count Summary */}
                    {events.length > 0 && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                            <p className="text-sm text-blue-900">
                                <strong className="font-bold text-lg">{events.length}</strong> {events.length === 1 ? 'trip' : 'trips'} scheduled this month
                            </p>
                        </div>
                    )}
                </div>
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