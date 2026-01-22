<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    const STATUS_AVAILABLE = 'available';
    const STATUS_IN_USE = 'in_use';
    const STATUS_IN_REPAIR = 'in_repair';
    const STATUS_MAINTENANCE = 'maintenance';

    protected $fillable = [
        'plate_number', 'model', 'fuel_type', 'description', 'status', 'image'
    ];

    public function requests()
    {
        return $this->hasMany(\App\Models\Request::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    // Check if vehicle is available for specific time period
    public function isAvailableForPeriod($startDateTime, $endDateTime, $excludeRequestId = null)
    {
        if ($this->status !== self::STATUS_AVAILABLE) {
            return false;
        }

        $conflictingAssignments = $this->assignments()
            ->whereHas('request', function($query) use ($excludeRequestId) {
                $query->whereIn('status', [Request::STATUS_ASSIGNED, Request::STATUS_APPROVED]);
                if ($excludeRequestId) {
                    $query->where('id', '!=', $excludeRequestId);
                }
            })
            ->where(function($query) use ($startDateTime, $endDateTime) {
                // Check for overlapping time ranges
                // Two ranges overlap if: start1 < end2 AND start2 < end1
                $query->where(function($q) use ($startDateTime, $endDateTime) {
                    $q->where('assigned_start', '<', $endDateTime)
                      ->where('assigned_end', '>', $startDateTime);
                });
            })
            ->exists();

        return !$conflictingAssignments;
    }

    public function fuelConsumptions()
    {
        return $this->hasMany(FuelConsumption::class);
    }
}