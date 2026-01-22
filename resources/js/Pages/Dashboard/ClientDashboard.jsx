import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import StatCard from './Components/StatCard';
import CalendarWidget from '@/Components/CalendarWidget';
import SignatureModal from '@/Components/SignatureModal';
import { FileText, CheckCircle, Clock, AlertCircle, Users } from 'lucide-react';

export default function ClientDashboard({ data }) {
    const { auth } = usePage().props;
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    return (
        <div className="py-0">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="space-y-6">
                    {/* Signature Section - Commented out
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Pen className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Digital Signature</h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Your signature will be used on your vehicle requests
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {auth.user?.signature_path ? (
                                    <div className="flex items-center gap-3">
                                        <div className="border rounded-lg p-2 bg-gray-50">
                                            <img 
                                                src={`/storage/${auth.user.signature_path}`} 
                                                alt="Current Signature" 
                                                className="h-12 max-w-xs object-contain"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-green-600">
                                            <CheckCircle className="w-4 h-4" />
                                            <span>Signature Set</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                                        <Clock className="w-4 h-4" />
                                        <span>No signature set - Required for requests</span>
                                    </div>
                                )}
                                
                                <button
                                    onClick={() => setIsSignatureModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition whitespace-nowrap"
                                >
                                    <Pen className="w-4 h-4" />
                                    {auth.user?.signature_path ? 'Update Signature' : 'Create Signature'}
                                </button>
                            </div>
                        </div>
                    </div>
                    */}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Pending Requests"
                            value={data.pendingRequests}
                            icon={Clock}
                            color="yellow"
                            link={route('requests.index')}
                        />
                        <StatCard
                            title="Assigned Requests"
                            value={data.assignedRequests}
                            icon={AlertCircle}
                            color="blue"
                            link={route('requests.index')}
                        />
                        <StatCard
                            title="Approved Requests"
                            value={data.approvedRequests}
                            icon={CheckCircle}
                            color="green"
                            link={route('requests.index')}
                        />
                        <StatCard
                            title="Completed Requests"
                            value={data.completedRequests}
                            icon={CheckCircle}
                            color="purple"
                            link={route('requests.index')}
                        />
                    </div>

                    {/* Request Button */}
                    <div className="flex justify-end">
                        <a 
                            href={route('requests.create')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg shadow-md transition"
                        >
                            + Request Vehicle
                        </a>
                    </div>

                    <CalendarWidget userRole="client" />
                </div>
            </div>
            
            {/* Signature Modal */}
            <SignatureModal 
                isOpen={isSignatureModalOpen}
                closeModal={() => setIsSignatureModalOpen(false)}
                currentSignature={auth.user?.signature_path}
            />
        </div>
    );
}