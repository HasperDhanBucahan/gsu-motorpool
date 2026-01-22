<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Create this migration with:
     * php artisan make:migration add_ticket_sent_fields_to_requests_table
     */
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->timestamp('ticket_sent_at')->nullable()->after('ticket_generated_at');
            $table->string('ticket_sent_to')->nullable()->after('ticket_sent_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn(['ticket_sent_at', 'ticket_sent_to']);
        });
    }
};