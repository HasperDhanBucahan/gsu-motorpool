<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\AccountApprovedMail;
use App\Mail\AdminAccountCreatedMail;
use App\Mail\UserAccountCreatedMail; // NEW: For client accounts
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
                'status' => User::STATUS_APPROVED, // Auto-approve all created accounts
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            // Send email with credentials based on role
            try {
                if ($user->role === User::ROLE_CLIENT) {
                    // Send client account email
                    Mail::to($user->email)->send(new UserAccountCreatedMail($user, $temporaryPassword));
                } else {
                    // Send admin account email
                    Mail::to($user->email)->send(new AdminAccountCreatedMail($user, $temporaryPassword));
                }
            } catch (\Exception $e) {
                Log::error('Failed to send account creation email', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }

            DB::commit();

            Log::info('User account created', [
                'user_id' => $user->id,
                'role' => $user->role,
                'created_by' => auth()->id()
            ]);

            $roleType = $user->role === User::ROLE_CLIENT ? 'Client' : 'Admin';
            return redirect()->back()->with('success', "{$roleType} account created successfully. Login credentials sent to email.");

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('User account creation failed', [
                'error' => $e->getMessage()
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

    /**
     * REMOVED: approve() method - no longer needed
     * REMOVED: reject() method - no longer needed
     */
}