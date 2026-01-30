<?php

namespace App\Mail;

use App\Models\Request as VehicleRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;
use Illuminate\Mail\Mailables\Address;

class RequestApproved extends Mailable
{
    use Queueable, SerializesModels;

    public $vehicleRequest;
    public $pdfContent;

    /**
     * Create a new message instance.
     */
    public function __construct(VehicleRequest $vehicleRequest, $pdfContent = null)
    {
        $this->vehicleRequest = $vehicleRequest;
        $this->pdfContent = $pdfContent;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            from: new Address(
                config('mail.from.address'),
                config('mail.from.name')
            ),
            subject: 'Vehicle Request Approved - Request #' . $this->vehicleRequest->id,
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
                'request' => $this->vehicleRequest,
                'requesterName' => $this->vehicleRequest->user->name,
                'destination' => $this->vehicleRequest->destination,
                'dateOfTravel' => $this->vehicleRequest->date_of_travel->format('F d, Y'),
                'timeOfTravel' => $this->vehicleRequest->time_of_travel,
                'vehicle' => $this->vehicleRequest->vehicle ? $this->vehicleRequest->vehicle->description : 'N/A',
                'vehiclePlate' => $this->vehicleRequest->vehicle ? $this->vehicleRequest->vehicle->plate_number : 'N/A',
                'driverName' => $this->vehicleRequest->driver ? $this->vehicleRequest->driver->name : 'N/A',
                'approvedBy' => $this->vehicleRequest->approver ? $this->vehicleRequest->approver->name : 'Admin',
                'approvedAt' => $this->vehicleRequest->approved_at->format('F d, Y h:i A'),
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
        $attachments = [];

        // Attach PDF if provided
        if ($this->pdfContent) {
            $attachments[] = Attachment::fromData(fn () => $this->pdfContent, 'Request_' . $this->vehicleRequest->id . '_Approved.pdf')
                ->withMime('application/pdf');
        }

        return $attachments;
    }
}