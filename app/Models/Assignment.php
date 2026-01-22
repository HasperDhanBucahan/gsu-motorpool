<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    protected $fillable = [
        'request_id',
        'vehicle_id',
        'driver_id',
        'assigned_start',
        'assigned_end',
        'decline_reason',
        'declined_at',
        'declined_by',
        // Removed 'status' since it's not in your database table
    ];

    protected $casts = [
        'assigned_start' => 'datetime',
        'assigned_end' => 'datetime',
        'declined_at' => 'datetime',
    ];

    public function request()
    {
        return $this->belongsTo(\App\Models\Request::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function decliner()
    {
        return $this->belongsTo(\App\Models\User::class, 'declined_by');
    }
}