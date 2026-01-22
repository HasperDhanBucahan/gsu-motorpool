import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import ClientDashboard from './Dashboard/ClientDashboard';
import ApprovalAdminDashboard from './Dashboard/ApprovalAdminDashboard';
import AssignmentAdminDashboard from './Dashboard/AssignmentAdminDashboard';
import TicketAdminDashboard from './Dashboard/TicketAdminDashboard';

export default function Dashboard() {
    const { auth, data } = usePage().props;
    const user = auth.user;

    const DashboardComponent = {
        client: ClientDashboard,
        approval_admin: ApprovalAdminDashboard,
        assignment_admin: AssignmentAdminDashboard,
        ticket_admin: TicketAdminDashboard,
    }[user.role];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-10 bg-gray-50 min-h-[calc(100vh-80px)]">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <DashboardComponent data={data} />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}