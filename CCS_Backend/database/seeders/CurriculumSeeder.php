<?php

namespace Database\Seeders;

use App\Models\CurriculumSubject;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class CurriculumSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure the 4th year subjects exist
        $subjects = [
            [
                'subject_code'      => 'ITPRAC',
                'descriptive_title' => 'IT Practicum (400 hours)',
                'lab_units'         => 0,
                'lec_units'         => 6,
                'total_units'       => 6,
                'pre_requisites'    => null,
            ],
            [
                'subject_code'      => 'ITEW6',
                'descriptive_title' => 'Integrative Programming and Technologies 2 (ITEW6)',
                'lab_units'         => 1,
                'lec_units'         => 2,
                'total_units'       => 3,
                'pre_requisites'    => 'ITEW5',
            ],
        ];

        foreach ($subjects as $s) {
            Subject::firstOrCreate(['subject_code' => $s['subject_code']], $s);
        }

        // Map them to 4th Year curriculum
        $fourthYearSubjects = Subject::whereIn('subject_code', ['ITPRAC', 'ITEW6'])->get();

        foreach ($fourthYearSubjects as $subject) {
            CurriculumSubject::firstOrCreate([
                'year_level' => '4th Year',
                'semester'   => '1st',
                'subject_id' => $subject->id,
            ]);
        }
    }
}
