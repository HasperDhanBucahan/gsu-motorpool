<?php

namespace App\Mail;

use App\Models\Request;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RequestStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public $request;
    public $status;

    public function __construct(Request $request, $status)
    {
        $this->request = $request;
        $this->status = $status;
    }

    public function build()
    {
        return $this->markdown('emails.requests.status-updated')
                    ->subject("Vehicle Request {$this->status}");
    }
}