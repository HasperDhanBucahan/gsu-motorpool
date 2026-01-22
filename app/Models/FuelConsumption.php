<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FuelConsumption extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'year',
        'month',
        'liters',
    ];

    protected $casts = [
        'year' => 'integer',
        'month' => 'integer',
        'liters' => 'decimal:2',
    ];

    /**
     * Get the vehicle that owns the fuel consumption record
     */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get the month name
     */
    public function getMonthNameAttribute(): string
    {
        $months = [
            1 => 'January', 2 => 'February', 3 => 'March', 4 => 'April',
            5 => 'May', 6 => 'June', 7 => 'July', 8 => 'August',
            9 => 'September', 10 => 'October', 11 => 'November', 12 => 'December'
        ];

        return $months[$this->month] ?? 'Unknown';
    }
}