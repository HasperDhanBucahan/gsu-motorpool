<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    // Status Constants
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';

    // Role Constants
    const ROLE_CLIENT = 'client';
    const ROLE_APPROVAL_ADMIN = 'approval_admin';
    const ROLE_ASSIGNMENT_ADMIN = 'assignment_admin';
    const ROLE_TICKET_ADMIN = 'ticket_admin';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'department',
        'position',
        'email',
        'password',
        'role',
        'status',
        'approved_by',
        'approved_at',
        'signature_path',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'approved_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Check if user has a specific role
     */
    public function hasRole($role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if user is approved
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if user is pending
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Scope: Get only approved users
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope: Get only pending users
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope: Get users by role
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Get the admin who approved this user
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get all vehicle requests made by this user
     */
    public function vehicleRequests()
    {
        return $this->hasMany(\App\Models\Request::class);
    }

    /**
     * Get full role name for display
     */
    public function getRoleNameAttribute(): string
    {
        return match($this->role) {
            self::ROLE_CLIENT => 'Client',
            self::ROLE_APPROVAL_ADMIN => 'Approval Admin',
            self::ROLE_ASSIGNMENT_ADMIN => 'Assignment Admin',
            self::ROLE_TICKET_ADMIN => 'Ticket Admin',
            default => 'Unknown',
        };
    }
}