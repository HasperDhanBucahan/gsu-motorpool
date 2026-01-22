<?php

namespace App\Services;

use App\Models\User;
use App\Models\Notification;
use App\Models\Request as VehicleRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * 1. CLIENT SUBMITS REQUEST
     * Notify: Assignment Admin
     */
    public function notifyAssignmentAdmin(VehicleRequest $request)
    {
        try {
            $assignmentAdmins = User::where('role', 'assignment_admin')->get();
            
            foreach ($assignmentAdmins as $admin) {
                // Create in-app notification
                Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'request_submitted',
                    'title' => 'New Vehicle Request Submitted',
                    'message' => "{$request->user->name} submitted a new vehicle request for {$request->destination}.",
                    'data' => [
                        'request_id' => $request->id,
                        'requester_name' => $request->user->name,
                        'destination' => $request->destination,
                        'date_of_travel' => $request->date_of_travel->format('Y-m-d'),
                    ],
                    'action_url' => route('assignment.requests.index'),
                    'read' => false,
                ]);

                // Send email (optional)
                // Mail::to($admin->email)->send(new RequestSubmittedMail($request));
            }

            Log::info('Assignment admins notified of new request', [
                'request_id' => $request->id,
                'notified_count' => $assignmentAdmins->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to notify assignment admin', [
                'request_id' => $request->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * 2. ASSIGNMENT ADMIN ASSIGNS VEHICLE/DRIVER
     * Notify: Approval Admin, Client
     */
    public function notifyApprovalAdmin(VehicleRequest $request)
    {
        try {
            $approvalAdmins = User::where('role', 'approval_admin')->get();
            
            foreach ($approvalAdmins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'request_assigned',
                    'title' => 'Request Ready for Approval',
                    'message' => "Request #{$request->id} has been assigned a vehicle and driver. Awaiting your approval.",
                    'data' => [
                        'request_id' => $request->id,
                        'requester_name' => $request->user->name,
                        'vehicle' => $request->vehicle->description ?? 'N/A',
                        'driver' => $request->driver->name ?? 'N/A',
                        'destination' => $request->destination,
                    ],
                    'action_url' => route('admin.requests.management'),
                    'read' => false,
                ]);

                // Send email (optional)
                // Mail::to($admin->email)->send(new RequestAssignedForApprovalMail($request));
            }

            // Also notify the client that their request has been assigned
            $this->notifyClientAssignment($request);

            Log::info('Approval admins notified of assigned request', [
                'request_id' => $request->id,
                'notified_count' => $approvalAdmins->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to notify approval admin', [
                'request_id' => $request->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Notify client that their request has been assigned
     */
    private function notifyClientAssignment(VehicleRequest $request)
    {
        try {
            Notification::create([
                'user_id' => $request->user_id,
                'type' => 'request_assigned',
                'title' => 'Vehicle and Driver Assigned',
                'message' => "Your request for {$request->destination} has been assigned:\nVehicle: {$request->vehicle->description} ({$request->vehicle->plate_number})\nDriver: {$request->driver->name}",
                'data' => [
                    'request_id' => $request->id,
                    'vehicle_description' => $request->vehicle->description,
                    'vehicle_plate' => $request->vehicle->plate_number,
                    'driver_name' => $request->driver->name,
                ],
                'action_url' => route('requests.index'),
                'read' => false,
            ]);

            // Send email (optional)
            // Mail::to($request->user->email)->send(new VehicleAssignedMail($request));

        } catch (\Exception $e) {
            Log::error('Failed to notify client of assignment', [
                'request_id' => $request->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * 3. APPROVAL ADMIN APPROVES/DECLINES
     * Notify: Client, Ticket Admin (if approved)
     */
    public function notifyClient(VehicleRequest $request, string $action)
    {
        try {
            if ($action === 'approved') {
                Notification::create([
                    'user_id' => $request->user_id,
                    'type' => 'request_approved',
                    'title' => '✅ Request Approved!',
                    'message' => "Great news! Your vehicle request for {$request->destination} has been approved. A trip ticket will be generated soon.",
                    'data' => [
                        'request_id' => $request->id,
                        'destination' => $request->destination,
                        'vehicle' => $request->vehicle->description ?? 'N/A',
                        'driver' => $request->driver->name ?? 'N/A',
                        'approved_by' => $request->approver->name ?? 'Admin',
                        'approved_at' => $request->approved_at->format('Y-m-d H:i:s'),
                    ],
                    'action_url' => route('requests.index'),
                    'read' => false,
                ]);

                // Send approval email (optional)
                // Mail::to($request->user->email)->send(new RequestApprovedMail($request));

            } elseif ($action === 'declined') {
                Notification::create([
                    'user_id' => $request->user_id,
                    'type' => 'request_declined',
                    'title' => '❌ Request Declined',
                    'message' => "Your vehicle request for {$request->destination} has been declined.\n\nReason: {$request->decline_reason}",
                    'data' => [
                        'request_id' => $request->id,
                        'destination' => $request->destination,
                        'decline_reason' => $request->decline_reason,
                        'declined_by' => $request->decliner->name ?? 'Admin',
                        'declined_at' => $request->declined_at->format('Y-m-d H:i:s'),
                    ],
                    'action_url' => route('requests.index'),
                    'read' => false,
                ]);

                // Send decline email (optional)
                // Mail::to($request->user->email)->send(new RequestDeclinedMail($request));
            }

            Log::info("Client notified of request {$action}", [
                'request_id' => $request->id,
                'user_id' => $request->user_id
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to notify client', [
                'request_id' => $request->id,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Notify approval admin when a request is forwarded for decline
     */
    public function notifyApprovalAdminForDecline(VehicleRequest $request)
    {
        try {
            // Get approval/admin users
            $approvalAdmins = User::whereIn('role', ['approval_admin', 'admin'])->get();

            foreach ($approvalAdmins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'request_forwarded_for_decline',
                    'title' => 'Request Forwarded for Decline',
                    'message' => "Request #{$request->id} forwarded for decline. Reason: " . ($request->forwarded_decline_reason ?? 'No reason provided'),
                    'data' => [
                        'request_id' => $request->id,
                        'requester_name' => $request->user->name,
                        'destination' => $request->destination,
                        'forwarded_reason' => $request->forwarded_decline_reason,
                    ],
                    'action_url' => route('requests.pending'), // link to pending requests
                    'read' => false,
                ]);
            }

            \Log::info('Approval/admin users notified for forwarded decline request', [
                'request_id' => $request->id,
                'notified_count' => $approvalAdmins->count(),
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Failed to notify approval/admin users for forwarded decline', [
                'request_id' => $request->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * 4. NOTIFY TICKET ADMIN (After Approval)
     */
    public function notifyTicketAdmin(VehicleRequest $request)
    {
        try {
            $ticketAdmins = User::where('role', 'ticket_admin')->get();
            
            foreach ($ticketAdmins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'type' => 'ticket_preparation',
                    'title' => 'Trip Ticket Preparation Needed',
                    'message' => "Request #{$request->id} has been approved. Please prepare the trip ticket for {$request->user->name}'s trip to {$request->destination}.",
                    'data' => [
                        'request_id' => $request->id,
                        'requester_name' => $request->user->name,
                        'destination' => $request->destination,
                        'date_of_travel' => $request->date_of_travel->format('Y-m-d'),
                        'vehicle' => $request->vehicle->description ?? 'N/A',
                        'driver' => $request->driver->name ?? 'N/A',
                    ],
                    'action_url' => route('tickets.trip-tickets'),
                    'read' => false,
                ]);

                // Send email (optional)
                // Mail::to($admin->email)->send(new PrepareTicketMail($request));
            }

            Log::info('Ticket admins notified for trip ticket preparation', [
                'request_id' => $request->id,
                'notified_count' => $ticketAdmins->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to notify ticket admin', [
                'request_id' => $request->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * 5. TICKET ADMIN GENERATES TRIP TICKET
     * Notify: Client, Driver
     */
    public function notifyTicketGenerated(VehicleRequest $request)
    {
        try {
            // Notify Client
            Notification::create([
                'user_id' => $request->user_id,
                'type' => 'ticket_generated',
                'title' => '🎫 Trip Ticket Generated',
                'message' => "Your trip ticket #{$request->trip_ticket_number} has been generated and is ready for your trip to {$request->destination}.",
                'data' => [
                    'request_id' => $request->id,
                    'trip_ticket_number' => $request->trip_ticket_number,
                    'destination' => $request->destination,
                    'date_of_travel' => $request->date_of_travel->format('Y-m-d'),
                ],
                'action_url' => route('requests.approved'),
                'read' => false,
            ]);

            // Notify Driver
            if ($request->driver && $request->driver->user_id) {
                Notification::create([
                    'user_id' => $request->driver->user_id,
                    'type' => 'trip_assigned',
                    'title' => '🚗 New Trip Assignment',
                    'message' => "You have been assigned to drive {$request->user->name} to {$request->destination} on {$request->date_of_travel->format('M d, Y')}.\nTrip Ticket: #{$request->trip_ticket_number}",
                    'data' => [
                        'request_id' => $request->id,
                        'trip_ticket_number' => $request->trip_ticket_number,
                        'passenger' => $request->user->name,
                        'destination' => $request->destination,
                        'date_of_travel' => $request->date_of_travel->format('Y-m-d'),
                        'time_of_travel' => $request->time_of_travel,
                        'vehicle' => $request->vehicle->description ?? 'N/A',
                    ],
                    'action_url' => '#', // Driver dashboard route
                    'read' => false,
                ]);

                // Send email to driver (optional)
                // Mail::to($request->driver->email)->send(new TripAssignedMail($request));
            }

            Log::info('Ticket generation notifications sent', [
                'request_id' => $request->id,
                'trip_ticket_number' => $request->trip_ticket_number
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to notify ticket generation', [
                'request_id' => $request->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * UTILITY: Get unread notification count for a user
     */
    public function getUnreadCount($userId): int
    {
        return Notification::where('user_id', $userId)
            ->where('read', false)
            ->count();
    }

    /**
     * UTILITY: Mark all notifications as read for a user
     */
    public function markAllAsRead($userId)
    {
        Notification::where('user_id', $userId)
            ->where('read', false)
            ->update([
                'read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * UTILITY: Delete old read notifications (cleanup)
     */
    public function cleanupOldNotifications($daysOld = 30)
    {
        $deletedCount = Notification::where('read', true)
            ->where('read_at', '<', now()->subDays($daysOld))
            ->delete();

        Log::info("Cleaned up old notifications", [
            'deleted_count' => $deletedCount
        ]);

        return $deletedCount;
    }
}

