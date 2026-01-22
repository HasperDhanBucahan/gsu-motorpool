<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\AccountApprovedMail;
use App\Mail\AdminAccountCreatedMail;
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
        $users = User::with('approver')
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
                    'approved_by' => $user->approver ? $user->approver->name : null,
                    'approved_at' => $user->approved_at?->format('M d, Y h:i A'),
                    'created_at' => $user->created_at->format('M d, Y h:i A'),
                ];
            });

        $pendingCount = User::where('status', User::STATUS_PENDING)->count();

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'pendingCount' => $pendingCount,
        ]);
    }

    /**
     * Approve a pending user
     */
    public function approve($id)
    {
        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            if ($user->status !== User::STATUS_PENDING) {
                return back()->withErrors(['error' => 'Only pending users can be approved.']);
            }

            $user->update([
                'status' => User::STATUS_APPROVED,
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            // Send approval email
            try {
                Mail::to($user->email)->send(new AccountApprovedMail($user));
            } catch (\Exception $e) {
                Log::error('Failed to send approval email', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }

            DB::commit();

            Log::info('User approved', [
                'user_id' => $user->id,
                'approved_by' => auth()->id()
            ]);

            return redirect()->back()->with('success', 'User approved successfully. Approval email sent.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('User approval failed', [
                'user_id' => $id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Failed to approve user: ' . $e->getMessage()]);
        }
    }

    /**
     * Reject and delete a pending user
     */
    public function reject($id)
    {
        try {
            DB::beginTransaction();

            $user = User::findOrFail($id);

            if ($user->status !== User::STATUS_PENDING) {
                return back()->withErrors(['error' => 'Only pending users can be rejected.']);
            }

            if ($user->role !== User::ROLE_CLIENT) {
                return back()->withErrors(['error' => 'Only client accounts can be rejected.']);
            }

            $userName = $user->name;
            $userEmail = $user->email;

            // Delete the user
            $user->delete();

            DB::commit();

            Log::info('User rejected and deleted', [
                'user_name' => $userName,
                'user_email' => $userEmail,
                'rejected_by' => auth()->id()
            ]);

            return redirect()->back()->with('success', 'User registration rejected and removed from system.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('User rejection failed', [
                'user_id' => $id,
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Failed to reject user: ' . $e->getMessage()]);
        }
    }

    /**
     * Create a new admin user (assignment_admin or ticket_admin)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'department' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'role' => ['required', Rule::in([User::ROLE_ASSIGNMENT_ADMIN, User::ROLE_TICKET_ADMIN])],
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
                'status' => User::STATUS_APPROVED, // Auto-approve admin accounts
                'approved_by' => auth()->id(),
                'approved_at' => now(),
            ]);

            // Send email with credentials
            try {
                Mail::to($user->email)->send(new AdminAccountCreatedMail($user, $temporaryPassword));
            } catch (\Exception $e) {
                Log::error('Failed to send admin account creation email', [
                    'user_id' => $user->id,
                    'error' => $e->getMessage()
                ]);
            }

            DB::commit();

            Log::info('Admin user created', [
                'user_id' => $user->id,
                'role' => $user->role,
                'created_by' => auth()->id()
            ]);

            return redirect()->back()->with('success', 'Admin account created successfully. Login credentials sent to email.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Admin user creation failed', [
                'error' => $e->getMessage()
            ]);

            return back()->withErrors(['error' => 'Failed to create admin account: ' . $e->getMessage()]);
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