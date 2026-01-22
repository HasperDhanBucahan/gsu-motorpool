<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Request as VehicleRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $data = [];

        if ($user->role === 'client') {
            // Auto-mark completed requests
            VehicleRequest::where('user_id', $user->id)
                ->where('status', VehicleRequest::STATUS_APPROVED)
                ->where('end_datetime', '<', now())
                ->update(['status' => VehicleRequest::STATUS_COMPLETED]);

            $data['pendingRequests'] = $user->vehicleRequests()->where('status', VehicleRequest::STATUS_PENDING)->count();
            $data['assignedRequests'] = $user->vehicleRequests()->where('status', VehicleRequest::STATUS_ASSIGNED)->count();
            $data['approvedRequests'] = $user->vehicleRequests()->where('status', VehicleRequest::STATUS_APPROVED)->count();
            $data['completedRequests'] = $user->vehicleRequests()->where('status', VehicleRequest::STATUS_COMPLETED)->count();
            $data['totalRequests'] = $user->vehicleRequests()->count();
            $data['vehicles'] = Vehicle::select('id', 'model', 'fuel_type', 'status', 'image')->get();
        }

        if (in_array($user->role, ['assignment_admin', 'approval_admin', 'ticket_admin'])) {
            $data['totalUsers'] = User::count();
            $data['totalVehicles'] = Vehicle::count();
            $data['pendingRequests'] = VehicleRequest::where('status', VehicleRequest::STATUS_PENDING)->count();
        }

        return Inertia::render('Dashboard', [
            'auth' => [
                'user' => $user,
            ],
            'data' => $data,
        ]);
    }
}