<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\AccountCreated;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
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
            'password' => 'nullable|string|min:8|confirmed', // Made password optional
        ]);

        try {
            // Generate temporary password if not provided
            $temporaryPassword = $validated['password'] ?? $this->generateTemporaryPassword();
            $emailSent = false;
            $emailError = null;

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
                'created_by' => auth()->id(),
            ]);

            // Try to send welcome email
            try {
                Mail::to($user->email)->send(new AccountCreated($user, $temporaryPassword));
                $emailSent = true;
                
                Log::info('Welcome email sent successfully', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                ]);
            } catch (\Exception $e) {
                $emailError = $e->getMessage();
                
                Log::warning('Failed to send welcome email', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $e->getMessage(),
                ]);
            }

            // Prepare success message
            if ($emailSent) {
                $successMessage = "User account created successfully! Welcome email sent to {$user->email}";
            } else {
                $successMessage = "User account created successfully! ⚠️ Email failed to send. Temporary password: {$temporaryPassword}";
            }

            return back()->with([
                'success' => $successMessage,
                'temporaryPassword' => !$emailSent ? $temporaryPassword : null, // Only show password if email failed
            ]);
            
        } catch (\Exception $e) {
            Log::error('Failed to create user', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return back()->withErrors(['error' => 'Failed to create user account: ' . $e->getMessage()]);
        }
    }

    /**
     * Generate a secure temporary password
     */
    private function generateTemporaryPassword(): string
    {
        // Generate a readable but secure password
        // Format: Word-Word-Number (e.g., Blue-Tiger-42)
        $adjectives = ['Blue', 'Red', 'Green', 'Swift', 'Bright', 'Bold', 'Quick', 'Smart'];
        $nouns = ['Tiger', 'Eagle', 'Wolf', 'Lion', 'Hawk', 'Bear', 'Fox', 'Owl'];
        
        $password = $adjectives[array_rand($adjectives)] . 
                   '-' . 
                   $nouns[array_rand($nouns)] . 
                   '-' . 
                   rand(10, 99);
        
        return $password;
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