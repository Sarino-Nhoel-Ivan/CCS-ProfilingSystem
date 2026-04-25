<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function user()
    {
        return $this->hasOne(\App\Models\User::class, 'student_id');
    }

    protected $casts = [
        'birth_date' => 'date',
        'date_enrolled' => 'date',
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function guardians()
    {
        return $this->hasMany(Guardian::class);
    }

    public function medicalHistories()
    {
        return $this->hasMany(MedicalHistory::class);
    }

    public function academicHistories()
    {
        return $this->hasMany(AcademicHistory::class);
    }

    public function affiliations()
    {
        return $this->hasMany(Affiliation::class);
    }

    public function violations()
    {
        return $this->hasMany(Violation::class);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'student_skill')
            ->withPivot('skill_level', 'certification', 'certification_name', 'certification_date')
            ->withTimestamps();
    }

    public function events()
    {
        return $this->belongsToMany(Event::class, 'event_student')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function enrollments()
    {
        return $this->hasMany(StudentEnrollment::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
