<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WorkspaceMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'workspace_id',
        'user_id',
        'role',
        'member_type',        // TAMBAH INI
        'external_category',  // TAMBAH INI
        'notes',             // TAMBAH INI
    ];

    const ROLE_OWNER = 'owner';
    const ROLE_ADMIN = 'admin'; 
    const ROLE_MEMBER = 'member';
    const ROLE_GUEST = 'guest';

    const VALID_ROLES = [
        self::ROLE_OWNER,
        self::ROLE_ADMIN,
        self::ROLE_MEMBER,
        self::ROLE_GUEST,
    ];

    public static function getValidRolesString()
    {
        return implode(',', self::VALID_ROLES);
    }

    // Tambahkan constants untuk member types:
    const MEMBER_TYPE_INTERNAL = 'internal';
    const MEMBER_TYPE_EXTERNAL = 'external';

    const EXTERNAL_CATEGORIES = [
        'freelance' => 'Freelance',
        'outsourced' => 'Outsourced Staff', 
        'vendor' => 'Vendor'
    ];

    // Tambahkan accessor methods:
    public function isInternal()
    {
        return $this->member_type === self::MEMBER_TYPE_INTERNAL;
    }

    public function isExternal()
    {
        return $this->member_type === self::MEMBER_TYPE_EXTERNAL;
    }

    public function getExternalCategoryLabelAttribute()
    {
        return self::EXTERNAL_CATEGORIES[$this->external_category] ?? null;
    }

    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}