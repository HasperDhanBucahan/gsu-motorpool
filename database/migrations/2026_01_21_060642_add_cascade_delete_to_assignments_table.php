<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            // Drop existing foreign key
            $table->dropForeign(['request_id']);
            
            // Re-add with cascade delete
            $table->foreign('request_id')
                  ->references('id')
                  ->on('requests')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('assignments', function (Blueprint $table) {
            // Drop the cascade foreign key
            $table->dropForeign(['request_id']);
            
            // Re-add without cascade
            $table->foreign('request_id')
                  ->references('id')
                  ->on('requests');
        });
    }
};