<?php

use Inertia\Inertia;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SignatureController;
use App\Http\Controllers\Admin\DriverController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Admin\VehicleController;
use App\Http\Controllers\Admin\ApprovalController;
use App\Http\Controllers\FuelConsumptionController;
use App\Http\Controllers\Admin\AssignmentController;
use App\Http\Controllers\Admin\UserManagementController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
})->name('welcome');

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');
});

require __DIR__.'/auth.php';

//client
Route::middleware(['auth', 'role:client'])->group(function () {
    Route::get('/requests/create', [RequestController::class, 'create'])->name('requests.create');
    Route::post('/request', [RequestController::class, 'store'])->name('requests.store');
    Route::get('/requests', [RequestController::class, 'myRequests'])->name('requests.index');
    
    Route::get('/request/preview', [RequestController::class, 'previewRequest'])->name('request.preview');
    Route::get('/requests/{id}/edit', [RequestController::class, 'edit'])->name('client.requests.edit');
    Route::patch('/requests/{id}', [RequestController::class, 'update'])->name('client.requests.update');
    Route::delete('/requests/{id}', [RequestController::class, 'destroy'])->name('client.requests.destroy');
    
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');
});

//approval admin
Route::middleware(['auth', 'role:approval_admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [ApprovalController::class, 'dashboard'])->name('admin.dashboard');

    Route::get('/requests', [ApprovalController::class, 'requestManagement'])->name('admin.requests.management');
    Route::get('/requests/{id}/preview-approval', [ApprovalController::class, 'previewApproval'])->name('admin.requests.preview-approval');
    Route::post('/requests/{id}/approve', [ApprovalController::class, 'approve'])->name('admin.requests.approve');
    Route::post('/requests/{id}/decline', [ApprovalController::class, 'decline'])->name('admin.requests.decline');
});

//assignment admin
Route::middleware(['auth', 'role:assignment_admin'])->prefix('assignment')->group(function () {
    Route::get('/dashboard', [AssignmentController::class, 'dashboard'])->name('assignment.dashboard');
    Route::get('/requests', [AssignmentController::class, 'requestManagement'])->name('assignment.requests.index');
    Route::get('/requests/{id}/assign', [AssignmentController::class, 'showAssignForm'])->name('assignment.requests.assign.view');
    Route::get('/requests/{id}/preview', [AssignmentController::class, 'previewAssignment'])->name('assignment.requests.preview');
    Route::post('/requests/{id}/assign', [AssignmentController::class, 'assign'])->name('assignment.requests.assign');
    Route::post('/requests/{id}/forward-decline', [AssignmentController::class, 'forwardDecline'])->name('assignment.requests.forward-decline');

    Route::get('/check-availability', [AssignmentController::class, 'checkAvailability'])->name('assignment.check-availability');
    Route::put('/requests/{id}/reassign', [AssignmentController::class, 'reassign'])->name('assignment.requests.reassign');
    Route::delete('/requests/{id}/unassign', [AssignmentController::class, 'unassign'])->name('assignment.requests.unassign');
    Route::get('/drivers-tickets', [AssignmentController::class, 'driversTickets'])->name('assignment.drivers-tickets');

    Route::get('/drivers', [DriverController::class, 'index'])->name('assignment.drivers');
    Route::post('/drivers', [DriverController::class, 'store']);
    Route::put('/drivers/{id}', [DriverController::class, 'update']);
    Route::delete('/drivers/{id}', [DriverController::class, 'destroy']);
    
    Route::get('/vehicles', [VehicleController::class, 'index'])->name('assignment.vehicles');
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::put('/vehicles/{id}', [VehicleController::class, 'update']);
    Route::delete('/vehicles/{id}', [VehicleController::class, 'destroy']);
});

//Ticket Admin
Route::middleware(['auth', 'role:ticket_admin'])->prefix('ticket')->group(function () {
    Route::get('/dashboard', [TicketController::class, 'dashboard'])->name('ticket.dashboard');
    Route::get('/pending-requests', [TicketController::class, 'pendingRequests'])->name('tickets.pending-requests');
    Route::post('/tickets/{vehicleRequest}/trip-number', [TicketController::class, 'updateTripTicket'])->name('tickets.update-trip-ticket');
    Route::post('/tickets/{vehicleRequest}/send-to-assignment-admin', [TicketController::class, 'sendToAssignmentAdmin'])->name('tickets.send-to-assignment-admin');
    Route::get('/tickets', [TicketController::class, 'index'])->name('tickets.index');
    Route::post('/tickets/{request}/generate', [TicketController::class, 'generate'])->name('tickets.generate');
    Route::get('/check-availability', [TicketController::class, 'checkAvailabilityForNewTicket'])->name('tickets.check-availability');
    Route::post('/create-trip-ticket/preview', [TicketController::class, 'previewCreateTripTicket'])->name('tickets.create-trip-ticket.preview');
    Route::post('/create-trip-ticket/cancel', [TicketController::class, 'cancelPreviewTripTicket'])->name('tickets.create-trip-ticket.cancel');
    Route::post('/create-trip-ticket/confirm', [TicketController::class, 'confirmCreateTripTicket'])->name('tickets.create-trip-ticket.confirm');
    
    // Export routes
    Route::get('/export/data', [TicketController::class, 'getExportData'])->name('tickets.export.data');
    Route::post('/export/excel', [TicketController::class, 'exportExcel'])->name('ticket.export.excel');
    Route::post('/tickets/fuel-consumption/export', [FuelConsumptionController::class, 'export'])
    ->name('tickets.fuel-consumption.export');

    Route::get('/fuel-consumption', [FuelConsumptionController::class, 'index'])->name('tickets.fuel-consumption');
    Route::post('/fuel-consumption', [FuelConsumptionController::class, 'store'])->name('tickets.fuel-consumption.store');
    Route::delete('/fuel-consumption/{fuelConsumption}', [FuelConsumptionController::class, 'destroy'])->name('tickets.fuel-consumption.destroy');
});

