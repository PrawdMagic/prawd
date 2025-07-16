<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'user_id',
        'action',
        'description',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    protected $appends = ['user_name', 'user_avatar', 'formatted_time'];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Accessors
    public function getUserNameAttribute()
    {
        return $this->user->name ?? 'System';
    }

    public function getUserAvatarAttribute()
    {
        return $this->user->avatar_url ?? null;
    }

    public function getFormattedTimeAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    // Helper method to log activity
    public static function logActivity($taskId, $userId, $action, $description, $metadata = null)
    {
        return self::create([
            'task_id' => $taskId,
            'user_id' => $userId,
            'action' => $action,
            'description' => $description,
            'metadata' => $metadata,
        ]);
    }
}