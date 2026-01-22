<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            // Check if columns don't exist before adding them
            if (!Schema::hasColumn('assignments', 'declined_at')) {
                $table->timestamp('declined_at')->nullable()->after('assigned_end');
            }
            
            if (!Schema::hasColumn('assignments', 'declined_by')) {
                $table->unsignedBigInteger('declined_by')->nullable()->after('declined_at');
            }
            
            if (!Schema::hasColumn('assignments', 'decline_reason')) {
                $table->text('decline_reason')->nullable()->after('declined_by');
            }
            
            // Add foreign key constraint for declined_by if it doesn't exist
            if (!Schema::hasColumn('assignments', 'declined_by')) {
                $table->foreign('declined_by')->references('id')->on('users')->onDelete('set null');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            // Drop foreign key first
            $table->dropForeign(['declined_by']);
            
            // Drop columns
            $table->dropColumn(['declined_at', 'declined_by', 'decline_reason']);
        });
    }
};