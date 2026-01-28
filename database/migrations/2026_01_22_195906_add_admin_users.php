<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        User::create([
            'name' => 'Approval Admin',
            'department' => 'Administration',
            'position' => 'Approval Administrator',
            'email' => 'approval_admin@sample.com',
            'password' => bcrypt('password'),
            'role' => 'approval_admin',
            'status' => 'approved',
        ]);

        User::create([
            'name' => 'Assignment Admin',
            'department' => 'Operations',
            'position' => 'Assignment Administrator',
            'email' => 'assignment_admin@sample.com',
            'password' => bcrypt('password'),
            'role' => 'assignment_admin',
            'status' => 'approved',
        ]);

        User::create([
            'name' => 'Ticket Admin',
            'department' => 'Documentation',
            'position' => 'Ticket Administrator',
            'email' => 'ticket_admin@sample.com',
            'password' => bcrypt('password'),
            'role' => 'ticket_admin',
            'status' => 'approved',
        ]);

        User::create([
            'name' => 'Client User',
            'department' => 'BSIT',
            'position' => 'Program Chair',
            'email' => 'hasperthegreat04@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'client',
            'status' => 'approved',
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        User::whereIn('email', [
            'approval_admin@sample.com',
            'assignment_admin@sample.com',
            'ticket_admin@sample.com',
            'hasperthegreat04@gmail.com'
        ])->delete();
    }
};