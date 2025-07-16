<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title', 
        'message',
        'task_id',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    protected $appends = ['formatted_time', 'is_read'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    // Accessors
    public function getFormattedTimeAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    public function getIsReadAttribute()
    {
        return !is_null($this->read_at);
    }

    // Helper method
    public static function createNotification($userId, $type, $title, $message, $taskId = null)
    {
        return self::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'task_id' => $taskId,
        ]);
    }
}