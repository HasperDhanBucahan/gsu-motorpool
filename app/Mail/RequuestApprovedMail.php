<?php

namespace App\Mail;

use App\Models\Request as VehicleRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class RequestApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public VehicleRequest $request;
    public string $pdfDownloadUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(VehicleRequest $request, string $pdfDownloadUrl)
    {
        $this->request = $request;
        $this->pdfDownloadUrl = $pdfDownloadUrl;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Vehicle Request Approved - Request #' . $this->request->id,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.request-approved',
            with: [
                'request' => $this->request,
                'pdfDownloadUrl' => $this->pdfDownloadUrl,
                'requesterName' => $this->request->user->name,
                'destination' => $this->request->destination,
                'dateOfTravel' => $this->request->date_of_travel->format('F d, Y'),
                'timeOfTravel' => $this->request->time_of_travel,
                'vehicle' => $this->request->vehicle->description ?? 'N/A',
                'vehiclePlate' => $this->request->vehicle->plate_number ?? 'N/A',
                'driverName' => $this->request->driver->name ?? 'N/A',
                'approvedBy' => $this->request->approver->name ?? 'Admin',
                'approvedAt' => $this->request->approved_at->format('F d, Y h:i A'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}