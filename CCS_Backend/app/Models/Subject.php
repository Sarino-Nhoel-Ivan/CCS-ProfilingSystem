<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    /** @use HasFactory<\Database\Factories\SubjectFactory> */
    use HasFactory;

    protected $fillable = [
        'subject_code',
        'descriptive_title',
        'lab_units',
        'lec_units',
        'total_units',
        'pre_requisites',
        'program',
        'year_level',
        'semester',
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
}
