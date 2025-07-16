<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Models\Workspace;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id',
        'avatar',
        'avatar_local',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = ['avatar_url'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function getAvatarUrlAttribute()
    {
        if ($this->avatar_local && file_exists(storage_path('app/public/' . $this->avatar_local))) {
            return asset('storage/' . $this->avatar_local);
        }
        return $this->avatar;
    }

    public function downloadAvatar($googleAvatarUrl)
    {
        try {
            $response = file_get_contents($googleAvatarUrl);
            if ($response) {
                $filename = 'avatars/' . $this->id . '.jpg';
                $path = storage_path('app/public/' . $filename);
                
                if (!file_exists(dirname($path))) {
                    mkdir(dirname($path), 0755, true);
                }
                
                file_put_contents($path, $response);
                $this->update(['avatar_local' => $filename]);
            }
        } catch (\Exception $e) {
            // Ignore
        }
    }

    /**
     * Workspaces that the user owns
     */
    public function ownedWorkspaces(): HasMany
    {
        return $this->hasMany(Workspace::class, 'owner_id');
    }

    /**
     * Workspaces that the user is a member of
     */
    public function workspaces(): BelongsToMany
    {
        return $this->belongsToMany(Workspace::class, 'workspace_members')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    /**
     * Tasks created by the user
     */
    public function createdTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'created_by');
    }

    /**
     * Get user's current active workspace (first workspace they're member of)
     */
    public function getCurrentWorkspace(): ?Workspace
    {
        return $this->workspaces()->first();
    }

    /**
     * Check if user is member of a specific workspace
     */
    public function isMemberOf(Workspace $workspace): bool
    {
        return $this->workspaces()->where('workspaces.id', $workspace->id)->exists();
    }

    /**
     * Get user's role in a specific workspace
     */
    public function getRoleInWorkspace(Workspace $workspace): ?string
    {
        $membership = $this->workspaces()->where('workspaces.id', $workspace->id)->first();
        return $membership ? $membership->pivot->role : null;
    }

    public function getWorkspaceRole(Workspace $workspace)
    {
        $membership = $this->workspaces()->where('workspaces.id', $workspace->id)->first();
        if (!$membership) return null;
        
        return [
            'role' => $membership->pivot->role,
            'member_type' => $membership->pivot->member_type,
            'external_category' => $membership->pivot->external_category,
            'notes' => $membership->pivot->notes
        ];
    }

    public function canManageWorkspace($workspaceId) 
    {
        $role = $this->getRoleInWorkspace($workspaceId);
        return in_array($role, ['owner', 'admin']);
    }

    public function canEditTasks($workspaceId) 
    {
        $role = $this->getRoleInWorkspace($workspaceId);
        return in_array($role, ['owner', 'admin', 'member']);
    }

    public function canViewOnly($workspaceId) 
    {
        $role = $this->getRoleInWorkspace($workspaceId);
        return $role === 'guest';
    }

}