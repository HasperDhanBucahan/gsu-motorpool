import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CarFront, Users, FileText, CheckCircle, Pen, Clock } from 'lucide-react';
import DashboardCard from './Components/DashboardCard';
import SignatureModal from '@/Components/SignatureModal';
import CalendarWidget from '@/Components/CalendarWidget';

export default function AssignmentAdminDashboard({ data }) {
    const { auth } = usePage().props;
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* Signature Section
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Pen className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">Digital Signature</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Your signature will be used on assignment confirmations
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                        {auth.user?.signature_path ? (
                            <div className="flex items-center gap-3">
                                <div className="border rounded-lg p-2 bg-gray-50">
                                    <img 
                                        src={`/storage/${auth.user.signature_path}`} 
                                        alt="Current Signature" 
                                        className="h-12 max-w-[200px] object-contain"
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-green-600">
                                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                    <span>Signature Set</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-md">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>No signature set - Required for assignments</span>
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
            </div> */}

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardCard
                    title="Pending Assignments"
                    value={data.pendingAssignments}
                    icon={<FileText className="w-6 h-6 text-white" />}
                    color="bg-yellow-500"
                    link={route('assignment.requests.index')}
                />
                <DashboardCard
                    title="Assigned Requests"
                    value={data.assignedRequests}
                    icon={<CheckCircle className="w-6 h-6 text-white" />}
                    color="bg-green-500"
                    link={route('assignment.requests.index')}
                />
                <DashboardCard
                    title="Total Vehicles"
                    value={data.totalVehicles}
                    icon={<CarFront className="w-6 h-6 text-white" />}
                    color="bg-blue-500"
                    link={route('assignment.vehicles')}
                />
                <DashboardCard
                    title="Total Drivers"
                    value={data.totalDrivers}
                    icon={<Users className="w-6 h-6 text-white" />}
                    color="bg-indigo-500"
                    link={route('assignment.drivers')}
                />
            </div>

            <CalendarWidget userRole="assignmentAdmin" />

            {/* Signature Modal */}
            <SignatureModal 
                isOpen={isSignatureModalOpen}
                closeModal={() => setIsSignatureModalOpen(false)}
                currentSignature={auth.user?.signature_path}
            />
        </div>
    );
}