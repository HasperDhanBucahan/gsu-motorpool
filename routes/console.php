<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Request as VehicleRequest;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Your existing schedule
Schedule::command('requests:mark-completed')->hourly();

// NEW: Auto-complete requests that have passed their end_datetime
// This runs in addition to the command above (backup/redundancy)
Schedule::call(function () {
    $completed = VehicleRequest::where('status', VehicleRequest::STATUS_APPROVED)
        ->where('end_datetime', '<', now())
        ->update(['status' => VehicleRequest::STATUS_COMPLETED]);

    if ($completed > 0) {
        \Log::info("Auto-completed {$completed} requests via scheduler");
    }
})->hourly()->name('auto-complete-requests-backup');