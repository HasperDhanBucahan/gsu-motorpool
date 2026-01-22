<?php

namespace App\Console\Commands;

use App\Models\Request;
use Carbon\Carbon;
use Illuminate\Console\Command;

class MarkCompletedRequests extends Command
{
    protected $signature = 'requests:mark-completed';
    protected $description = 'Mark approved requests as completed when their travel date has passed';

    public function handle()
    {
        $now = Carbon::now();
        
        $completedCount = Request::where('status', Request::STATUS_APPROVED)
            ->where('end_datetime', '<', $now)
            ->update(['status' => Request::STATUS_COMPLETED]);

        $this->info("Marked {$completedCount} request(s) as completed.");
        
        return 0;
    }
}