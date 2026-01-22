
@component('mail::message')
# Vehicle Request {{ ucfirst($status) }}

Dear {{ $request->user->name }},

Your vehicle request for {{ $request->destination }} has been {{ $status }}.

@if($status === 'approved')
**Vehicle Details:**
- Make/Model: {{ $request->vehicle->make }} {{ $request->vehicle->description }}
- Driver: {{ $request->driver->name }}
@endif

@if($request->decline_reason)
**Reason for declining:**
{{ $request->decline_reason }}
@endif

@component('mail::button', ['url' => route('dashboard')])
View Details
@endcomponent

Thanks,<br>
{{ config('app.name') }}
@endcomponent