// Trip Ticket PDF routes - accessible by both ticket_admin and assignment_admin
Route::middleware(['auth', 'role:ticket_admin,assignment_admin'])->prefix('ticket')->group(function () {
    Route::get('/tickets/{vehicleRequest}/preview', [TicketController::class, 'preview'])->name('tickets.preview');
    Route::get('/tickets/{vehicleRequest}/download', [TicketController::class, 'download'])->name('tickets.download');
});

Route::middleware(['auth', 'role:ticket_admin,approval_admin'])->prefix('ticket')->group(function () {
    Route::get('/users', [App\Http\Controllers\Admin\UserManagementController::class, 'index'])->name('admin.users.index');
    Route::post('/users', [App\Http\Controllers\Admin\UserManagementController::class, 'store'])->name('admin.users.store');
    Route::put('/users/{id}', [App\Http\Controllers\Admin\UserManagementController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{id}', [App\Http\Controllers\Admin\UserManagementController::class, 'destroy'])->name('admin.users.destroy');
});

// Request Form PDF viewing - accessible by client (own requests), assignment_admin, approval_admin, ticket_admin
Route::middleware(['auth', 'role:client,assignment_admin,approval_admin,ticket_admin'])->group(function () {
    Route::get('/requests/{id}/pdf/preview', [RequestController::class, 'previewPdf'])->name('client.requests.pdf.preview');
    Route::get('/requests/{id}/pdf/download', [RequestController::class, 'downloadPdf'])->name('client.requests.pdf');
});

Route::middleware('auth')->group(function () {
    Route::post('/signature/upload', [SignatureController::class, 'upload'])->name('admin.signature.upload');
    Route::delete('/signature/delete', [SignatureController::class, 'delete'])->name('signature.delete');
});

Route::middleware(['auth'])->group(function () {
    // Notifications Page
    Route::get('/notifications', function () {
        return Inertia::render('Notifications');
    })->name('notifications.index');
    
    Route::get('/api/notifications', [NotificationController::class, 'index']);
    Route::get('/api/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/api/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/api/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/api/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::post('/api/notifications/clear-read', [NotificationController::class, 'clearRead']);
});

Route::middleware(['auth'])->group(function () {
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar.index');
    Route::get('/calendar/events', [CalendarController::class, 'getEvents'])->name('calendar.events');
    Route::get('/calendar/requests/{id}', [CalendarController::class, 'show'])->name('calendar.requests.show');
});

// Test 1: Check if email template renders without errors
Route::get('/debug-email-template', function () {
    try {
        $testUser = new \App\Models\User([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'department' => 'IT Department',
            'position' => 'Developer',
            'role' => \App\Models\User::ROLE_CLIENT,
        ]);
        
        $testPassword = 'TestPassword123';
        
        // Try to render the email template
        $mailable = new \App\Mail\UserAccountCreatedMail($testUser, $testPassword);
        $rendered = $mailable->render();
        
        return response($rendered)->header('Content-Type', 'text/html');
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'TEMPLATE_ERROR',
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
        ], 500);
    }
});

// Test 2: Send email using the exact same code as UserManagementController
Route::get('/debug-send-user-email', function () {
    try {
        $temporaryPassword = \Illuminate\Support\Str::random(12);
        
        $testUser = new \App\Models\User([
            'id' => 999999,
            'name' => 'Debug Test User',
            'email' => 'hasperthegreat04@gmail.com',
            'department' => 'Test Department',
            'position' => 'Test Position',
            'role' => \App\Models\User::ROLE_CLIENT,
        ]);

        \Log::info('=== DEBUG: Starting email send test ===', [
            'email' => $testUser->email,
            'mailer' => config('mail.default'),
        ]);

        \Illuminate\Support\Facades\Mail::to($testUser->email)
            ->send(new \App\Mail\UserAccountCreatedMail($testUser, $temporaryPassword));

        \Log::info('=== DEBUG: Email sent successfully ===');

        return response()->json([
            'status' => 'SUCCESS',
            'message' => 'Email sent successfully to ' . $testUser->email,
            'password' => $temporaryPassword,
            'check_inbox'=> 'Check hasperthegreat04@gmail.com',
        ]);

    } catch (\Exception $e) {
        \Log::error('=== DEBUG: Email send failed ===', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'status' => 'ERROR',
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ], 500);
    }
});

