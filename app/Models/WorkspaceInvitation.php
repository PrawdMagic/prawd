<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class WorkspaceInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'invited_by',
        'email',
        'role',
        'member_type',
        'external_category',
        'notes',
        'token',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    // Relationships
    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    // Helper methods
    public static function generateToken()
    {
        return Str::random(64);
    }

    public function isExpired()
    {
        return $this->expires_at < now();
    }

    public function markAsExpired()
    {
        $this->update(['status' => 'expired']);
    }

    public function accept($user)
    {
        if ($this->isExpired()) {
            throw new \Exception('Invitation has expired');
        }

        // Add user to workspace
        $this->workspace->members()->attach($user->id, [
            'role' => $this->role,
            'member_type' => $this->member_type,
            'external_category' => $this->external_category,
            'notes' => $this->notes,
        ]);

        // Mark invitation as accepted
        $this->update(['status' => 'accepted']);

        return true;
    }
}