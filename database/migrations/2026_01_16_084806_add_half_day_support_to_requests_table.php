<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            // Change days_of_travel from int to decimal to support 0.5, 1.5, etc.
            $table->decimal('days_of_travel', 3, 1)->change();
            
            // Add half_day_period column
            $table->enum('half_day_period', ['morning', 'afternoon', 'full'])
                  ->nullable()
                  ->after('days_of_travel');
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropColumn('half_day_period');
            $table->integer('days_of_travel')->change();
        });
    }
};