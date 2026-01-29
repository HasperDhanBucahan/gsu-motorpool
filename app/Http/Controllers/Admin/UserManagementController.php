<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\AccountApprovedMail;
use App\Mail\AdminAccountCreatedMail;
use App\Mail\UserAccountCreatedMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Inertia\Inertia;

class UserManagementController extends Controller
{
    /**
     * Display user management page
     */
    public function index()
    {
        // Get all approved users (no pending state anymore)
        $users = User::where('status', User::STATUS_APPROVED)
            ->with('approver')
            ->orderBy('created_at', 'desc')
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
                    'created_at' => $user->created_at->format('M d, Y h:i A'),
                ];
            });

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
        ]);
    }

    /**
     * Create a new user account (client or admin)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'role' => ['required', Rule::in([
                User::ROLE_CLIENT,
                User::ROLE_ASSIGNMENT_ADMIN,
                User::ROLE_TICKET_ADMIN
            ])],
        ]);

        try {
            DB::beginTransaction();

            // Generate temporary password
            $temporaryPassword = Str::random(12);

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
            ]);

            // ENHANCED EMAIL SENDING WITH DETAILED LOGGING
            try {
                Log::info('Attempting to send account creation email', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'user_role' => $user->role,
                    'mail_config' => [
                        'mailer' => config('mail.default'),
                        'host' => config('mail.mailers.smtp.host'),
                        'port' => config('mail.mailers.smtp.port'),
                        'from' => config('mail.from.address'),
                    ]
                ]);

                if ($user->role === User::ROLE_CLIENT) {
                    // Send client account email
                    Mail::to($user->email)->send(new UserAccountCreatedMail($user, $temporaryPassword));
                    Log::info('Client account email sent successfully', [
                        'user_id' => $user->id,
                        'email' => $user->email
                    ]);
                } else {
                    // Send admin account email
                    Mail::to($user->email)->send(new AdminAccountCreatedMail($user, $temporaryPassword));
                    Log::info('Admin account email sent successfully', [
                        'user_id' => $user->id,
                        'email' => $user->email
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Failed to send account creation email', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'error_message' => $e->getMessage(),
                    'error_trace' => $e->getTraceAsString(),
                    'error_file' => $e->getFile(),
                    'error_line' => $e->getLine()
                ]);

                // Don't rollback the transaction - user is created but email failed
                // Instead, notify the admin
                DB::commit();
                
                $roleType = $user->role === User::ROLE_CLIENT ? 'Client' : 'Admin';
                return redirect()->back()->with('warning', "{$roleType} account created successfully, but failed to send email. Please provide credentials manually. Email: {$user->email}, Password: {$temporaryPassword}");
            }

            DB::commit();

            Log::info('User account created successfully', [
                'user_id' => $user->id,
                'role' => $user->role,
                'created_by' => auth()->id()
            ]);

            $roleType = $user->role === User::ROLE_CLIENT ? 'Client' : 'Admin';
            return redirect()->back()->with('success', "{$roleType} account created successfully. Login credentials sent to email.");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('User account creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'Failed to create account: ' . $e->getMessage()]);
        }
    }

    /**
     * Update user information
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'role' => ['required', Rule::in([
                User::ROLE_CLIENT,
                User::ROLE_ASSIGNMENT_ADMIN,
                User::ROLE_TICKET_ADMIN
            ])],
        ]);

        try {
            $user->update($validated);

            Log::info('User updated', [
                'user_id' => $user->id,
                'updated_by' => auth()->id()
            ]);

            return redirect()->back()->with('success', 'User updated successfully.');

        } catch (\Exception $e) {
            Log::error('User update failed', [
                'user_id' => $id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Failed to update user: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete a user
     */
    public function destroy($id)
    {
        try {
            $user = User::findOrFail($id);

            // Prevent deleting yourself
            if ($user->id === auth()->id()) {
                return back()->withErrors(['error' => 'You cannot delete your own account.']);
            }

            // Prevent deleting approval admin
            if ($user->role === User::ROLE_APPROVAL_ADMIN) {
                return back()->withErrors(['error' => 'Approval admin accounts cannot be deleted.']);
            }

            $userName = $user->name;
            $user->delete();

            Log::info('User deleted', [
                'user_name' => $userName,
                'deleted_by' => auth()->id()
            ]);

            return redirect()->back()->with('success', 'User deleted successfully.');

        } catch (\Exception $e) {
            Log::error('User deletion failed', [
                'user_id' => $id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Failed to delete user: ' . $e->getMessage()]);
        }
    }
}