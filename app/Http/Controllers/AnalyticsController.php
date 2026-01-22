<?php

namespace App\Http\Controllers;

use App\Models\Request as VehicleRequest;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\User;
use App\Models\FuelConsumption;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Auto-complete past approved requests for ALL users
        VehicleRequest::where('status', VehicleRequest::STATUS_APPROVED)
            ->where('end_datetime', '<', now())
            ->update(['status' => VehicleRequest::STATUS_COMPLETED]);

        // Get date range from request or use defaults
        $dateRange = $request->input('range', 'last_3_months');
        $customStart = $request->input('start_date');
        $customEnd = $request->input('end_date');

        [$startDate, $endDate] = $this->getDateRange($dateRange, $customStart, $customEnd);

        if ($user->role === 'client') {
            return $this->clientAnalytics($user, $startDate, $endDate, $dateRange);
        } else {
            return $this->adminAnalytics($startDate, $endDate, $dateRange);
        }
    }

    private function getDateRange($range, $customStart = null, $customEnd = null)
    {
        $endDate = Carbon::now();
        
        switch ($range) {
            case 'last_7_days':
                $startDate = Carbon::now()->subDays(7);
                break;
            case 'last_30_days':
                $startDate = Carbon::now()->subDays(30);
                break;
            case 'last_3_months':
                $startDate = Carbon::now()->subMonths(3);
                break;
            case 'last_6_months':
                $startDate = Carbon::now()->subMonths(6);
                break;
            case 'this_year':
                $startDate = Carbon::now()->startOfYear();
                break;
            case 'all_time':
                $startDate = VehicleRequest::min('created_at') 
                    ? Carbon::parse(VehicleRequest::min('created_at')) 
                    : Carbon::now()->subYear();
                break;
            case 'custom':
                $startDate = $customStart ? Carbon::parse($customStart) : Carbon::now()->subMonths(3);
                $endDate = $customEnd ? Carbon::parse($customEnd) : Carbon::now();
                break;
            default:
                $startDate = Carbon::now()->subMonths(3);
        }

        return [$startDate, $endDate];
    }

    private function clientAnalytics($user, $startDate, $endDate, $dateRange)
    {
        // Total requests by status
        $statusCounts = VehicleRequest::where('user_id', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Monthly request trends (last 6 months)
        $monthlyTrends = VehicleRequest::where('user_id', $user->id)
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy(DB::raw('YEAR(created_at)'), DB::raw('MONTH(created_at)'))
            ->orderBy(DB::raw('YEAR(created_at)'))
            ->orderBy(DB::raw('MONTH(created_at)'))
            ->get()
            ->map(function($item) {
                return [
                    'month' => Carbon::create($item->year, $item->month)->format('M Y'),
                    'count' => $item->count
                ];
            });

        // Most frequent destinations
        $topDestinations = VehicleRequest::where('user_id', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->select('destination', DB::raw('count(*) as count'))
            ->groupBy('destination')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // Average trip duration
        $avgTripDuration = VehicleRequest::where('user_id', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('days_of_travel')
            ->avg('days_of_travel');

        // Most used vehicles
        $topVehicles = VehicleRequest::where('user_id', $user->id)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('vehicle_id')
            ->with('vehicle')
            ->select('vehicle_id', DB::raw('count(*) as count'))
            ->groupBy('vehicle_id')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // Recent requests
        $recentRequests = VehicleRequest::where('user_id', $user->id)
            ->with(['vehicle', 'driver'])
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        return Inertia::render('Analytics', [
            'isClient' => true,
            'dateRange' => $dateRange,
            'stats' => [
                'total_requests' => ($statusCounts[VehicleRequest::STATUS_PENDING] ?? 0) 
                    + ($statusCounts[VehicleRequest::STATUS_ASSIGNED] ?? 0)
                    + ($statusCounts[VehicleRequest::STATUS_APPROVED] ?? 0)
                    + ($statusCounts[VehicleRequest::STATUS_DECLINED] ?? 0)
                    + ($statusCounts[VehicleRequest::STATUS_COMPLETED] ?? 0),
                'pending' => $statusCounts[VehicleRequest::STATUS_PENDING] ?? 0,
                'approved' => ($statusCounts[VehicleRequest::STATUS_APPROVED] ?? 0) + ($statusCounts[VehicleRequest::STATUS_ASSIGNED] ?? 0),
                'completed' => $statusCounts[VehicleRequest::STATUS_COMPLETED] ?? 0,
                'declined' => $statusCounts[VehicleRequest::STATUS_DECLINED] ?? 0,
                'avg_trip_duration' => round($avgTripDuration ?? 0, 1),
            ],
            'monthlyTrends' => $monthlyTrends,
            'topDestinations' => $topDestinations,
            'topVehicles' => $topVehicles,
            'recentRequests' => $recentRequests,
        ]);
    }

    private function adminAnalytics($startDate, $endDate, $dateRange)
    {
        // Current month stats
        $currentMonthStart = Carbon::now()->startOfMonth();
        $currentMonthEnd = Carbon::now()->endOfMonth();

        // Total requests stats
        $totalRequests = VehicleRequest::whereBetween('created_at', [$startDate, $endDate])->count();
        $currentMonthRequests = VehicleRequest::whereBetween('created_at', [$currentMonthStart, $currentMonthEnd])->count();
        
        // Pending requests (needs action)
        $pendingRequests = VehicleRequest::where('status', VehicleRequest::STATUS_PENDING)->count();

        // Active trips (assigned or approved, not yet ended)
        $activeTrips = VehicleRequest::whereIn('status', [VehicleRequest::STATUS_ASSIGNED, VehicleRequest::STATUS_APPROVED])
            ->where('end_datetime', '>=', now())
            ->count();

        // Available vehicles
        $availableVehicles = Vehicle::where('status', Vehicle::STATUS_AVAILABLE)->count();

        // Request status distribution
        $statusDistribution = VehicleRequest::whereBetween('created_at', [$startDate, $endDate])
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function($item) {
                return [
                    'status' => ucfirst(str_replace('_', ' ', $item->status)),
                    'count' => $item->count
                ];
            });

        // Monthly request trends (last 6 months)
        $monthlyTrends = VehicleRequest::where('created_at', '>=', Carbon::now()->subMonths(6))
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy(DB::raw('YEAR(created_at)'), DB::raw('MONTH(created_at)'))
            ->orderBy(DB::raw('YEAR(created_at)'))
            ->orderBy(DB::raw('MONTH(created_at)'))
            ->get()
            ->map(function($item) {
                return [
                    'month' => Carbon::create($item->year, $item->month)->format('M Y'),
                    'count' => $item->count
                ];
            });

        // Requests by department
        $requestsByDepartment = VehicleRequest::whereBetween('requests.created_at', [$startDate, $endDate])
            ->join('users', 'requests.user_id', '=', 'users.id')
            ->select('users.department', DB::raw('count(*) as count'))
            ->groupBy('users.department')
            ->orderByDesc('count')
            ->get();

        // Vehicle utilization
        $vehicleUtilization = VehicleRequest::whereBetween('requests.created_at', [$startDate, $endDate])
            ->whereNotNull('vehicle_id')
            ->whereIn('status', [VehicleRequest::STATUS_ASSIGNED, VehicleRequest::STATUS_APPROVED, VehicleRequest::STATUS_COMPLETED])
            ->with('vehicle')
            ->select('vehicle_id', DB::raw('count(*) as trips'))
            ->groupBy('vehicle_id')
            ->orderByDesc('trips')
            ->get()
            ->map(function($item) {
                return [
                    'vehicle' => $item->vehicle->description ?? 'Unknown',
                    'plate_number' => $item->vehicle->plate_number ?? 'N/A',
                    'trips' => $item->trips
                ];
            });

        // Driver workload
        $driverWorkload = VehicleRequest::whereBetween('requests.created_at', [$startDate, $endDate])
            ->whereNotNull('driver_id')
            ->whereIn('status', [VehicleRequest::STATUS_ASSIGNED, VehicleRequest::STATUS_APPROVED, VehicleRequest::STATUS_COMPLETED])
            ->with('driver')
            ->select('driver_id', DB::raw('count(*) as trips'))
            ->groupBy('driver_id')
            ->orderByDesc('trips')
            ->get()
            ->map(function($item) {
                return [
                    'driver' => $item->driver->name ?? 'Unknown',
                    'trips' => $item->trips
                ];
            });

        // Fuel consumption trends (last 6 months)
        $fuelTrends = FuelConsumption::where('created_at', '>=', Carbon::now()->subMonths(6))
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(liters) as total_liters')
            )
            ->groupBy(DB::raw('YEAR(created_at)'), DB::raw('MONTH(created_at)'))
            ->orderBy(DB::raw('YEAR(created_at)'))
            ->orderBy(DB::raw('MONTH(created_at)'))
            ->get()
            ->map(function($item) {
                return [
                    'month' => Carbon::create($item->year, $item->month)->format('M Y'),
                    'liters' => round($item->total_liters, 2)
                ];
            });

        // Vehicle status distribution
        $vehicleStatusDistribution = Vehicle::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(function($item) {
                return [
                    'status' => ucfirst(str_replace('_', ' ', $item->status)),
                    'count' => $item->count
                ];
            });

        // Processing time metrics
        $avgApprovalTime = VehicleRequest::whereBetween('requests.created_at', [$startDate, $endDate])
            ->whereNotNull('approved_at')
            ->get()
            ->map(function($request) {
                return Carbon::parse($request->created_at)->diffInHours(Carbon::parse($request->approved_at));
            })
            ->avg();

        $avgAssignmentTime = VehicleRequest::whereBetween('requests.created_at', [$startDate, $endDate])
            ->whereIn('status', [VehicleRequest::STATUS_ASSIGNED, VehicleRequest::STATUS_APPROVED, VehicleRequest::STATUS_COMPLETED])
            ->whereNotNull('approved_at')
            ->with('assignment')
            ->get()
            ->filter(function($request) {
                return $request->assignment && $request->approved_at;
            })
            ->map(function($request) {
                return Carbon::parse($request->approved_at)->diffInHours(Carbon::parse($request->assignment->created_at));
            })
            ->avg();

        $avgTicketTime = VehicleRequest::whereBetween('requests.created_at', [$startDate, $endDate])
            ->whereNotNull('ticket_generated_at')
            ->with('assignment')
            ->get()
            ->filter(function($request) {
                return $request->assignment && $request->ticket_generated_at;
            })
            ->map(function($request) {
                return Carbon::parse($request->assignment->created_at)->diffInHours(Carbon::parse($request->ticket_generated_at));
            })
            ->avg();

        // Recent approved requests
        $recentApproved = VehicleRequest::whereIn('status', [VehicleRequest::STATUS_APPROVED, VehicleRequest::STATUS_ASSIGNED, VehicleRequest::STATUS_COMPLETED])
            ->with(['user', 'vehicle', 'driver'])
            ->orderByDesc('approved_at')
            ->limit(10)
            ->get();

        // Top 5 most used vehicles
        $topVehicles = $vehicleUtilization->take(5);

        return Inertia::render('Analytics', [
            'isClient' => false,
            'dateRange' => $dateRange,
            'stats' => [
                'current_month_requests' => $currentMonthRequests,
                'pending_requests' => $pendingRequests,
                'active_trips' => $activeTrips,
                'available_vehicles' => $availableVehicles,
                'total_requests' => $totalRequests,
                'avg_approval_time' => round($avgApprovalTime ?? 0, 1),
                'avg_assignment_time' => round($avgAssignmentTime ?? 0, 1),
                'avg_ticket_time' => round($avgTicketTime ?? 0, 1),
            ],
            'statusDistribution' => $statusDistribution,
            'monthlyTrends' => $monthlyTrends,
            'requestsByDepartment' => $requestsByDepartment,
            'vehicleUtilization' => $vehicleUtilization,
            'driverWorkload' => $driverWorkload,
            'fuelTrends' => $fuelTrends,
            'vehicleStatusDistribution' => $vehicleStatusDistribution,
            'recentApproved' => $recentApproved,
            'topVehicles' => $topVehicles,
        ]);
    }
}