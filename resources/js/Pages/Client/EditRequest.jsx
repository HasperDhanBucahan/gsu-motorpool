import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import AuthorizedPassengersInput from '@/Components/AuthorizedPassengersInput';

export default function EditRequestPage({ auth, request }) {
    // Parse existing passengers from comma-separated string to array
    const [passengers, setPassengers] = useState(
        request.authorized_passengers 
            ? request.authorized_passengers.split(', ').filter(p => p.trim()) 
            : []
    );

    const { data, setData, patch, processing, errors } = useForm({
        destination: request.destination || '',
        purpose: request.purpose || '',
        authorized_passengers: request.authorized_passengers || '',
        date_of_travel: request.date_of_travel ? request.date_of_travel.substring(0, 10) : '',
        days_of_travel: request.days_of_travel || '',
        half_day_period: request.half_day_period || '',
        time_of_travel: request.time_of_travel || '',
    });

    // Update the form data when passengers array changes
    const handlePassengersChange = (newPassengers) => {
        setPassengers(newPassengers);
        setData('authorized_passengers', newPassengers.join(', '));
    };

    // Check if days_of_travel requires half_day_period
    const requiresHalfDayPeriod = () => {
        const days = parseFloat(data.days_of_travel);
        return !isNaN(days) && days % 1 !== 0;
    };

    const handleDaysChange = (e) => {
        const value = e.target.value;
        setData('days_of_travel', value);
        
        // Clear half_day_period if not needed
        const days = parseFloat(value);
        if (!isNaN(days) && days % 1 === 0) {
            setData('half_day_period', '');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Check if half_day_period is required but missing
        if (requiresHalfDayPeriod() && !data.half_day_period) {
            alert('Please select morning or afternoon for half-day requests.');
            return;
        }

        patch(`/requests/${request.id}`, {
            onSuccess: () => router.visit(route('requests.index')),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Request</h2>}
        >
            <Head title="Edit Request" />

            <div className="flex items-center justify-center min-h-[calc(100vh-80px)] bg-gray-100 px-4 py-12">
                <div className="w-full max-w-3xl bg-white shadow rounded-xl p-6 overflow-y-auto max-h-[90vh]">
                    <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Edit Request for Use of Vehicle</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                         
                        {/* Destination */}
                        <div>
                            <InputLabel htmlFor="destination" required>Destination</InputLabel>
                            <TextInput
                                id="destination"
                                value={data.destination}
                                onChange={(e) => setData('destination', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.destination} />
                        </div>

                        {/* Purpose */}
                        <div>
                            <InputLabel htmlFor="purpose" required>Purpose</InputLabel>
                            <textarea
                                id="purpose"
                                value={data.purpose}
                                onChange={(e) => setData('purpose', e.target.value)}
                                className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                rows="3"
                                required
                            />
                            <InputError message={errors.purpose} />
                        </div>

                        {/* Authorized Passengers */}
                        <AuthorizedPassengersInput
                            passengers={passengers}
                            onChange={handlePassengersChange}
                            error={errors.authorized_passengers}
                        />

                        {/* Date of Travel */}
                        <div>
                            <InputLabel htmlFor="date_of_travel" required>Date of Travel</InputLabel>
                            <TextInput
                                id="date_of_travel"
                                type="date"
                                value={data.date_of_travel}
                                onChange={(e) => setData('date_of_travel', e.target.value)}
                                className="mt-1 block w-full"
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                            <InputError message={errors.date_of_travel} />
                        </div>

                        {/* Travel Duration Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Days of Travel */}
                            <div>
                                <InputLabel htmlFor="days_of_travel" required>Days of Travel</InputLabel>
                                <TextInput
                                    id="days_of_travel"
                                    type="number"
                                    step="0.5"
                                    value={data.days_of_travel}
                                    onChange={handleDaysChange}
                                    className="mt-1 block w-full"
                                    min="0.5"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter 0.5 for half-day, 1 for full day, 1.5 for day and half, etc.
                                </p>
                                <InputError message={errors.days_of_travel} />
                            </div>

                            {/* Half-Day Period (conditionally shown) */}
                            {requiresHalfDayPeriod() && (
                                <div>
                                    <InputLabel htmlFor="half_day_period" required>
                                        Half-Day Period
                                    </InputLabel>
                                    <select
                                        id="half_day_period"
                                        value={data.half_day_period}
                                        onChange={(e) => setData('half_day_period', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        required
                                    >
                                        <option value="">Select Period</option>
                                        <option value="morning">Morning (until 12 PM)</option>
                                        <option value="afternoon">Afternoon (until 5 PM)</option>
                                    </select>
                                    <InputError message={errors.half_day_period} />
                                </div>
                            )}
                        </div>

                        {/* Time of Travel */}
                        <div>
                            <InputLabel htmlFor="time_of_travel" required>Time of Travel</InputLabel>
                            <TextInput
                                id="time_of_travel"
                                type="time"
                                value={data.time_of_travel}
                                onChange={(e) => setData('time_of_travel', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.time_of_travel} />
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => router.visit(route('requests.index'))}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                disabled={processing}
                            >
                                {processing ? 'Updating...' : 'Update Request'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}