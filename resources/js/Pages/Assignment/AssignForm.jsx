import React, { useState, useEffect } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AssignmentPreviewModal from '@/Components/AssignmentPreviewModal';
import { Car, User, AlertTriangle, CheckCircle, Clock, MapPin, Calendar, Users, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const formatDateTime = (dateTime) => {
    return format(new Date(dateTime), 'MMMM d, yyyy h:mm a');
};

export default function AssignmentForm({ auth, request, availableVehicles, availableDrivers }) {
    const { auth: pageAuth } = usePage().props;
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [selectedDriver, setSelectedDriver] = useState('');
    const [conflicts, setConflicts] = useState([]);
    const [checking, setChecking] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [declineReason, setDeclineReason] = useState('');
    const [submittingDecline, setSubmittingDecline] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        vehicle_id: '',
        driver_id: '',
    });

    // Check if no resources are available
    const noVehiclesAvailable = availableVehicles.length === 0;
    const noDriversAvailable = availableDrivers.length === 0;
    const noResourcesAvailable = noVehiclesAvailable || noDriversAvailable;

    // Check for conflicts when selections change
    useEffect(() => {
        if (selectedVehicle && selectedDriver) {
            checkConflicts();
        }
    }, [selectedVehicle, selectedDriver]);

    const checkConflicts = async () => {
        if (!selectedVehicle || !selectedDriver) return;
        
        setChecking(true);
        try {
            const response = await fetch(
                `/assignment/check-availability?vehicle_id=${selectedVehicle}&driver_id=${selectedDriver}&start_datetime=${request.start_datetime}&end_datetime=${request.end_datetime}`
            );
            const result = await response.json();
            setConflicts(result.conflicts || []);
        } catch (error) {
            console.error('Error checking availability:', error);
        } finally {
            setChecking(false);
        }
    };

    const handlePreview = () => {
        if (conflicts.length > 0) {
            alert('Please resolve conflicts before previewing the assignment.');
            return;
        }

        if (!selectedVehicle || !selectedDriver) {
            alert('Please select both a vehicle and a driver.');
            return;
        }

        // Generate preview URL
        const url = route('assignment.requests.preview', {
            id: request.id,
            vehicle_id: selectedVehicle,
            driver_id: selectedDriver
        });

        setPreviewUrl(url);
        setIsPreviewModalOpen(true);
    };

    const handleConfirmAssignment = () => {
        post(route('assignment.requests.assign', request.id), {
            onSuccess: () => {
                setIsPreviewModalOpen(false);
            },
            onError: (errors) => {
                setIsPreviewModalOpen(false);
                console.error('Assignment errors:', errors);
            }
        });
    };

    const handleVehicleSelect = (vehicleId) => {
        setSelectedVehicle(vehicleId);
        setData('vehicle_id', vehicleId);
    };

    const handleDriverSelect = (driverId) => {
        setSelectedDriver(driverId);
        setData('driver_id', driverId);
    };

    const handleDeclineClick = () => {
        setShowDeclineModal(true);
    };

    const closeDeclineModal = () => {
        setShowDeclineModal(false);
        setDeclineReason('');
    };

    const handleDeclineSubmit = () => {
        if (!declineReason.trim()) {
            alert('Please provide a reason for declining.');
            return;
        }

        

        setSubmittingDecline(true);

        router.post(route('assignment.requests.forward-decline', request.id), {
            decline_reason: declineReason.trim()
        }, {
            preserveScroll: true,
            onSuccess: () => {
                console.log('Request forwarded to approval admin for declining');
                setShowDeclineModal(false);
                setDeclineReason('');
            },
            onError: (errors) => {
                console.error('Forward decline error:', errors);
                if (errors.decline_reason) {
                    alert('Decline reason error: ' + errors.decline_reason);
                } else if (errors.error) {
                    alert('Error: ' + errors.error);
                } else {
                    alert('Failed to forward decline request. Please try again.');
                }
            },
            onFinish: () => {
                setSubmittingDecline(false);
            }
        });
    };

    const canPreview = selectedVehicle && selectedDriver && conflicts.length === 0 && !processing;

    // Get selected vehicle and driver objects for preview
    const selectedVehicleObj = availableVehicles.find(v => v.id.toString() === selectedVehicle);
    const selectedDriverObj = availableDrivers.find(d => d.id.toString() === selectedDriver);

    return (
        <AuthenticatedLayout 
            user={auth.user}
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Vehicle & Driver Assignment
                    </h2>
                </div>
            }
        
        >
            <Head title="Assign Vehicle & Driver" />

            <div className="py-0">
                <div className="max-w-0xl mx-auto sm:px-0 lg:px-0">

                    {/* No Resources Warning */}
                    {noResourcesAvailable && (
                        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle size={20} className="text-yellow-600 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="font-medium text-yellow-800">No Resources Available</h3>
                                    <p className="text-yellow-700 text-sm mt-1">
                                        {noVehiclesAvailable && noDriversAvailable && 
                                            'There are no vehicles or drivers available for this time period.'}
                                        {noVehiclesAvailable && !noDriversAvailable && 
                                            'There are no vehicles available for this time period.'}
                                        {!noVehiclesAvailable && noDriversAvailable && 
                                            'There are no drivers available for this time period.'}
                                    </p>
                                    <p className="text-yellow-700 text-sm mt-1">
                                        You can forward this request to the approval admin for declining with a reason.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Assignment Form */}
                        <div className="lg:col-span-2">
                            <div className="space-y-6">
                                {/* Conflicts Alert */}
                                {conflicts.length > 0 && (
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                        <div className="flex items-center gap-2">
                                            <AlertTriangle size={16} className="text-red-500" />
                                            <h3 className="font-medium text-red-800">Assignment Conflicts</h3>
                                        </div>
                                        <ul className="mt-2 text-red-700 list-disc list-inside">
                                            {conflicts.map((conflict, index) => (
                                                <li key={index}>{conflict}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Vehicle Selection */}
                                <div className="bg-white shadow-sm rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Car size={20} className="text-blue-600" />
                                        <h3 className="text-xl font-semibold text-gray-900">Select Vehicle</h3>
                                    </div>

                                    {availableVehicles.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <Car size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p>No vehicles available for this time period</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {availableVehicles.map((vehicle) => (
                                                <div
                                                    key={vehicle.id}
                                                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                                                        selectedVehicle === vehicle.id.toString()
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                    onClick={() => handleVehicleSelect(vehicle.id.toString())}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold text-gray-900">{vehicle.description}</h4>
                                                        {selectedVehicle === vehicle.id.toString() && (
                                                            <CheckCircle size={20} className="text-blue-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-gray-600">{vehicle.plate_number}</p>
                                                    <p className="text-sm text-gray-500">{vehicle.fuel_type}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {errors.vehicle_id && (
                                        <p className="mt-2 text-red-600 text-sm">{errors.vehicle_id}</p>
                                    )}
                                </div>

                                {/* Driver Selection */}
                                <div className="bg-white shadow-sm rounded-lg p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <User size={20} className="text-green-600" />
                                        <h3 className="text-xl font-semibold text-gray-900">Select Driver</h3>
                                    </div>

                                    {availableDrivers.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <User size={48} className="mx-auto mb-4 text-gray-300" />
                                            <p>No drivers available for this time period</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {availableDrivers.map((driver) => (
                                                <div
                                                    key={driver.id}
                                                    className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                                                        selectedDriver === driver.id.toString()
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                    onClick={() => handleDriverSelect(driver.id.toString())}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-semibold text-gray-900">{driver.name}</h4>
                                                        {selectedDriver === driver.id.toString() && (
                                                            <CheckCircle size={20} className="text-green-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">{driver.contact_number}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {errors.driver_id && (
                                        <p className="mt-2 text-red-600 text-sm">{errors.driver_id}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="bg-white shadow-sm rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            {checking && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Clock size={16} className="animate-spin" />
                                                    <span>Checking availability...</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button
                                                type="button"
                                                onClick={() => router.visit(route('assignment.requests.index'))}
                                                className="px-8 py-3 bg-gray-500 text-white rounded hover:bg-gray-600"
                                                disabled={processing || submittingDecline}
                                            >
                                                Cancel
                                            </button>
                                            
                                            {noResourcesAvailable ? (
                                                <button
                                                    type="button"
                                                    onClick={handleDeclineClick}
                                                    disabled={submittingDecline}
                                                    className="px-8 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition flex items-center gap-2"
                                                >
                                                    <XCircle size={18} />
                                                    Forward for Decline
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={handlePreview}
                                                    disabled={!canPreview}
                                                    className={`px-8 py-3 rounded-md font-medium transition ${
                                                        canPreview
                                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                >
                                                    Preview Assignment
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Request Details */}
                        <div className="lg:col-span-1">
                            <div className="bg-white shadow-sm rounded-lg p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Details</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="font-medium text-gray-700">Requester: </label> 
                                        <p className="text-gray-900">{request.user.name}</p>
                                        <p className="text-sm text-gray-600">{request.user.department} - {request.user.position}</p>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <MapPin size={16} className="text-gray-500 mt-1" />
                                        <div>
                                            <label className="font-medium text-gray-700">Destination</label>
                                            <p className="text-gray-900">{request.destination}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Calendar size={16} className="text-gray-500 mt-1" />
                                        <div>
                                            <label className="font-medium text-gray-700">Schedule</label>
                                            <p className="text-gray-900">{formatDateTime(request.start_datetime)}</p>
                                            <p className="text-sm text-gray-600">
                                                Duration: {request.days_of_travel} day(s)
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        <Users size={16} className="text-gray-500 mt-1" />
                                        <div>
                                            <label className="font-medium text-gray-700">Passengers</label>
                                            <p className="text-gray-900">{request.authorized_passengers}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="font-medium text-gray-700">Purpose</label>
                                        <p className="text-gray-900">{request.purpose}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <AssignmentPreviewModal
                isOpen={isPreviewModalOpen}
                closeModal={() => setIsPreviewModalOpen(false)}
                request={request}
                selectedVehicle={selectedVehicleObj}
                selectedDriver={selectedDriverObj}
                assignmentAdmin={pageAuth.user}
                onConfirmAssignment={handleConfirmAssignment}
                processing={processing}
                previewUrl={previewUrl}
            />

            {/* Decline Reason Modal */}
            {showDeclineModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                                <h3 className="text-lg font-medium text-gray-900">
                                    Forward Request for Decline
                                </h3>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Please provide a reason for declining this request. This will be forwarded to the approval admin.
                                <span className="text-red-500">*</span>
                            </p>
                            <textarea
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                placeholder="Reason for declining the request"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                                rows="4"
                                maxLength="500"
                                required
                            />
                            
                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={closeDeclineModal}
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 text-sm font-medium rounded-md transition-colors"
                                    disabled={submittingDecline}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeclineSubmit}
                                    disabled={!declineReason.trim() || declineReason.trim().length < 5 || submittingDecline}
                                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                                >
                                    {submittingDecline ? 'Forwarding...' : 'Forward to Approval Admin'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}