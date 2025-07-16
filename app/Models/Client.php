<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'created_by', 
        'customer_type',
        'name',
        'phone_number',
        'email',
        'address',
        'platform',
        'industry', 
        'joined_date',
        'status',
        'contract_type',
        'client_stage',
    ];

    protected $casts = [
        'joined_date' => 'date',
    ];

    protected $appends = ['joinedDate', 'customerType', 'phoneNumber', 'contractType', 'clientStage'];

    // Relationships
    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Accessors untuk React compatibility
    public function getJoinedDateAttribute($value)
    {
        return $this->attributes['joined_date'] ?? null;
    }

    public function getCustomerTypeAttribute($value)
    {
        return $this->attributes['customer_type'] ?? null;
    }

    public function getPhoneNumberAttribute($value)
    {
        return $this->attributes['phone_number'] ?? null;
    }

    public function getContractTypeAttribute($value)
    {
        return $this->attributes['contract_type'] ?? null;
    }

    // Scopes
    public function scopeByWorkspace($query, $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByType($query, $type)
    {
        if ($type && $type !== 'all') {
            return $query->where('customer_type', $type);
        }
        return $query;
    }

    public function getClientStageAttribute($value)
    {
        return $this->attributes['client_stage'] ?? 'prospect';
    }
}