import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Trash2, Edit, Plus, X, Check, Phone, User, FileText } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Drivers({ auth, drivers = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [expandedDescription, setExpandedDescription] = useState(null);
    
    const { data, setData, post, put, reset, errors, processing } = useForm({
        name: '',
        contact_number: '',
        description: '',
    });

    useEffect(() => {
        if (editingDriver) {
            setData({
                name: editingDriver.name,
                contact_number: editingDriver.contact_number,
                description: editingDriver.description || '',
            });
        } else {
            reset();
        }
    }, [editingDriver]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingDriver) {
            put(`/assignment/drivers/${editingDriver.id}`, {
                onSuccess: () => {
                    closeModal();
                },
            });
        } else {
            post('/assignment/drivers', {
                onSuccess: () => {
                    closeModal();
                },
            });
        }
    };

    const handleEdit = (driver) => {
        setEditingDriver(driver);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        router.delete(`/assignment/drivers/${id}`, {
            onSuccess: () => {
                setDeleteConfirm(null);
            },
        });
    };

    const openAddModal = () => {
        setEditingDriver(null);
        reset();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingDriver(null);
        reset();
    };

    const truncateText = (text, maxLength = 60) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Driver Management
                    </h2>

                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add New Driver
                    </button>
                </div>
            }
        >
            <Head title="Drivers Management" />

            <div className="py-2">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">Total Drivers</p>
                                        <p className="text-2xl font-semibold text-gray-900">{drivers.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <Check className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">Available</p>
                                        <p className="text-2xl font-semibold text-gray-900">{drivers.filter(d => d.status !== 'busy').length || drivers.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="bg-yellow-100 p-3 rounded-full">
                                        <User className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">On Duty</p>
                                        <p className="text-2xl font-semibold text-gray-900">{drivers.filter(d => d.status === 'busy').length || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="bg-purple-100 p-3 rounded-full">
                                        <Phone className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm text-gray-600">New This Month</p>
                                        <p className="text-2xl font-semibold text-gray-900">0</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Drivers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {drivers.map((driver) => (
                            <div key={driver.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <User className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(driver)}
                                                className="px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-2"
                                                title="Edit driver"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() => setDeleteConfirm(driver.id)}
                                                className="px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2"
                                                title="Delete driver"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{driver.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                                        <Phone className="w-4 h-4" />
                                        <span className="text-sm">{driver.contact_number}</span>
                                    </div>

                                    {/* Description */}
                                    {driver.description && (
                                        <div className="mb-4">
                                            <div className="flex items-start gap-2 text-gray-600">
                                                <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm">
                                                        {expandedDescription === driver.id 
                                                            ? driver.description 
                                                            : truncateText(driver.description)}
                                                    </p>
                                                    {driver.description.length > 60 && (
                                                        <button
                                                            onClick={() => setExpandedDescription(
                                                                expandedDescription === driver.id ? null : driver.id
                                                            )}
                                                            className="text-blue-600 hover:text-blue-700 text-xs mt-1"
                                                        >
                                                            {expandedDescription === driver.id ? 'Show less' : 'Read more'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {drivers.length === 0 && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-12 text-center">
                                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
                                <p className="text-gray-500 mb-4">Get started by adding your first driver</p>
                                <button
                                    onClick={openAddModal}
                                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add First Driver
                                </button>
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
                                            {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                                        </h2>
                                        <button
                                            onClick={closeModal}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-500" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Driver Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="Enter driver name"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.contact_number}
                                            onChange={(e) => setData('contact_number', e.target.value)}
                                            className={`w-full px-3 py-2 border ${errors.contact_number ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                            placeholder="Enter contact number"
                                        />
                                        {errors.contact_number && (
                                            <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>
                                        )}
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            className={`w-full px-3 py-2 border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
                                            placeholder="Enter driver description (optional)"
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
                                    
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSubmit}
                                            disabled={processing || !data.name || !data.contact_number}
                                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {processing ? 'Saving...' : (editingDriver ? 'Update' : 'Add')} Driver
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
                                        <h3 className="text-lg font-semibold text-gray-900">Delete Driver</h3>
                                        <p className="text-sm text-gray-500">This action cannot be undone</p>
                                    </div>
                                </div>
                                
                                <p className="text-gray-600 mb-6">
                                    Are you sure you want to delete this driver? All associated data will be permanently removed.
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
                                        Delete Driver
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