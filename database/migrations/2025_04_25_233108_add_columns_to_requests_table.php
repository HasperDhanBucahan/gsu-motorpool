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
            $table->string('destination')->after('user_id');
            $table->text('authorized_passengers')->nullable()->after('destination');
            $table->integer('days_of_travel')->after('authorized_passengers');

            $table->renameColumn('date', 'date_of_travel');
            $table->renameColumn('start_time', 'time_of_travel');

            $table->dropColumn('end_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn(['destination', 'authorized_passengers', 'days_of_travel']);

            $table->renameColumn('date_of_travel', 'date');
            $table->renameColumn('time_of_travel', 'start_time');

            $table->time('end_time')->nullable(); 
        });
    }
};
