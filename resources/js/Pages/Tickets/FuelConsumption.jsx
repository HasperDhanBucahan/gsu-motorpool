import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Fuel, Edit2, Save, X, ChevronLeft, Download } from "lucide-react";

export default function FuelConsumption({ vehicles, fuelData }) {
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [editingMonth, setEditingMonth] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [processing, setProcessing] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Sort vehicles by ID (lowest to highest)
    const sortedVehicles = [...vehicles].sort((a, b) => a.id - b.id);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

    const getFuelConsumption = (vehicleId, year, monthIndex) => {
        const dbMonth = monthIndex + 1;
        const key = `${vehicleId}-${year}-${dbMonth}`;
        return fuelData[key] || null;
    };

    const handleEdit = (monthIndex) => {
        const consumption = getFuelConsumption(selectedVehicle.id, selectedYear, monthIndex);
        setEditingMonth(monthIndex);
        setEditValue(consumption?.liters || '');
    };

    const handleSave = (monthIndex) => {
        if (!editValue || parseFloat(editValue) < 0) {
            alert('Please enter a valid number of liters');
            return;
        }

        setProcessing(true);

        router.post(
            route('tickets.fuel-consumption.store'),
            {
                vehicle_id: selectedVehicle.id,
                year: selectedYear,
                month: monthIndex + 1,
                liters: parseFloat(editValue)
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingMonth(null);
                    setEditValue('');
                    setProcessing(false);
                },
                onError: (errors) => {
                    alert(errors.liters || 'Failed to save fuel consumption');
                    setProcessing(false);
                },
                onFinish: () => {
                    setProcessing(false);
                }
            }
        );
    };

    const handleCancel = () => {
        setEditingMonth(null);
        setEditValue('');
    };

    const getTotalConsumption = () => {
        let total = 0;
        months.forEach((_, index) => {
            const consumption = getFuelConsumption(selectedVehicle.id, selectedYear, index);
            if (consumption) {
                total += parseFloat(consumption.liters);
            }
        });
        return total.toFixed(2);
    };

    const handleExport = async () => {
        setExporting(true);
        
        try {
            // Create a form and submit it to trigger file download
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = route('tickets.fuel-consumption.export');
            form.style.display = 'none';
            
            // Add CSRF token
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = document.querySelector('meta[name="csrf-token"]').content;
            form.appendChild(csrfInput);
            
            // Add year parameter
            const yearInput = document.createElement('input');
            yearInput.type = 'hidden';
            yearInput.name = 'year';
            yearInput.value = selectedYear;
            form.appendChild(yearInput);
            
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
            
            // Reset exporting state after a delay
            setTimeout(() => {
                setExporting(false);
            }, 2000);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export fuel consumption data');
            setExporting(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Vehicle Fuel Consumption</h2>
                    <button
                        onClick={handleExport}
                        disabled={exporting}
                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        {exporting ? 'Exporting...' : 'Export to Excel'}
                    </button>
                </div>
            }
        >
            <Head title="Fuel Consumption" />

            {/* Mobile View - One panel at a time */}
            <div className="lg:hidden p-4 sm:p-6">
                {!selectedVehicle ? (
                    // Mobile Vehicle List
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 sm:p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Select a Vehicle</h3>
                            <p className="text-sm text-gray-500 mt-1">Click on a vehicle to manage its fuel consumption</p>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {sortedVehicles.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Fuel className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p>No vehicles available</p>
                                </div>
                            ) : (
                                sortedVehicles.map((vehicle) => (
                                    <button
                                        key={vehicle.id}
                                        onClick={() => setSelectedVehicle(vehicle)}
                                        className="w-full px-4 sm:px-6 py-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors text-left"
                                    >
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Fuel className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-900 truncate">{vehicle.description}</h4>
                                            <p className="text-sm text-gray-500">{vehicle.plate_number}</p>
                                            <div className="flex gap-4 mt-1">
                                                <span className="text-xs text-gray-500">Type: {vehicle.fuel_type || 'N/A'}</span>
                                                <span className="text-xs text-gray-500">Status: 
                                                    <span className={`ml-1 ${vehicle.status === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {vehicle.status}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    // Mobile Consumption View
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-4 border-b border-gray-200">
                            <button
                                onClick={() => setSelectedVehicle(null)}
                                className="mb-3 flex items-center text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <ChevronLeft className="w-5 h-5 mr-1" />
                                Back to Vehicles
                            </button>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedVehicle.description}</h3>
                                    <p className="text-sm text-gray-500">{selectedVehicle.plate_number}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        {years.map((year) => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="p-4">
                            <h4 className="text-base font-semibold text-gray-900 mb-4">
                                {selectedYear} Fuel Consumption (L)
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Month
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Liters
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {months.map((month, index) => {
                                            const consumption = getFuelConsumption(selectedVehicle.id, selectedYear, index);
                                            const isEditing = editingMonth === index;

                                            return (
                                                <tr key={month} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {month}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={editValue}
                                                                onChange={(e) => setEditValue(e.target.value)}
                                                                className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                                                placeholder="0.00"
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <span className={consumption ? 'font-semibold' : 'text-gray-400'}>
                                                                {consumption ? `${parseFloat(consumption.liters).toFixed(2)} L` : '-'}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                        {isEditing ? (
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    onClick={() => handleSave(index)}
                                                                    disabled={processing}
                                                                    className="inline-flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded disabled:opacity-50"
                                                                >
                                                                    <Save className="w-3 h-3" />
                                                                </button>
                                                                <button
                                                                    onClick={handleCancel}
                                                                    disabled={processing}
                                                                    className="inline-flex items-center px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-medium rounded disabled:opacity-50"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleEdit(index)}
                                                                className="inline-flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded"
                                                            >
                                                                <Edit2 className="w-3 h-3 mr-1" />
                                                                {consumption ? 'Edit' : 'Add'}
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-50 font-semibold">
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                Total
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {getTotalConsumption()} L
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Desktop/Tablet View - Full Screen Split Layout */}
            <div className="hidden lg:flex h-[calc(100vh-theme(spacing.32))]">
                {/* Left Sidebar - Vehicle List */}
                <div className="w-[420px] flex-shrink-0 border-r border-gray-200 bg-white">
                    <div className="h-full flex flex-col">
                        <div className="px-6 py-5 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">Vehicles</h3>
                            <p className="text-sm text-gray-500 mt-1">Select a vehicle to view fuel consumption</p>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-gray-200">
                            {sortedVehicles.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Fuel className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                                    <p>No vehicles available</p>
                                </div>
                            ) : (
                                sortedVehicles.map((vehicle) => (
                                    <button
                                        key={vehicle.id}
                                        onClick={() => setSelectedVehicle(vehicle)}
                                        className={`w-full px-6 py-5 flex items-center space-x-4 transition-colors text-left ${
                                            selectedVehicle?.id === vehicle.id
                                                ? 'bg-blue-50 border-l-4 border-blue-600'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className={`w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                            selectedVehicle?.id === vehicle.id
                                                ? 'bg-blue-600'
                                                : 'bg-blue-100'
                                        }`}>
                                            <Fuel className={`w-7 h-7 ${
                                                selectedVehicle?.id === vehicle.id
                                                    ? 'text-white'
                                                    : 'text-blue-600'
                                            }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-semibold text-base truncate ${
                                                selectedVehicle?.id === vehicle.id
                                                    ? 'text-blue-900'
                                                    : 'text-gray-900'
                                            }`}>{vehicle.description}</h4>
                                            <p className="text-sm text-gray-600 mt-0.5">{vehicle.plate_number}</p>
                                            <div className="flex flex-col gap-1 mt-2">
                                                <span className="text-xs text-gray-500">
                                                    <span className="font-medium">Type:</span> {vehicle.fuel_type || 'N/A'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    <span className="font-medium">Status:</span> 
                                                    <span className={`ml-1 font-semibold ${vehicle.status === 'available' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {vehicle.status}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel - Fuel Consumption */}
                <div className="flex-1 min-w-0 bg-gray-50">
                    {!selectedVehicle ? (
                        // Empty State
                        <div className="h-full flex items-center justify-center p-8">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                                    <Fuel className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vehicle Selected</h3>
                                <p className="text-sm text-gray-500 max-w-sm mx-auto">Please select a vehicle from the list to view and manage its fuel consumption data</p>
                            </div>
                        </div>
                    ) : (
                        // Consumption Table
                        <div className="h-full flex flex-col bg-white">
                            <div className="px-8 py-6 border-b border-gray-200 bg-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedVehicle.description}</h3>
                                        <p className="text-base text-gray-600 mt-1">{selectedVehicle.plate_number}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <label className="text-sm font-medium text-gray-700">Year:</label>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base py-2"
                                        >
                                            {years.map((year) => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-8 py-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-6">
                                    {selectedYear} Fuel Consumption (Liters)
                                </h4>
                                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    Month
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    No. of Liters Consumed
                                                </th>
                                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {months.map((month, index) => {
                                                const consumption = getFuelConsumption(selectedVehicle.id, selectedYear, index);
                                                const isEditing = editingMonth === index;

                                                return (
                                                    <tr key={month} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {month}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {isEditing ? (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    value={editValue}
                                                                    onChange={(e) => setEditValue(e.target.value)}
                                                                    className="w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                                    placeholder="0.00"
                                                                    autoFocus
                                                                />
                                                            ) : (
                                                                <span className={consumption ? 'font-semibold text-base' : 'text-gray-400'}>
                                                                    {consumption ? `${parseFloat(consumption.liters).toFixed(2)} L` : '-'}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {isEditing ? (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => handleSave(index)}
                                                                        disabled={processing}
                                                                        className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors"
                                                                    >
                                                                        <Save className="w-4 h-4 mr-1.5" />
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={handleCancel}
                                                                        disabled={processing}
                                                                        className="inline-flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors"
                                                                    >
                                                                        <X className="w-4 h-4 mr-1.5" />
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleEdit(index)}
                                                                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                                                                >
                                                                    <Edit2 className="w-4 h-4 mr-1.5" />
                                                                    {consumption ? 'Update' : 'Add'}
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-blue-50 font-semibold border-t-2 border-blue-200">
                                                <td className="px-6 py-4 text-base text-gray-900">
                                                    Total
                                                </td>
                                                <td className="px-6 py-4 text-base text-blue-900">
                                                    {getTotalConsumption()} L
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}