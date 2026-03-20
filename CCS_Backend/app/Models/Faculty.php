<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;
    protected $guarded = [];

    protected $casts = [
        'hire_date'              => 'date',
        'educational_attainment' => 'array',
        'expertise_areas'        => 'array',
        'work_experience'        => 'array',
        'achievements'           => 'array',
        'publications'           => 'array',
        'social_links'           => 'array',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
