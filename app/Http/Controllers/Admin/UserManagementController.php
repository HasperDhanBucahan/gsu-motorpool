<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\UserAccountCreatedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    public function index()
    {
        $users = User::with('approver')
            ->latest()
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'department' => $user->department,
                    'position' => $user->position,
                    'role' => $user->role,
                    'role_name' => $user->role_name,
                    'status' => $user->status,
                    'created_by' => $user->approver ? $user->approver->name : 'System',
                    'created_at' => $user->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'role' => 'required|in:client,assignment_admin,ticket_admin',
        ]);

        try {
            // Generate a random temporary password
            $temporaryPassword = Str::random(12);

            // Create the user
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'department' => $validated['department'],
                'position' => $validated['position'],
                'role' => $validated['role'],
                'password' => Hash::make($temporaryPassword),
                'status' => User::STATUS_APPROVED,
                'approved_by' => auth()->id(),
                'approved_at' => now(),
                'email_verified_at' => now(),
            ]);

            Log::info('User created successfully', [
                'user_id' => $user->id,
                'email' => $user->email,
                'name' => $user->name,
                'environment' => config('app.env'),
            ]);

            // Send email with credentials using Resend
            try {
                Log::info('Attempting to send email via Resend', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'mailer' => config('mail.default'),
                    'from_address' => config('mail.from.address'),
                ]);

                Mail::to($user->email)->send(new UserAccountCreatedMail($user, $temporaryPassword));

                Log::info('Email sent successfully via Resend', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);

                return back()->with('success', 'User account created successfully! Login credentials have been sent to ' . $user->email);
                
            } catch (\Exception $mailException) {
                Log::error('Failed to send email via Resend', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $mailException->getMessage(),
                    'trace' => $mailException->getTraceAsString(),
                    'resend_key_exists' => !empty(config('services.resend.key')),
                ]);

                // User is created, but email failed - return the password in the warning
                return back()->with('warning', 'User account created, but failed to send email. Please provide these credentials manually - Email: ' . $user->email . ' | Password: ' . $temporaryPassword);
            }
        } catch (\Exception $e) {
            Log::error('Failed to create user', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['error' => 'Failed to create user account: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Prevent editing approval admin role unless you are approval admin
        if ($user->role === User::ROLE_APPROVAL_ADMIN && auth()->user()->role !== User::ROLE_APPROVAL_ADMIN) {
            return back()->withErrors(['error' => 'You cannot edit approval admin accounts.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'role' => 'required|in:client,assignment_admin,ticket_admin,approval_admin',
        ]);

        // Prevent changing approval admin role
        if ($user->role === User::ROLE_APPROVAL_ADMIN && $validated['role'] !== User::ROLE_APPROVAL_ADMIN) {
            return back()->withErrors(['error' => 'You cannot change the role of an approval admin.']);
        }

        try {
            $user->update($validated);

            Log::info('User updated successfully', [
                'user_id' => $user->id,
                'updated_by' => auth()->id(),
            ]);

            return back()->with('success', 'User updated successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to update user', [
                'user_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Failed to update user: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        // Prevent deleting approval admin
        if ($user->role === User::ROLE_APPROVAL_ADMIN) {
            return back()->withErrors(['error' => 'Approval admin accounts cannot be deleted.']);
        }

        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->withErrors(['error' => 'You cannot delete your own account.']);
        }

        try {
            $user->delete();

            Log::info('User deleted successfully', [
                'user_id' => $user->id,
                'deleted_by' => auth()->id(),
            ]);

            return back()->with('success', 'User deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to delete user', [
                'user_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['error' => 'Failed to delete user: ' . $e->getMessage()]);
        }
    }
}