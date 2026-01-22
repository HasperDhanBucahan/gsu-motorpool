import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Calendar, Clock, MapPin, FileText, Users, Car, UserCircle, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function CreateTripTicketModal({ 
    isOpen, 
    closeModal, 
    onPreview,
    processing,
    initialData = null
}) {
    const [formData, setFormData] = useState({
        trip_ticket_number: '',
        driver_id: '',
        vehicle_id: '',
        authorized_passengers: '',
        destination: '',
        purpose: '',
        date_of_travel: '',
        time_of_travel: '',
        days_of_travel: '1',
        half_day_period: 'full'
    });

    const [errors, setErrors] = useState({});
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [availabilityError, setAvailabilityError] = useState(null);
    const [hasCheckedAvailability, setHasCheckedAvailability] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // If initialData is provided (from "Back to Edit"), use it
            if (initialData) {
                setFormData(initialData);
                // Trigger availability check for the restored data
                setHasCheckedAvailability(false);
            } else {
                // Reset form when modal opens without initial data
                setFormData({
                    trip_ticket_number: '',
                    driver_id: '',
                    vehicle_id: '',
                    authorized_passengers: '',
                    destination: '',
                    purpose: '',
                    date_of_travel: '',
                    time_of_travel: '',
                    days_of_travel: '1',
                    half_day_period: 'full'
                });
            }
            setErrors({});
            setAvailableDrivers([]);
            setAvailableVehicles([]);
            setLoadingAvailability(false);
            setAvailabilityError(null);
            if (!initialData) {
                setHasCheckedAvailability(false);
            }
        }
    }, [isOpen, initialData]);

    // Debounced availability check
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            checkAvailability();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [formData.date_of_travel, formData.time_of_travel, formData.days_of_travel, formData.half_day_period]);

    const checkAvailability = async () => {
        // Validate required fields before checking
        const daysValue = parseFloat(formData.days_of_travel);
        const hasHalfDay = !isNaN(daysValue) && daysValue > 0 && daysValue % 1 !== 0;
        
        // Check if all required fields are filled and valid
        if (!formData.date_of_travel || !formData.time_of_travel || !formData.days_of_travel || isNaN(daysValue) || daysValue < 0.5) {
            setHasCheckedAvailability(false);
            setAvailableDrivers([]);
            setAvailableVehicles([]);
            return;
        }

        if (hasHalfDay && (!formData.half_day_period || formData.half_day_period === 'full')) {
            setHasCheckedAvailability(false);
            setAvailableDrivers([]);
            setAvailableVehicles([]);
            return;
        }

        setLoadingAvailability(true);
        setAvailabilityError(null);

        try {
            const params = new URLSearchParams({
                date_of_travel: formData.date_of_travel,
                time_of_travel: formData.time_of_travel,
                days_of_travel: formData.days_of_travel,
                half_day_period: formData.half_day_period || 'full'
            });

            const response = await fetch(`/ticket/check-availability?${params}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to check availability');
            }

            // Store previously selected IDs
            const previousDriverId = formData.driver_id;
            const previousVehicleId = formData.vehicle_id;

            setAvailableDrivers(data.availableDrivers);
            setAvailableVehicles(data.availableVehicles);
            setHasCheckedAvailability(true);

            // Check if previously selected items are still available
            const driverStillAvailable = data.availableDrivers.some(d => d.id.toString() === previousDriverId);
            const vehicleStillAvailable = data.availableVehicles.some(v => v.id.toString() === previousVehicleId);

            // Clear selections if no longer available
            if (previousDriverId && !driverStillAvailable) {
                setFormData(prev => ({ ...prev, driver_id: '' }));
                setErrors(prev => ({ 
                    ...prev, 
                    driver_id: 'Previously selected driver is no longer available for this time period' 
                }));
            }

            if (previousVehicleId && !vehicleStillAvailable) {
                setFormData(prev => ({ ...prev, vehicle_id: '' }));
                setErrors(prev => ({ 
                    ...prev, 
                    vehicle_id: 'Previously selected vehicle is no longer available for this time period' 
                }));
            }

        } catch (error) {
            console.error('Availability check error:', error);
            setAvailabilityError(error.message);
            setAvailableDrivers([]);
            setAvailableVehicles([]);
            setHasCheckedAvailability(false);
        } finally {
            setLoadingAvailability(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.trip_ticket_number.trim()) {
            newErrors.trip_ticket_number = 'Trip ticket number is required';
        } else if (!/^\d{4}-\d{2}-(0[1-9]|[1-9]\d|[1-9]\d{2})$/.test(formData.trip_ticket_number)) {
            newErrors.trip_ticket_number = 'Must be in YYYY-MM-XX (01-99) or YYYY-MM-XXX (100-999) format';
        }

        if (!formData.driver_id) {
            newErrors.driver_id = 'Driver is required';
        }

        if (!formData.vehicle_id) {
            newErrors.vehicle_id = 'Vehicle is required';
        }

        if (!formData.destination.trim()) {
            newErrors.destination = 'Destination is required';
        }

        if (!formData.purpose.trim()) {
            newErrors.purpose = 'Purpose is required';
        }

        if (!formData.date_of_travel) {
            newErrors.date_of_travel = 'Date of travel is required';
        }

        if (!formData.time_of_travel) {
            newErrors.time_of_travel = 'Time of travel is required';
        }

        if (!formData.days_of_travel || parseFloat(formData.days_of_travel) < 0.5) {
            newErrors.days_of_travel = 'Days of travel must be at least 0.5';
        }

        // Validate half_day_period for half-day requests
        const hasHalfDay = parseFloat(formData.days_of_travel) % 1 !== 0;
        if (hasHalfDay && !formData.half_day_period) {
            newErrors.half_day_period = 'Please select morning or afternoon for half-day requests';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            onPreview(formData);
        }
    };

    const handleRetryAvailability = () => {
        checkAvailability();
    };

    const hasHalfDay = !isNaN(parseFloat(formData.days_of_travel)) && parseFloat(formData.days_of_travel) > 0 && parseFloat(formData.days_of_travel) % 1 !== 0;
    const canCheckAvailability = formData.date_of_travel && formData.time_of_travel && formData.days_of_travel && parseFloat(formData.days_of_travel) >= 0.5 && (!hasHalfDay || (formData.half_day_period && formData.half_day_period !== 'full'));

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
                        <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
                            <Dialog.Title as="div" className="flex items-center justify-between border-b p-4 bg-gradient-to-r from-blue-600 to-blue-700">
                                <h3 className="text-lg font-semibold text-white">Create New Trip Ticket</h3>
                                <button 
                                    onClick={closeModal} 
                                    className="text-white hover:text-gray-200 transition-colors"
                                    disabled={processing}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </Dialog.Title>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-6">
                                    {/* Trip Ticket Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <FileText className="w-4 h-4 inline mr-1" />
                                            Trip Ticket Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="trip_ticket_number"
                                            value={formData.trip_ticket_number}
                                            onChange={handleChange}
                                            className={`w-full rounded-md border ${errors.trip_ticket_number ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2`}
                                            placeholder="Enter trip ticket number (e.g., 2024-09-01)"
                                            disabled={processing}
                                        />
                                        {errors.trip_ticket_number && (
                                            <p className="mt-1 text-sm text-red-600">{errors.trip_ticket_number}</p>
                                        )}
                                    </div>

                                    {/* Destination */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <MapPin className="w-4 h-4 inline mr-1" />
                                            Destination *
                                        </label>
                                        <input
                                            type="text"
                                            name="destination"
                                            value={formData.destination}
                                            onChange={handleChange}
                                            className={`w-full rounded-md border ${errors.destination ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2`}
                                            placeholder="Enter destination"
                                            disabled={processing}
                                        />
                                        {errors.destination && (
                                            <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
                                        )}
                                    </div>

                                    {/* Purpose */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <FileText className="w-4 h-4 inline mr-1" />
                                            Purpose *
                                        </label>
                                        <textarea
                                            name="purpose"
                                            value={formData.purpose}
                                            onChange={handleChange}
                                            rows={3}
                                            className={`w-full rounded-md border ${errors.purpose ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2`}
                                            placeholder="Enter purpose of travel"
                                            disabled={processing}
                                        />
                                        {errors.purpose && (
                                            <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>
                                        )}
                                    </div>

                                    {/* Authorized Passengers */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <Users className="w-4 h-4 inline mr-1" />
                                            Authorized Passengers
                                        </label>
                                        <textarea
                                            name="authorized_passengers"
                                            value={formData.authorized_passengers}
                                            onChange={handleChange}
                                            rows={2}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2"
                                            placeholder="Enter passenger names"
                                            disabled={processing}
                                        />
                                    </div>

                                    {/* Date and Time Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Date of Travel */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <Calendar className="w-4 h-4 inline mr-1" />
                                                Date of Travel *
                                            </label>
                                            <input
                                                type="date"
                                                name="date_of_travel"
                                                value={formData.date_of_travel}
                                                onChange={handleChange}
                                                className={`w-full rounded-md border ${errors.date_of_travel ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2`}
                                                disabled={processing}
                                            />
                                            {errors.date_of_travel && (
                                                <p className="mt-1 text-sm text-red-600">{errors.date_of_travel}</p>
                                            )}
                                        </div>

                                        {/* Time of Travel */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <Clock className="w-4 h-4 inline mr-1" />
                                                Time of Travel *
                                            </label>
                                            <input
                                                type="time"
                                                name="time_of_travel"
                                                value={formData.time_of_travel}
                                                onChange={handleChange}
                                                className={`w-full rounded-md border ${errors.time_of_travel ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2`}
                                                disabled={processing}
                                            />
                                            {errors.time_of_travel && (
                                                <p className="mt-1 text-sm text-red-600">{errors.time_of_travel}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Days of Travel and Half Day Period */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Days of Travel */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Days of Travel *
                                            </label>
                                            <input
                                                type="number"
                                                name="days_of_travel"
                                                value={formData.days_of_travel}
                                                onChange={handleChange}
                                                step="0.5"
                                                min="0.5"
                                                className={`w-full rounded-md border ${errors.days_of_travel ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2`}
                                                disabled={processing}
                                            />
                                            {errors.days_of_travel && (
                                                <p className="mt-1 text-sm text-red-600">{errors.days_of_travel}</p>
                                            )}
                                        </div>

                                        {/* Half Day Period (conditional) */}
                                        {hasHalfDay && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Half Day Period *
                                                </label>
                                                <select
                                                    name="half_day_period"
                                                    value={formData.half_day_period}
                                                    onChange={handleChange}
                                                    className={`w-full rounded-md border ${errors.half_day_period ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2`}
                                                    disabled={processing}
                                                >
                                                    <option value="">Select Period</option>
                                                    <option value="morning">Morning (until 12:00 PM)</option>
                                                    <option value="afternoon">Afternoon (until 5:00 PM)</option>
                                                </select>
                                                {errors.half_day_period && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.half_day_period}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Availability Error */}
                                    {availabilityError && (
                                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-red-800">{availabilityError}</p>
                                                    <button
                                                        type="button"
                                                        onClick={handleRetryAvailability}
                                                        className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                                                    >
                                                        Retry
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Driver and Vehicle Row */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Driver */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <UserCircle className="w-4 h-4 inline mr-1" />
                                                Driver *
                                            </label>
                                            <select
                                                name="driver_id"
                                                value={formData.driver_id}
                                                onChange={handleChange}
                                                className={`w-full rounded-md border ${errors.driver_id ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2`}
                                                disabled={processing || loadingAvailability || !canCheckAvailability || availabilityError}
                                            >
                                                {loadingAvailability ? (
                                                    <option value="">Loading available drivers...</option>
                                                ) : !canCheckAvailability ? (
                                                    <option value="">Please select date and time first</option>
                                                ) : availabilityError ? (
                                                    <option value="">Error loading drivers</option>
                                                ) : availableDrivers.length === 0 ? (
                                                    <option value="">No drivers available for this period</option>
                                                ) : (
                                                    <>
                                                        <option value="">Select Driver</option>
                                                        {availableDrivers.map(driver => (
                                                            <option key={driver.id} value={driver.id}>
                                                                {driver.name}
                                                            </option>
                                                        ))}
                                                    </>
                                                )}
                                            </select>
                                            {loadingAvailability && (
                                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Checking availability...</span>
                                                </div>
                                            )}
                                            {errors.driver_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.driver_id}</p>
                                            )}
                                        </div>

                                        {/* Vehicle */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                <Car className="w-4 h-4 inline mr-1" />
                                                Vehicle *
                                            </label>
                                            <select
                                                name="vehicle_id"
                                                value={formData.vehicle_id}
                                                onChange={handleChange}
                                                className={`w-full rounded-md border ${errors.vehicle_id ? 'border-red-300' : 'border-gray-300'} shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-3 py-2`}
                                                disabled={processing || loadingAvailability || !canCheckAvailability || availabilityError}
                                            >
                                                {loadingAvailability ? (
                                                    <option value="">Loading available vehicles...</option>
                                                ) : !canCheckAvailability ? (
                                                    <option value="">Please select date and time first</option>
                                                ) : availabilityError ? (
                                                    <option value="">Error loading vehicles</option>
                                                ) : availableVehicles.length === 0 ? (
                                                    <option value="">No vehicles available for this period</option>
                                                ) : (
                                                    <>
                                                        <option value="">Select Vehicle</option>
                                                        {availableVehicles.map(vehicle => (
                                                            <option key={vehicle.id} value={vehicle.id}>
                                                                {vehicle.description} - {vehicle.plate_number}
                                                            </option>
                                                        ))}
                                                    </>
                                                )}
                                            </select>
                                            {loadingAvailability && (
                                                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Checking availability...</span>
                                                </div>
                                            )}
                                            {errors.vehicle_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.vehicle_id}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="mt-6 flex justify-end gap-3 border-t pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md disabled:opacity-50"
                                        disabled={processing}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={processing || loadingAvailability}
                                    >
                                        {processing ? 'Processing...' : loadingAvailability ? 'Checking...' : 'Preview Ticket'}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}