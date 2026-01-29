import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function UserManagement({ users }) {
    const [activeTab, setActiveTab] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data: createData, setData: setCreateData, post: createPost, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
        name: '',
        email: '',
        department: '',
        position: '',
        role: 'client',
        password: '',
        password_confirmation: '',
    });

    const { data: editData, setData: setEditData, put: editPut, processing: editProcessing, errors: editErrors } = useForm({
        name: '',
        email: '',
        department: '',
        position: '',
        role: '',
    });

    const filteredUsers = users.filter(user => {
        if (activeTab === 'clients') return user.role === 'client';
        if (activeTab === 'admins') return user.role !== 'client';
        return true;
    });

    const handleCreate = (e) => {
        e.preventDefault();
        createPost(route('admin.users.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setShowCreateModal(false);
                resetCreate();
                setShowPassword(false);
                setShowConfirmPassword(false);
            },
        });
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setEditData({
            name: user.name,
            email: user.email,
            department: user.department,
            position: user.position,
            role: user.role,
        });
        setShowEditModal(true);
    };

    const handleEdit = (e) => {
        e.preventDefault();
        editPut(route('admin.users.update', selectedUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
                setSelectedUser(null);
            },
        });
    };

    const openDeleteModal = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        router.delete(route('admin.users.destroy', selectedUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedUser(null);
            },
        });
    };

    const getRoleBadge = (role) => {
        const styles = {
            client: 'bg-blue-100 text-blue-800',
            approval_admin: 'bg-purple-100 text-purple-800',
            assignment_admin: 'bg-green-100 text-green-800',
            ticket_admin: 'bg-yellow-100 text-yellow-800',
        };
        return styles[role] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create User Account
                    </button>
                </div>
            }
        >
            <Head title="User Management" />

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        {[
                            { key: 'all', label: 'All Users', count: users.length },
                            { key: 'clients', label: 'Clients', count: users.filter(u => u.role === 'client').length },
                            { key: 'admins', label: 'Admins', count: users.filter(u => u.role !== 'client').length },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                                    activeTab === tab.key
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.label}
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                                    activeTab === tab.key ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-sm">
                                                    <span className="text-sm font-semibold text-white">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{user.department}</div>
                                            <div className="text-sm text-gray-500">{user.position}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                                                {user.role_name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.created_by}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.created_at}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                {user.role !== 'approval_admin' && (
                                                    <button
                                                        onClick={() => openDeleteModal(user)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowCreateModal(false)}></div>
                        
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create User Account</h3>
                                
                                <form onSubmit={handleCreate}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={createData.name}
                                                onChange={e => setCreateData('name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                required
                                            />
                                            {createErrors.name && <p className="text-red-600 text-sm mt-1">{createErrors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={createData.email}
                                                onChange={e => setCreateData('email', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                required
                                            />
                                            {createErrors.email && <p className="text-red-600 text-sm mt-1">{createErrors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                            <input
                                                type="text"
                                                value={createData.department}
                                                onChange={e => setCreateData('department', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                required
                                            />
                                            {createErrors.department && <p className="text-red-600 text-sm mt-1">{createErrors.department}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                            <input
                                                type="text"
                                                value={createData.position}
                                                onChange={e => setCreateData('position', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                required
                                            />
                                            {createErrors.position && <p className="text-red-600 text-sm mt-1">{createErrors.position}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                            <select
                                                value={createData.role}
                                                onChange={e => setCreateData('role', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                required
                                            >
                                                <option value="client">Client</option>
                                                <option value="assignment_admin">Assignment Admin</option>
                                                <option value="ticket_admin">Ticket Admin</option>
                                            </select>
                                            {createErrors.role && <p className="text-red-600 text-sm mt-1">{createErrors.role}</p>}
                                        </div>

                                        {/* Password Field */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={createData.password}
                                                    onChange={e => setCreateData('password', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 pr-10"
                                                    required
                                                    minLength={8}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPassword ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                                            {createErrors.password && <p className="text-red-600 text-sm mt-1">{createErrors.password}</p>}
                                        </div>

                                        {/* Confirm Password Field */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={createData.password_confirmation}
                                                    onChange={e => setCreateData('password_confirmation', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 pr-10"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showConfirmPassword ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                            {createErrors.password_confirmation && <p className="text-red-600 text-sm mt-1">{createErrors.password_confirmation}</p>}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCreateModal(false);
                                                setShowPassword(false);
                                                setShowConfirmPassword(false);
                                            }}
                                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={createProcessing}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                                        >
                                            {createProcessing ? 'Creating...' : 'Create Account'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal - unchanged */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowEditModal(false)}></div>
                        
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit User</h3>
                                
                                <form onSubmit={handleEdit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={editData.name}
                                                onChange={e => setEditData('name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                required
                                            />
                                            {editErrors.name && <p className="text-red-600 text-sm mt-1">{editErrors.name}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={editData.email}
                                                onChange={e => setEditData('email', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                required
                                            />
                                            {editErrors.email && <p className="text-red-600 text-sm mt-1">{editErrors.email}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                            <input
                                                type="text"
                                                value={editData.department}
                                                onChange={e => setEditData('department', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                required
                                            />
                                            {editErrors.department && <p className="text-red-600 text-sm mt-1">{editErrors.department}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                            <input
                                                type="text"
                                                value={editData.position}
                                                onChange={e => setEditData('position', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                required
                                            />
                                            {editErrors.position && <p className="text-red-600 text-sm mt-1">{editErrors.position}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                            <select
                                                value={editData.role}
                                                onChange={e => setEditData('role', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                                                required
                                                disabled={selectedUser.role === 'approval_admin'}
                                            >
                                                <option value="client">Client</option>
                                                <option value="assignment_admin">Assignment Admin</option>
                                                <option value="ticket_admin">Ticket Admin</option>
                                                {selectedUser.role === 'approval_admin' && (
                                                    <option value="approval_admin">Approval Admin</option>
                                                )}
                                            </select>
                                            {editErrors.role && <p className="text-red-600 text-sm mt-1">{editErrors.role}</p>}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowEditModal(false)}
                                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={editProcessing}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
                                        >
                                            {editProcessing ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal - unchanged */}
            {showDeleteModal && selectedUser && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setShowDeleteModal(false)}></div>
                        
                        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Delete User</h3>
                                        <p className="text-sm text-gray-500">This action cannot be undone</p>
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-6">
                                    Are you sure you want to delete <strong>{selectedUser.name}</strong>? 
                                    All their data will be permanently removed.
                                </p>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                    >
                                        Delete User
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}