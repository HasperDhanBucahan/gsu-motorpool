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
        Schema::table('requests', function (Blueprint $table) {
            $table->boolean('forwarded_for_decline')->default(false)->after('decline_reason');
            $table->text('forwarded_decline_reason')->nullable()->after('forwarded_for_decline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn(['forwarded_for_decline', 'forwarded_decline_reason']);
        });
    }
};