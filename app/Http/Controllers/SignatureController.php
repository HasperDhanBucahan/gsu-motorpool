<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class SignatureController extends Controller
{
    /**
     * Upload or update user signature
     * Works for all roles: client, assignment_admin, approval_admin
     */
    public function upload(Request $request)
    {
        $request->validate([
            'signature' => 'required|image|mimes:png,jpg,jpeg|max:2048',
        ]);

        try {
            $user = Auth::user();
            
            // Delete old signature if exists
            if ($user->signature_path) {
                Storage::disk('public')->delete($user->signature_path);
            }

            // Store new signature
            $path = $request->file('signature')->store('signatures', 'public');
            
            // Update user record
            $user->update([
                'signature_path' => $path
            ]);

            return redirect()->back()->with('success', 'Signature uploaded successfully!');

        } catch (\Exception $e) {
            \Log::error('Signature upload failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return redirect()->back()
                ->with('error', 'Failed to upload signature. Please try again.');
        }
    }

    /**
     * Delete user signature
     */
    public function delete(Request $request)
    {
        try {
            $user = Auth::user();
            
            if ($user->signature_path) {
                Storage::disk('public')->delete($user->signature_path);
                
                $user->update([
                    'signature_path' => null
                ]);

                return redirect()->back()->with('success', 'Signature deleted successfully!');
            }

            return redirect()->back()->with('info', 'No signature to delete.');

        } catch (\Exception $e) {
            \Log::error('Signature deletion failed', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage()
            ]);

            return redirect()->back()
                ->with('error', 'Failed to delete signature. Please try again.');
        }
    }
}