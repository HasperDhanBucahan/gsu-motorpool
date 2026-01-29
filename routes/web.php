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

Route::get('/diagnose-email-config', function () {
    $diagnostics = [
        'timestamp' => now()->toDateTimeString(),
        'environment' => config('app.env'),
        
        // Mail Configuration
        'mail_config' => [
            'default_mailer' => config('mail.default'),
            'resend_transport_configured' => config('mail.mailers.resend.transport') ?? 'NOT SET',
            'from_address' => config('mail.from.address'),
            'from_name' => config('mail.from.name'),
        ],
        
        // Services Configuration
        'services_config' => [
            'resend_key_configured' => !empty(config('services.resend.key')),
            'resend_key_preview' => config('services.resend.key') 
                ? substr(config('services.resend.key'), 0, 10) . '...' . substr(config('services.resend.key'), -4)
                : 'NOT SET',
        ],
        
        // Environment Variables
        'env_vars' => [
            'MAIL_MAILER' => env('MAIL_MAILER'),
            'RESEND_KEY_set' => !empty(env('RESEND_KEY')),
            'RESEND_KEY_preview' => env('RESEND_KEY') 
                ? substr(env('RESEND_KEY'), 0, 10) . '...' . substr(env('RESEND_KEY'), -4)
                : 'NOT SET',
            'MAIL_FROM_ADDRESS' => env('MAIL_FROM_ADDRESS'),
            'MAIL_FROM_NAME' => env('MAIL_FROM_NAME'),
        ],
        
        // Package Check
        'packages' => [
            'resend_package_installed' => class_exists(\Resend\Laravel\ResendServiceProvider::class),
            'resend_version' => 'Check composer.json',
        ],
        
        // Config Files Exist
        'config_files' => [
            'mail_config_exists' => file_exists(config_path('mail.php')),
            'services_config_exists' => file_exists(config_path('services.php')),
        ],
        
        // Mail Mailable Check
        'mail_classes' => [
            'UserAccountCreatedMail_exists' => class_exists(\App\Mail\UserAccountCreatedMail::class),
            'Mail_facade_works' => class_exists(\Illuminate\Support\Facades\Mail::class),
        ],
    ];
    
    // Determine issues
    $issues = [];
    $recommendations = [];
    
    if (config('mail.default') !== 'resend') {
        $issues[] = "MAIL_MAILER is not set to 'resend' (current: " . config('mail.default') . ")";
        $recommendations[] = "Set MAIL_MAILER=resend in Railway environment variables";
    }
    
    if (empty(config('services.resend.key'))) {
        $issues[] = "Resend API key not configured in services.php";
        $recommendations[] = "Add 'resend' => ['key' => env('RESEND_KEY')] to config/services.php";
    }
    
    if (empty(env('RESEND_KEY'))) {
        $issues[] = "RESEND_KEY environment variable not set";
        $recommendations[] = "Set RESEND_KEY in Railway environment variables";
    }
    
    $resendMailer = config('mail.mailers.resend');
    if (empty($resendMailer)) {
        $issues[] = "Resend mailer not configured in mail.php";
        $recommendations[] = "Add 'resend' => ['transport' => 'resend'] to config/mail.php mailers array";
    }
    
    $diagnostics['issues'] = $issues;
    $diagnostics['recommendations'] = $recommendations;
    $diagnostics['status'] = empty($issues) ? 'READY' : 'NEEDS_CONFIGURATION';
    
    return response()->json($diagnostics, 200, [], JSON_PRETTY_PRINT);
});

// BONUS: Test actual email sending
Route::get('/diagnose-email-send', function () {
    $testEmail = 'hasperthegreat04@gmail.com';
    
    try {
        \Log::info('Email Send Test Started', [
            'mailer' => config('mail.default'),
            'to' => $testEmail,
        ]);
        
        \Mail::raw('Diagnostic test email sent at ' . now()->format('Y-m-d H:i:s') . ' from Railway deployment.', function ($message) use ($testEmail) {
            $message->to($testEmail)
                    ->subject('Email Diagnostic Test - QSU Motorpool');
        });
        
        \Log::info('Email Send Test - SUCCESS');
        
        return response()->json([
            'status' => 'SUCCESS',
            'message' => 'Email sent successfully to ' . $testEmail,
            'mailer_used' => config('mail.default'),
            'check_logs' => 'Review Railway logs for detailed information',
        ]);
        
    } catch (\Exception $e) {
        \Log::error('Email Send Test - FAILED', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ]);
        
        return response()->json([
            'status' => 'ERROR',
            'message' => $e->getMessage(),
            'error_type' => get_class($e),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
        ], 500);
    }
});