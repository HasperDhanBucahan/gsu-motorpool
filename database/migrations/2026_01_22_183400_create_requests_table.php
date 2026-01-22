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
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('destination');
            $table->text('authorized_passengers')->nullable();
            $table->integer('days_of_travel');
            $table->enum('half_day_period', ['morning', 'afternoon', 'full']);
            $table->text('purpose');
            $table->date('date_of_travel');
            $table->time('time_of_travel');
            $table->string('status')->default('pending');
            $table->unsignedBigInteger('vehicle_id')->nullable();
            $table->unsignedBigInteger('driver_id')->nullable();
            $table->dateTime('start_datetime')->nullable();
            $table->dateTime('end_datetime')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->unsignedBigInteger('approved_by')->nullable();
            $table->timestamp('declined_at')->nullable();
            $table->unsignedBigInteger('declined_by')->nullable();
            $table->text('decline_reason')->nullable();
            $table->boolean('forwarded_for_decline')->default(false);
            $table->text('forwarded_decline_reason')->nullable();
            $table->timestamp('ticket_generated_at')->nullable();
            $table->timestamp('ticket_sent_at')->nullable();
            $table->string('ticket_sent_to')->nullable();
            $table->string('trip_ticket_number')->nullable()->unique();
            $table->timestamps();
            
            // Add foreign key constraints
            $table->foreign('vehicle_id')->references('id')->on('vehicles')->nullOnDelete();
            $table->foreign('driver_id')->references('id')->on('drivers')->nullOnDelete();
            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('declined_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requests');
    }
};