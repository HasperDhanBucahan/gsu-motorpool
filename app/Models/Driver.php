<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = ['name', 'contact_number', 'description', 'available'];

    protected $casts = [
        'available' => 'boolean',
    ];

    public function requests()
    {
        return $this->hasMany(\App\Models\Request::class);
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class);
    }

    // Check if driver is available for specific time period
    public function isAvailableForPeriod($startDateTime, $endDateTime, $excludeRequestId = null)
    {
        if (!$this->available) {
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
}
