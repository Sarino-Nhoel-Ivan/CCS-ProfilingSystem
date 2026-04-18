<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CurriculumSubject extends Model
{
    protected $fillable = ['year_level', 'semester', 'subject_id'];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
