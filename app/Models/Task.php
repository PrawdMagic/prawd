<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'content_target',
        'title', 
        'description',
        'status',
        'priority',
        'tags',
        'assignee_id',
        'assignee_name',
        'due_date',
        'follow_up_date',
        'publish_date',
        'content_type',
        'platforms',
        'channel',
        'parent_project',
        'project_category',
        'contact',
        'sales_activity',
        'deal_stage',
        'deal_value',
        'deal_currency',
        'notes',
        'collaborators',
        'attachments',
        'workspace_id',        // NEW
        'created_by',     // NEW
        'client_id',
    ];

    protected $appends = [
        'assignee',
        'dueDate', 
        'followUpDate',
        'publishDate',
        'contentType',
        'contentTarget',
        'parentProject',
        'projectCategory', 
        'salesActivity',
        'dealStage',
        'dealValue',
        'dealCurrency',
        'createdAt',
        'updatedAt'
    ];

    protected $casts = [
        'tags' => 'array',
        'platforms' => 'array',
        'due_date' => 'datetime',
        'follow_up_date' => 'datetime',
        'publish_date' => 'datetime',
    ];

    // Simple accessors for React compatibility
    public function getAssigneeAttribute()
    {
        return [
            'id' => $this->assignee_id ?? 'unknown',
            'name' => $this->assignee_name ?? 'Unknown User',
        ];
    }

    public function getDueDateAttribute($value)
    {
        return $this->attributes['due_date'] ?? null;
    }

    public function getFollowUpDateAttribute($value)
    {
        return $this->attributes['follow_up_date'] ?? null;
    }

    public function getPublishDateAttribute($value)
    {
        return $this->attributes['publish_date'] ?? null;
    }

    public function getContentTypeAttribute($value)
    {
        return $this->attributes['content_type'] ?? null;
    }

    public function getParentProjectAttribute($value)
    {
        return $this->attributes['parent_project'] ?? null;
    }

    public function getProjectCategoryAttribute($value)
    {
        return $this->attributes['project_category'] ?? null;
    }

    public function getSalesActivityAttribute($value)
    {
        return $this->attributes['sales_activity'] ?? null;
    }

    public function getDealStageAttribute($value)
    {
        return $this->attributes['deal_stage'] ?? null;
    }

    public function getDealValueAttribute($value)
    {
        return $this->attributes['deal_value'] ?? null;
    }

    public function getCreatedAtAttribute($value)
    {
        return $this->attributes['created_at'] ?? null;
    }

    public function getUpdatedAtAttribute($value)
    {
        return $this->attributes['updated_at'] ?? null;
    }

    // Scope untuk active tasks
    public function scopeActive($query)
    {
        return $query->whereNotIn('status', ['published', 'done', 'completed', 'selesai', 'closed']);
    }

    // Scope untuk filter by category
    public function scopeByCategory($query, $category)
    {
        if ($category && $category !== 'all') {
            return $query->where('category', $category);
        }
        return $query;
    }

    // Scope untuk filter by status
    public function scopeByStatus($query, $status)
    {
        if ($status && $status !== 'all') {
            if ($status === 'active') {
                return $query->active();
            } elseif ($status === 'not-started') {
                return $query->whereIn('status', ['draft', 'todo', 'lead', 'idea']);
            } elseif ($status === 'in-progress') {
                return $query->whereIn('status', ['in-progress', 'dikerjakan', 'ongoing', 'qualified', 'review']);
            } elseif ($status === 'scheduled') {
                return $query->whereIn('status', ['scheduled', 'planned', 'confirmed', 'proposal']);
            } elseif ($status === 'completed') {
                return $query->whereIn('status', ['published', 'done', 'completed', 'selesai', 'closed']);
            } else {
                return $query->where('status', $status);
            }
        }
        return $query;
    }

    // Scope untuk filter by priority
    public function scopeByPriority($query, $priority)
    {
        if ($priority && $priority !== 'all') {
            return $query->where('priority', $priority);
        }
        return $query;
    }

    // Scope untuk filter by channel
    public function scopeByChannel($query, $channel)
    {
        if ($channel && $channel !== 'all') {
            return $query->where('channel', $channel);
        }
        return $query;
    }

    // Scope untuk search
    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('assignee_name', 'like', "%{$search}%")
                  ->orWhere('tags', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getDealCurrencyAttribute()
    {
        // Cek database value dulu
        if (isset($this->attributes['deal_currency'])) {
            return $this->attributes['deal_currency'];
        }
        
        // Fallback: deteksi dari dealValue
        if (isset($this->attributes['deal_value'])) {
            $dealValue = $this->attributes['deal_value'];
            if (str_contains($dealValue, 'S$')) {
                return 'SGD';
            }
            if (str_contains($dealValue, '$')) {
                return 'USD';
            }
            if (str_contains($dealValue, 'Rp')) {
                return 'IDR';
            }
        }
        
        return 'IDR'; // Default
    }

    public function getContentTargetAttribute($value)
    {
        return $this->attributes['content_target'] ?? 'in-house';
    }

    public function client()
    {
        return $this->belongsTo(Client::class);
    }
    
}