// Test 3: Actually create a user and send email (full integration test)
Route::get('/debug-full-user-creation', function () {
    try {
        $temporaryPassword = \Illuminate\Support\Str::random(12);
        
        \Log::info('=== DEBUG FULL: Creating user ===');
        
        $user = \App\Models\User::create([
            'name' => 'Full Test User ' . now()->format('His'),
            'email' => 'hasperthegreat04@gmail.com',
            'department' => 'Test Department',
            'position' => 'Test Position',
            'role' => 'client',
            'password' => \Illuminate\Support\Facades\Hash::make($temporaryPassword),
            'status' => 'approved',
            'approved_by' => 1,
            'approved_at' => now(),
            'email_verified_at' => now(),
        ]);

        \Log::info('=== DEBUG FULL: User created ===', [
            'user_id' => $user->id,
            'email' => $user->email,
        ]);

        \Log::info('=== DEBUG FULL: Sending email ===');

        \Illuminate\Support\Facades\Mail::to($user->email)
            ->send(new \App\Mail\UserAccountCreatedMail($user, $temporaryPassword));

        \Log::info('=== DEBUG FULL: Email sent successfully ===');

        // Clean up - delete test user
        $user->delete();
        \Log::info('=== DEBUG FULL: Test user deleted ===');

        return response()->json([
            'status' => 'SUCCESS',
            'message' => 'Full test completed successfully! Email sent.',
            'password_used' => $temporaryPassword,
            'note' => 'Test user was created and then deleted',
        ]);

    } catch (\Exception $e) {
        \Log::error('=== DEBUG FULL: Failed ===', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json([
            'status' => 'ERROR',
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => explode("\n", $e->getTraceAsString()),
        ], 500);
    }
});

// Test 4: Check if route('login') works in production
Route::get('/debug-check-routes', function () {
    try {
        $loginRoute = route('login');
        $appUrl = config('app.url');
        
        return response()->json([
            'status' => 'SUCCESS',
            'routes_work'=> true,
            'login_route' => $loginRoute,
            'app_url' => $appUrl,
            'all_routes' => [
                'login' => route('login'),
                'dashboard' => route('dashboard'),
            ],
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'ERROR',
            'message' => 'Route generation failed: ' . $e->getMessage(),
        ], 500);
    }
});

// Test 5: Compare working vs non-working email sends
Route::get('/debug-compare-emails', function () {
    $results = [];
    
    // Test 1: Raw email (we know this works)
    try {
        \Illuminate\Support\Facades\Mail::raw('Test 1: Raw email', function ($message) {
            $message->to('hasperthegreat04@gmail.com')
                    ->subject('Debug Test 1: Raw');
        });
        $results['test1_raw'] = 'SUCCESS';
    } catch (\Exception $e) {
        $results['test1_raw'] = 'FAILED: ' . $e->getMessage();
    }
    
    // Test 2: Mailable with non-persisted user
    try {
        $tempUser = new \App\Models\User([
            'name' => 'Temp User',
            'email' => 'hasperthegreat04@gmail.com',
            'department' => 'Test',
            'position' => 'Test',
            'role' => 'client',
        ]);
        
        \Illuminate\Support\Facades\Mail::to('hasperthegreat04@gmail.com')
            ->send(new \App\Mail\UserAccountCreatedMail($tempUser, 'TestPass123'));
        
        $results['test2_mailable_temp_user'] = 'SUCCESS';
    } catch (\Exception $e) {
        $results['test2_mailable_temp_user'] = 'FAILED: ' . $e->getMessage();
    }
    
    // Test 3: Mailable with real persisted user
    try {
        $realUser = \App\Models\User::first();
        if ($realUser) {
            \Illuminate\Support\Facades\Mail::to('hasperthegreat04@gmail.com')
                ->send(new \App\Mail\UserAccountCreatedMail($realUser, 'TestPass123'));
            $results['test3_mailable_real_user'] = 'SUCCESS';
        } else {
            $results['test3_mailable_real_user'] = 'SKIPPED: No users in database';
        }
    } catch (\Exception $e) {
        $results['test3_mailable_real_user'] = 'FAILED: ' . $e->getMessage();
    }
    
    return response()->json([
        'status' => 'COMPARISON_COMPLETE',
        'results' => $results,
        'analysis' => 'Check which test failed to identify the issue',
    ]);
});