<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskComment extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'user_id', 
        'comment',
    ];

    protected $appends = ['user_name', 'user_avatar'];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Accessors for frontend
    public function getUserNameAttribute()
    {
        return $this->user->name ?? 'Unknown User';
    }

    public function getUserAvatarAttribute()
    {
        return $this->user->avatar_url ?? null;
    }
}