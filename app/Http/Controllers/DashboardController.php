<?php

namespace App\Http\Controllers;

use App\Models\Request as VehicleRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * CLIENT DASHBOARD
     * (Admin dashboards are handled by their respective controllers)
     */
    public function index()
    {
        $user = Auth::user();

        // Auto-complete requests
        $this->autoCompleteRequests();

        // Route based on role
        switch ($user->role) {
            case 'client':
                return $this->clientDashboard();
            case 'assignment_admin':
                return redirect()->route('assignment.dashboard');
            case 'approval_admin':
                return redirect()->route('admin.dashboard');
            case 'ticket_admin':
                return redirect()->route('ticket.dashboard');
            default:
                abort(403, 'Unauthorized access');
        }
    }

    /**
     * CLIENT DASHBOARD
     */
    private function clientDashboard()
    {
        $user = Auth::user();

        // Stats
        $pendingRequests = VehicleRequest::where('user_id', $user->id)
            ->where('status', VehicleRequest::STATUS_PENDING)
            ->count();

        $assignedRequests = VehicleRequest::where('user_id', $user->id)
            ->where('status', VehicleRequest::STATUS_ASSIGNED)
            ->count();

        $approvedRequests = VehicleRequest::where('user_id', $user->id)
            ->where('status', VehicleRequest::STATUS_APPROVED)
            ->count();

        $completedRequests = VehicleRequest::where('user_id', $user->id)
            ->where('status', VehicleRequest::STATUS_COMPLETED)
            ->count();

        // Active today
        $activeToday = VehicleRequest::where('user_id', $user->id)
            ->where('status', VehicleRequest::STATUS_APPROVED)
            ->whereDate('start_datetime', '<=', today())
            ->whereDate('end_datetime', '>=', today())
            ->count();

        // Recent requests timeline (last 5 requests)
        $recentRequests = VehicleRequest::where('user_id', $user->id)
            ->with(['vehicle', 'driver'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'destination' => $request->destination,
                    'status' => $request->status,
                    'date_of_travel' => $request->date_of_travel->format('M d, Y'),
                    'created_at' => $request->created_at->format('M d, Y H:i'),
                    'vehicle' => $request->vehicle ? $request->vehicle->description . ' - ' . $request->vehicle->plate_number : null,
                    'driver' => $request->driver ? $request->driver->name : null,
                ];
            });

        // Upcoming trips (next 5 approved trips)
        $upcomingTrips = VehicleRequest::where('user_id', $user->id)
            ->where('status', VehicleRequest::STATUS_APPROVED)
            ->where('start_datetime', '>=', now())
            ->with(['vehicle', 'driver'])
            ->orderBy('start_datetime', 'asc')
            ->limit(5)
            ->get()
            ->map(function ($request) {
                return [
                    'id' => $request->id,
                    'destination' => $request->destination,
                    'date' => $request->date_of_travel->format('M d, Y'),
                    'time' => $request->time_of_travel,
                    'start_datetime' => $request->start_datetime->format('M d, Y H:i'),
                    'vehicle' => $request->vehicle ? $request->vehicle->description . ' (' . $request->vehicle->plate_number . ')' : 'N/A',
                    'driver' => $request->driver ? $request->driver->name : 'N/A',
                    'days_until' => now()->diffInDays($request->start_datetime, false),
                ];
            });

        return Inertia::render('Dashboard/ClientDashboard', [
            'data' => [
                'pendingRequests' => $pendingRequests,
                'assignedRequests' => $assignedRequests,
                'approvedRequests' => $approvedRequests,
                'completedRequests' => $completedRequests,
                'activeToday' => $activeToday,
                'recentRequests' => $recentRequests,
                'upcomingTrips' => $upcomingTrips,
            ],
        ]);
    }

    /**
     * Auto-complete requests
     */
    private function autoCompleteRequests()
    {
        VehicleRequest::where('status', VehicleRequest::STATUS_APPROVED)
            ->where('end_datetime', '<', now())
            ->update(['status' => VehicleRequest::STATUS_COMPLETED]);
    }
}