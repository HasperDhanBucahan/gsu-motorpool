<?php

namespace App\Http\Controllers\Admin;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\Assignment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use App\Models\Request as VehicleRequest;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Storage;
use setasign\Fpdi\Fpdi;
use Carbon\Carbon;

class ApprovalController extends Controller
{
    /**
     * Unified Request Management - All requests in one view with tabs
     */
    public function requestManagement(): Response
    {
        $pendingRequests = VehicleRequest::where('status', VehicleRequest::STATUS_ASSIGNED)
            ->where('forwarded_for_decline', false)
            ->with(['user', 'vehicle', 'driver', 'assignment'])
            ->orderBy('created_at', 'asc')
            ->get();

        $forwardedRequests = VehicleRequest::where('status', VehicleRequest::STATUS_ASSIGNED)
            ->where('forwarded_for_decline', true)
            ->with(['user', 'vehicle', 'driver', 'assignment'])
            ->orderBy('created_at', 'asc')
            ->get();

        $approvedRequests = VehicleRequest::where('status', VehicleRequest::STATUS_APPROVED)
            ->with(['user', 'vehicle', 'driver', 'assignment'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $declinedRequests = VehicleRequest::where('status', VehicleRequest::STATUS_DECLINED)
            ->with(['user', 'vehicle', 'driver', 'assignment'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $completedRequests = VehicleRequest::where('status', VehicleRequest::STATUS_COMPLETED)
            ->with(['user', 'vehicle', 'driver', 'assignment'])
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('Admin/RequestManagement', [
            'pendingRequests' => $pendingRequests,
            'forwardedRequests' => $forwardedRequests,
            'approvedRequests' => $approvedRequests,
            'declinedRequests' => $declinedRequests,
            'completedRequests' => $completedRequests,
        ]);
    }

    /**
     * Upload signature
     */
    public function uploadSignature(HttpRequest $request): RedirectResponse
    {
        try {
            $validated = $request->validate([
                'signature' => 'required|image|mimes:png|max:2048'
            ]);

            $user = auth()->user();

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

            return redirect()->back()->with('success', 'Signature saved successfully');
        } catch (\Exception $e) {
            Log::error('Signature upload failed: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Failed to save signature: ' . $e->getMessage());
        }
    }

    /**
     * Preview Approval/Decline PDF before confirming
     */
    public function previewApproval(HttpRequest $httpRequest, $id)
    {
        $action = $httpRequest->query('action'); // 'approve' or 'decline'
        $declineReason = urldecode($httpRequest->query('decline_reason', ''));

        $request = VehicleRequest::with(['user', 'vehicle', 'driver', 'assignment'])->findOrFail($id);
        $vehicle = $request->vehicle;
        $driver = $request->driver;

        // Generate PDF with preview data
        $pdf = $this->generateApprovalPdf($request, $request->vehicle ?? null, $request->driver ?? null, $action, $declineReason, auth()->user());

        return response($pdf->Output('S'))
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="Approval_Preview_'.$id.'.pdf"');
    }

    /**
     * Approve a request
     */
    public function approve($id): RedirectResponse
    {
        try {
            DB::beginTransaction();

            $request = VehicleRequest::findOrFail($id);

            // Ensure request is in assigned status
            if ($request->status !== VehicleRequest::STATUS_ASSIGNED) {
                return back()->withErrors(['error' => 'Only assigned requests can be approved.']);
            }

            if (!$request->vehicle || !$request->driver) {
                return back()->withErrors([
                    'error' => 'This request cannot be approved because no vehicle or driver is assigned.'
                ]);
            }

            $request->update([
                'status' => VehicleRequest::STATUS_APPROVED,
                'approved_at' => now(),
                'approved_by' => auth()->id(),
            ]);

            // Update assignment record if needed
            if ($request->assignment) {
                $request->assignment->update([
                    'updated_at' => now(),
                ]);
            }

            DB::commit();

            // Notify client
            app(NotificationService::class)->notifyClient($request, 'approved');

            // Notify ticket admin for trip ticket preparation
            app(NotificationService::class)->notifyTicketAdmin($request, 'aproved');

            return redirect()->route('admin.requests.management')
                ->with('success', 'Request approved successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Request approval failed: ' . $e->getMessage(), [
                'request_id' => $id,
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'Approval failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Decline a request
     */
    public function decline(HttpRequest $httpRequest, $id): RedirectResponse
    {
        $validated = $httpRequest->validate([
            'decline_reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        try {
            DB::beginTransaction();

            $request = VehicleRequest::findOrFail($id);

            Log::info('Attempting to decline request', [
                'request_id' => $id,
                'current_status' => $request->status,
                'user_id' => auth()->id(),
                'reason' => $validated['decline_reason']
            ]);

            // Ensure request is in assigned status
            if ($request->status !== VehicleRequest::STATUS_ASSIGNED) {
                Log::warning('Request decline failed - invalid status', [
                    'request_id' => $id,
                    'current_status' => $request->status,
                    'expected_status' => VehicleRequest::STATUS_ASSIGNED
                ]);
                throw new \Exception('Only assigned requests can be declined. Current status: ' . $request->status);
            }

            // Update the request
            $request->update([
                'status' => VehicleRequest::STATUS_DECLINED,
                'declined_at' => now(),
                'declined_by' => auth()->id(),
                'decline_reason' => $validated['decline_reason'],
            ]);

            // Update assignment record if it exists
            if ($request->assignment) {
                $request->assignment->update([
                    'declined_at' => now(),
                    'declined_by' => auth()->id(),
                    'decline_reason' => $validated['decline_reason'],
                ]);
                Log::info('Assignment record updated for declined request', [
                    'assignment_id' => $request->assignment->id
                ]);
            }

            DB::commit();

            Log::info('Request declined successfully', [
                'request_id' => $id,
                'user_id' => auth()->id()
            ]);

            // Notify client about decline
            app(NotificationService::class)->notifyClient($request, 'declined');

            return redirect()->route('admin.requests.management')
                ->with('success', 'Request declined successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Request decline validation failed', [
                'request_id' => $id,
                'errors' => $e->errors()
            ]);
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Request decline failed: ' . $e->getMessage(), [
                'request_id' => $id,
                'user_id' => auth()->id(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['error' => 'Decline failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Dashboard showing approval statistics
     */
    public function dashboard(): Response
    {
        $data = [
            'stats' => [
                'pending_approvals' => VehicleRequest::where('status', VehicleRequest::STATUS_ASSIGNED)->count(),
                'approved_requests' => VehicleRequest::where('status', VehicleRequest::STATUS_APPROVED)->count(),
                'declined_requests' => VehicleRequest::where('status', VehicleRequest::STATUS_DECLINED)->count(),
                'total_requests' => VehicleRequest::count(),
            ],
            'recentActivity' => VehicleRequest::with(['user', 'vehicle', 'driver'])
                ->whereIn('status', [VehicleRequest::STATUS_APPROVED, VehicleRequest::STATUS_DECLINED])
                ->orderBy('updated_at', 'desc')
                ->limit(10)
                ->get(),
        ];

        return Inertia::render('Dashboard', [
            'data' => $data,
        ]);
    }

    /**
     * Generate Approval/Decline PDF
     */
    private function generateApprovalPdf(VehicleRequest $request, ?Vehicle $vehicle, ?Driver $driver, string $action, string $declineReason, $approvalAdmin): Fpdi
    {
        $pdf = new Fpdi();
        $pdf->setSourceFile(storage_path('app/templates/F2_Request-for-Use-of-Vehicle_rev1.pdf'));
        $tpl = $pdf->importPage(1);
        $size = $pdf->getTemplateSize($tpl);

        $pdf->AddPage($size['orientation'], [$size['width'], $size['height']]);
        $pdf->useTemplate($tpl, 0, 0, $size['width'], $size['height']);

        $pdf->AddFont('BookOS', '', 'BOOKOS.php');
        $pdf->AddFont('BookOS', 'B', 'BOOKOSB.php');
        $pdf->AddFont('BookOS', 'I', 'BOOKOSI.php');
        $pdf->SetFont('BookOS', '', 11);

        // Requestor Information
        // Request No.
        $pdf->SetXY(165, 52);
        $pdf->Write(0, $request->id);

        // Date Requested
        $pdf->SetXY(171, 59);
        $pdf->Write(0, $request->created_at->format('M. j, Y'));

        // Time Requested
        $pdf->SetXY(172, 66.5);
        $pdf->Write(0, $request->created_at->format('h:i A'));

        // Name
        $pdf->SetXY(83, 52);
        $pdf->Write(0, $request->user->name);

        // Department & Position
        $pdf->SetXY(70, 59);
        $pdf->Write(0, "{$request->user->department} - {$request->user->position}");

        // Destination
        $pdf->SetFont('BookOS', '', 9.5);
        $pdf->SetXY(68, 67);
        $pdf->Write(0, $request->destination);

        // Purpose
        $pdf->SetXY(49, 70.5);
        $pdf->MultiCell(149, 7, $request->purpose, 0, 'L');

        // Authorized Passengers
        $pdf->SetXY(72, 100);
        $pdf->MultiCell(125, 7, $request->authorized_passengers, 0, 'L');

        // Date of Travel
        $pdf->SetFont('BookOS', '', 11);
        $pdf->SetXY(55, 140);
        $pdf->Write(0, $request->date_of_travel->format('F d, Y'));

        // Days of Travel (with half-day period if applicable)
        $pdf->SetXY(58, 148);
        $pdf->Write(0, $request->getFormattedDuration());

        // Time of Travel
        $pdf->SetXY(169, 140.5);
        $timeObj = Carbon::parse($request->time_of_travel);
        $displayTime = $timeObj->format('h:i A');
        $pdf->Write(0, $displayTime);

        // ASSIGNMENT DETAILS
        // Assigned Vehicle
        if ($vehicle) {
            // Assigned Vehicle
            $pdf->SetFont('BookOS', '', 10);
            $pdf->SetXY(148, 191.5);
            $pdf->MultiCell(56, 4, $vehicle->description . ' - ' . $vehicle->plate_number, 0, 'L');
        } else {
            // Show "Not Assigned" or leave blank
            $pdf->SetFont('BookOS', '', 10);
            $pdf->SetXY(148, 194);
            $pdf->Write(0, 'Not Assigned');
        }

        if ($driver) {
            // Assigned Driver
            $pdf->SetXY(39, 194);
            $pdf->Write(0, $driver->name . ' - ' . $driver->contact_number);
        } else {
            // Show "Not Assigned" or leave blank
            $pdf->SetXY(39, 194);
            $pdf->Write(0, 'Not Assigned');
        }

        // Requestor Signature
        $pdf->SetFont('BookOS', 'I', 11);
        $pdf->SetXY(105, 159);
        $pdf->Write(0, 'Sgd.');
        $pdf->SetFont('BookOS', 'B', 11);
        $pdf->SetXY(90, 164);
        $pdf->Write(0, strtoupper($request->user->name));

        // Assignment Admin Signature
        $pdf->SetFont('BookOS', 'I', 11);
        $pdf->SetXY(105, 203);
        $pdf->Write(0, 'Sgd.');

        // APPROVAL/DECLINE SECTION
        // Approval Status Checkmarks
        $pdf->SetFont('ZapfDingbats');
        $pdf->SetFontSize(15);

        if ($action === 'approve') {
            $pdf->SetXY(25.5, 228);
            $pdf->Write(0, '4');
        } elseif ($action === 'decline') {
            $pdf->SetXY(82.5, 228);
            $pdf->Write(0, '4');
            
            // Decline Reason
            $pdf->SetFont('BookOS', '', 11);
            $pdf->SetXY(127, 228);
            $pdf->Write(0, $declineReason);
        }

        // Approval Admin Signature
        $pdf->SetFont('BookOS', 'I', 11);
        $pdf->SetXY(105, 242);
        $pdf->Write(0, 'Sgd.');

        return $pdf;
    }
}