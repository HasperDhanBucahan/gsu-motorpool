import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, X, Car, Wrench, CheckCircle, AlertCircle, Filter, FileText } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Vehicles({ auth, vehicles = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [expandedDescription, setExpandedDescription] = useState(null);
    
    const { data, setData, post, put, reset, errors, processing } = useForm({
        model: '',
        plate_number: '',
        fuel_type: '',
        description: '',
        status: 'available',
    });

    const fuelTypes = [
        'Diesel', 
    ];

    const statusOptions = [
        { value: 'available', label: 'Available', color: 'green' },
        { value: 'in_use', label: 'In Use', color: 'blue' },
        { value: 'maintenance', label: 'Maintenance', color: 'yellow' }
    ];

    useEffect(() => {
        if (editingVehicle) {
            setData({
                model: editingVehicle.model,
                plate_number: editingVehicle.plate_number,
                fuel_type: editingVehicle.fuel_type,
                description: editingVehicle.description || '',
                status: editingVehicle.status,
            });
        } else {
            reset();
        }
    }, [editingVehicle]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingVehicle) {
            put(`/assignment/vehicles/${editingVehicle.id}`, {
                onSuccess: () => {
                    closeModal();
                },
            });
        } else {
            post('/assignment/vehicles', {
                onSuccess: () => {
                    closeModal();
                },
            });
        }
    };

    const handleEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        router.delete(`/assignment/vehicles/${id}`, {
            onSuccess: () => {
                setDeleteConfirm(null);
            },
        });
    };

    const openAddModal = () => {
        setEditingVehicle(null);
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingVehicle(null);
        reset();
    };

    const getStatusBadge = (status) => {
        const statusConfig = statusOptions.find(s => s.value === status);
        const colors = {
            green: 'bg-green-100 text-green-700',
            blue: 'bg-blue-100 text-blue-700',
            yellow: 'bg-yellow-100 text-yellow-700'
        };
        return colors[statusConfig?.color] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'available':
                return <CheckCircle className="w-4 h-4" />;
            case 'in_use':
                return <Car className="w-4 h-4" />;
            case 'maintenance':
                return <Wrench className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const truncateText = (text, maxLength = 60) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const filteredVehicles = filterStatus === 'all' 
        ? vehicles 
        : vehicles.filter(v => v.status === filterStatus);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center space-x-4">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Vehicle Management
                    </h2>

                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Vehicle
                    </button>
                </div>
            }
        >
            <Head title="Vehicle Management" />
            
            <div className="py-2">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        <Car className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">Total Vehicles</p>
                                        <p className="text-2xl font-semibold text-gray-900">{vehicles.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">Available</p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {vehicles.filter(v => v.status === 'available').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        <Car className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">In Use</p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {vehicles.filter(v => v.status === 'in_use').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="bg-yellow-100 p-3 rounded-full">
                                        <Wrench className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">Maintenance</p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {vehicles.filter(v => v.status === 'maintenance').length}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                        filterStatus === 'all' 
                                            ? 'bg-gray-900 text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    All ({vehicles.length})
                                </button>
                                {statusOptions.map(status => (
                                    <button
                                        key={status.value}
                                        onClick={() => setFilterStatus(status.value)}
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                            filterStatus === status.value 
                                                ? 'bg-gray-900 text-white' 
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {status.label} ({vehicles.filter(v => v.status === status.value).length})
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Vehicles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredVehicles.map((vehicle) => (
                            <div key={vehicle.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <Car className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(vehicle)}
                                                className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
                                                title="Edit vehicle"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => setDeleteConfirm(vehicle.id)}
                                                className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                                                title="Delete vehicle"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{vehicle.description}</h3>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Plate No.:</span>
                                        <span className="text-sm font-medium text-gray-900">{vehicle.plate_number}</span>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-500">Year Model:</span>
                                        <span className="text-sm font-medium text-gray-900">{vehicle.model}</span>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Fuel Type:</span>
                                            <span className="text-sm font-medium text-gray-900">{vehicle.fuel_type}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-500">Status:</span>
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(vehicle.status)}`}>
                                                {getStatusIcon(vehicle.status)}
                                                {statusOptions.find(s => s.value === vehicle.status)?.label}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>Last updated: {vehicle.updated_at ? new Date(vehicle.updated_at).toLocaleDateString() : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredVehicles.length === 0 && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-12 text-center">
                                <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {filterStatus === 'all' ? 'No vehicles found' : `No ${filterStatus.replace('_', ' ')} vehicles`}
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    {filterStatus === 'all' ? 'Get started by adding your first vehicle' : 'Try changing the filter or add a new vehicle'}
                                </p>
                                {filterStatus === 'all' && (
                                    <button
                                        onClick={openAddModal}
                                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add First Vehicle
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Add/Edit Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-semibold text-gray-900">
                                            {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
                                        </h2>
                                        <button
                                            onClick={closeModal}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    {/* Model */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Model <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.model}
                                            onChange={(e) => setData('model', e.target.value)}
                                            className={`w-full px-3 py-2 border ${errors.model ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="Enter vehicle model"
                                        />
                                        {errors.model && (
                                            <p className="mt-1 text-sm text-red-600">{errors.model}</p>
                                        )}
                                    </div>

                                    {/* Plate Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Plate Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.plate_number}
                                            onChange={(e) => setData('plate_number', e.target.value)}
                                            className={`w-full px-3 py-2 border ${errors.plate_number ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="Enter plate number"
                                        />
                                        {errors.plate_number && (
                                            <p className="mt-1 text-sm text-red-600">{errors.plate_number}</p>
                                        )}
                                    </div>

                                    {/* Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fuel Type <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.fuel_type}
                                            onChange={(e) => setData('fuel_type', e.target.value)}
                                            className={`w-full px-3 py-2 border ${errors.fuel_type ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            <option value="">Select type</option>
                                            {fuelTypes.map((fuel_type) => (
                                                <option key={fuel_type} value={fuel_type}>
                                                    {fuel_type}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.fuel_type && (
                                            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className={`w-full px-3 py-2 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                                            placeholder="Enter vehicle description (optional)"
                                            rows="4"
                                            maxLength="1000"
                                        />
                                        <div className="flex justify-between items-center mt-1">
                                            <div>
                                                {errors.description && (
                                                    <p className="text-sm text-red-600">{errors.description}</p>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {data.description.length}/1000 characters
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className={`w-full px-3 py-2 border ${errors.status ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        >
                                            {statusOptions.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.status && (
                                            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={processing || !data.model || !data.plate_number || !data.fuel_type}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? 'Saving...' : (editingVehicle ? 'Update' : 'Add')} Vehicle
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    {deleteConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-lg max-w-md w-full p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <Trash2 className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Delete Vehicle</h3>
                                        <p className="text-sm text-gray-500">This action cannot be undone</p>
                                    </div>
                                </div>

                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete this vehicle? All associated data will be permanently removed.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleDelete(deleteConfirm)}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Delete Vehicle
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div> 
        </AuthenticatedLayout>
    );
}