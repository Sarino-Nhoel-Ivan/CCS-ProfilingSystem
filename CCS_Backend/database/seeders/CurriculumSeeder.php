<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CurriculumSeeder extends Seeder
{
    public function run(): void
    {
        // Only seed if the curriculum hasn't been seeded yet
        // Check for a known curriculum subject code rather than just count > 0
        if (DB::table('subjects')->where('subject_code', 'CCS101')->exists()) {
            $this->command->info('Curriculum already seeded — skipping.');
            return;
        }

        $subjects = [

            // ══════════════════════════════════════════════════════════════
            // BSIT — Bachelor of Science in Information Technology (2018)
            // ══════════════════════════════════════════════════════════════

            // 1st Year · 1st Semester
            ['subject_code'=>'CCS101','descriptive_title'=>'Introduction to Computing',          'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'1st Year','semester'=>'1st Semester'],
            ['subject_code'=>'CCS102','descriptive_title'=>'Computer Programming 1',              'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'1st Year','semester'=>'1st Semester'],
            ['subject_code'=>'ETH101','descriptive_title'=>'Ethics',                              'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'1st Year','semester'=>'1st Semester'],
            ['subject_code'=>'MAT101','descriptive_title'=>'Mathematics in the Modern World',     'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'1st Year','semester'=>'1st Semester'],
            ['subject_code'=>'NSTP1', 'descriptive_title'=>'National Service Training Program 1', 'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'1st Year','semester'=>'1st Semester'],
            ['subject_code'=>'PED101','descriptive_title'=>'Physical Education 1',                'lec_units'=>2,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'1st Year','semester'=>'1st Semester'],
            ['subject_code'=>'PSY100','descriptive_title'=>'Understanding the Self',              'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'1st Year','semester'=>'1st Semester'],

            // 1st Year · 2nd Semester
            ['subject_code'=>'CCS103','descriptive_title'=>'Computer Programming 2',              'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS102',                                               'program'=>'BSIT','year_level'=>'1st Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CCS104','descriptive_title'=>'Discrete Structures 1',               'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'MAT101',                                               'program'=>'BSIT','year_level'=>'1st Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CCS105','descriptive_title'=>'Human Computer Interaction 1',        'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS101',                                               'program'=>'BSIT','year_level'=>'1st Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CCS106','descriptive_title'=>'Social and Professional Issues',      'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ETH101',                                               'program'=>'BSIT','year_level'=>'1st Year','semester'=>'2nd Semester'],
            ['subject_code'=>'COM101','descriptive_title'=>'Purposive Communication',             'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'1st Year','semester'=>'2nd Semester'],
            ['subject_code'=>'GAD101','descriptive_title'=>'Gender and Development',              'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'1st Year','semester'=>'2nd Semester'],
            ['subject_code'=>'NSTP2', 'descriptive_title'=>'National Service Training Program 2', 'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'NSTP1',                                                'program'=>'BSIT','year_level'=>'1st Year','semester'=>'2nd Semester'],
            ['subject_code'=>'PED102','descriptive_title'=>'Physical Education 2',                'lec_units'=>2,'lab_units'=>0,'pre_requisites'=>'PED101',                                               'program'=>'BSIT','year_level'=>'1st Year','semester'=>'2nd Semester'],

            // 2nd Year · 1st Semester
            ['subject_code'=>'ACT101','descriptive_title'=>'Principles of Accounting',            'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'1st Semester'],
            ['subject_code'=>'CCS107','descriptive_title'=>'Data Structures and Algorithms 1',    'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS103',                                               'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'1st Semester'],
            ['subject_code'=>'CCS108','descriptive_title'=>'Object-Oriented Programming',         'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS103',                                               'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'1st Semester'],
            ['subject_code'=>'CCS109','descriptive_title'=>'System Analysis and Design',          'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS101',                                               'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'1st Semester'],
            ['subject_code'=>'ITEW1', 'descriptive_title'=>'Electronic Commerce',                 'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'1st Semester'],
            ['subject_code'=>'PED103','descriptive_title'=>'Physical Education 3',                'lec_units'=>2,'lab_units'=>0,'pre_requisites'=>'PED102',                                               'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'1st Semester'],
            ['subject_code'=>'STS101','descriptive_title'=>'Science, Technology and Society',     'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'1st Semester'],

            // 2nd Year · 2nd Semester
            ['subject_code'=>'CCS110','descriptive_title'=>'Information Management 1',            'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS101',                                               'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CCS111','descriptive_title'=>'Networking and Communication 1',      'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS103, CCS104, CCS105, CCS106',                       'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'ENT101','descriptive_title'=>'The Entrepreneurial Mind',            'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'ITEW2', 'descriptive_title'=>'Client Side Scripting',               'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ITEW1',                                                'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'ITP101','descriptive_title'=>'Quantitative Methods',                'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS104',                                               'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'ITP102','descriptive_title'=>'Integrative Programming and Technologies','lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS109',                                           'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'PED104','descriptive_title'=>'Physical Education 4',                'lec_units'=>2,'lab_units'=>0,'pre_requisites'=>'PED103',                                               'program'=>'BSIT','year_level'=>'2nd Year','semester'=>'2nd Semester'],

            // 3rd Year · 1st Semester
            ['subject_code'=>'HIS101','descriptive_title'=>'Readings in Philippine History',      'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'1st Semester'],
            ['subject_code'=>'ITEW3', 'descriptive_title'=>'Server Side Scripting',               'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ITEW2',                                                'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'1st Semester'],
            ['subject_code'=>'ITP103','descriptive_title'=>'System Integration and Architecture', 'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ITP102',                                               'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'1st Semester'],
            ['subject_code'=>'ITP104','descriptive_title'=>'Information Management 2',            'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS110',                                               'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'1st Semester'],
            ['subject_code'=>'ITP105','descriptive_title'=>'Networking and Communication 2',      'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS111',                                               'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'1st Semester'],
            ['subject_code'=>'ITP106','descriptive_title'=>'Human Computer Interaction 2',        'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS105',                                               'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'1st Semester'],
            ['subject_code'=>'SOC101','descriptive_title'=>'The Contemporary World',              'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'1st Semester'],
            ['subject_code'=>'TEC101','descriptive_title'=>'Technopreneurship',                   'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ENT101',                                               'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'1st Semester'],

            // 3rd Year · 2nd Semester
            ['subject_code'=>'CCS112','descriptive_title'=>'Applications Development and Emerging Technologies','lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS103',                                 'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CCS113','descriptive_title'=>'Information Assurance and Security',  'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'3rd Year Standing',                                    'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'HMN101','descriptive_title'=>'Art Appreciation',                    'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'ITEW4', 'descriptive_title'=>'Responsive Web Design',               'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ITEW3',                                                'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'ITP107','descriptive_title'=>'Mobile Application Development',      'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS108',                                               'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'ITP108','descriptive_title'=>'Capstone Project 1',                  'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ITP104, CCS108, ITP103, ITP105, ITP106, ITEW3',        'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'ITP109','descriptive_title'=>'Platform Technologies',               'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ITP106',                                               'program'=>'BSIT','year_level'=>'3rd Year','semester'=>'2nd Semester'],

            // 4th Year · 1st Semester
            ['subject_code'=>'ENV101','descriptive_title'=>'Environmental Science',               'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'4th Year','semester'=>'1st Semester'],
            ['subject_code'=>'ITEW5', 'descriptive_title'=>'Web Security and Optimization',       'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ITEW4',                                                'program'=>'BSIT','year_level'=>'4th Year','semester'=>'1st Semester'],
            ['subject_code'=>'ITP110','descriptive_title'=>'Web Technologies',                    'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ITP106',                                               'program'=>'BSIT','year_level'=>'4th Year','semester'=>'1st Semester'],
            ['subject_code'=>'ITP111','descriptive_title'=>'System Administration and Maintenance','lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ITP105, ITP109',                                      'program'=>'BSIT','year_level'=>'4th Year','semester'=>'1st Semester'],
            ['subject_code'=>'ITP112','descriptive_title'=>'Capstone Project 2',                  'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ITP108',                                               'program'=>'BSIT','year_level'=>'4th Year','semester'=>'1st Semester'],
            ['subject_code'=>'RIZ101','descriptive_title'=>'Life and Works of Rizal',             'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>null,                                                    'program'=>'BSIT','year_level'=>'4th Year','semester'=>'1st Semester'],

            // 4th Year · 2nd Semester
            ['subject_code'=>'ITEW6', 'descriptive_title'=>'Web Development Frameworks',          'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ITEW5',                                                'program'=>'BSIT','year_level'=>'4th Year','semester'=>'2nd Semester'],
            ['subject_code'=>'ITP113','descriptive_title'=>'IT Practicum (500 hours)',             'lec_units'=>9,'lab_units'=>0,'pre_requisites'=>'ITP108',                                               'program'=>'BSIT','year_level'=>'4th Year','semester'=>'2nd Semester'],

            // ══════════════════════════════════════════════════════════════
            // BSCS — Bachelor of Science in Computer Science (2018)
            // ══════════════════════════════════════════════════════════════

            // 1st Year · 1st Semester  (shared codes reused — same subjects)
            // CCS101, CCS102, ETH101, MAT101, NSTP1, PED101, PSY100 already inserted above
            // We skip duplicates; CS shares these with IT.

            // 1st Year · 2nd Semester
            // CCS103, CCS104, COM101, GAD101, NSTP2, PED102 shared
            ['subject_code'=>'CCS106_CS','descriptive_title'=>'Social and Professional Issues',   'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'ETH101',                                               'program'=>'BSCS','year_level'=>'1st Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CSP101',   'descriptive_title'=>'Analytic Geometry',                'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'MAT101',                                               'program'=>'BSCS','year_level'=>'1st Year','semester'=>'2nd Semester'],

            // 2nd Year · 1st Semester
            // CCS107, CCS108, HIS101, PED103, STS101 shared
            ['subject_code'=>'CSEG1',    'descriptive_title'=>'Game Concepts and Productions',    'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'2nd Year Standing',                                    'program'=>'BSCS','year_level'=>'2nd Year','semester'=>'1st Semester'],
            ['subject_code'=>'CSP102',   'descriptive_title'=>'Discrete Structures 2',            'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS104',                                               'program'=>'BSCS','year_level'=>'2nd Year','semester'=>'1st Semester'],

            // 2nd Year · 2nd Semester
            // ACT101, HMN101, PED104 shared
            ['subject_code'=>'CCS110_CS','descriptive_title'=>'Information Management 1',         'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS101',                                               'program'=>'BSCS','year_level'=>'2nd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CSEG2',    'descriptive_title'=>'Game Programming 1',               'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSEG1',                                               'program'=>'BSCS','year_level'=>'2nd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CSP103',   'descriptive_title'=>'Data Structures and Algorithms 2', 'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS107',                                               'program'=>'BSCS','year_level'=>'2nd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CSP104',   'descriptive_title'=>'Calculus',                         'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSP101, CSP102',                                       'program'=>'BSCS','year_level'=>'2nd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CSP105',   'descriptive_title'=>'Algorithms and Complexity',        'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS107, CCS108',                                       'program'=>'BSCS','year_level'=>'2nd Year','semester'=>'2nd Semester'],

            // 3rd Year · 1st Semester
            // ENT101 shared
            ['subject_code'=>'CCS109_CS','descriptive_title'=>'System Analysis and Design',       'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS101',                                               'program'=>'BSCS','year_level'=>'3rd Year','semester'=>'1st Semester'],
            ['subject_code'=>'CCS112_CS','descriptive_title'=>'Applications Development and Emerging Technologies','lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS103',                              'program'=>'BSCS','year_level'=>'3rd Year','semester'=>'1st Semester'],
            ['subject_code'=>'CCS113_CS','descriptive_title'=>'Information Assurance Security',   'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'PED104, HMN101, ACT101, CCS110, CSP103, CSP104, CSP105, CSEG2','program'=>'BSCS','year_level'=>'3rd Year','semester'=>'1st Semester'],
            ['subject_code'=>'CSEG3',    'descriptive_title'=>'Game Programming 2',               'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSEG2',                                               'program'=>'BSCS','year_level'=>'3rd Year','semester'=>'1st Semester'],
            ['subject_code'=>'CSP106',   'descriptive_title'=>'Automata Theory and Formal Languages','lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSP105',                                            'program'=>'BSCS','year_level'=>'3rd Year','semester'=>'1st Semester'],
            ['subject_code'=>'CSP107',   'descriptive_title'=>'Computer Organization and Assembly Language Programming','lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSP103',                         'program'=>'BSCS','year_level'=>'3rd Year','semester'=>'1st Semester'],

            // 3rd Year · 2nd Semester
            // RIZ101, SOC101, TEC101 shared
            ['subject_code'=>'CSEG4',    'descriptive_title'=>'Game Programming 3 (Pure Labs)',   'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSEG3',                                               'program'=>'BSCS','year_level'=>'3rd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CSP108',   'descriptive_title'=>'Programming Languages',            'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS103',                                               'program'=>'BSCS','year_level'=>'3rd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CSP109',   'descriptive_title'=>'Software Engineering 1',           'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CCS109',                                               'program'=>'BSCS','year_level'=>'3rd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CSP110',   'descriptive_title'=>'Numerical Analysis',               'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSP106, CSEG3',                                       'program'=>'BSCS','year_level'=>'3rd Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CSP111',   'descriptive_title'=>'Thesis 1',                         'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSP106, CSP107',                                       'program'=>'BSCS','year_level'=>'3rd Year','semester'=>'2nd Semester'],

            // 4th Year · 1st Semester
            // CCS105, ENV101 shared
            ['subject_code'=>'CSEG5',    'descriptive_title'=>'Artificial Intelligence for Games','lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSEG4',                                               'program'=>'BSCS','year_level'=>'4th Year','semester'=>'1st Semester'],
            ['subject_code'=>'CSP112',   'descriptive_title'=>'Operating Systems',                'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSP107',                                               'program'=>'BSCS','year_level'=>'4th Year','semester'=>'1st Semester'],
            ['subject_code'=>'CSP113',   'descriptive_title'=>'Software Engineering 2',           'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSP109',                                               'program'=>'BSCS','year_level'=>'4th Year','semester'=>'1st Semester'],
            ['subject_code'=>'CSP114',   'descriptive_title'=>'Thesis 2',                         'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSP111',                                               'program'=>'BSCS','year_level'=>'4th Year','semester'=>'1st Semester'],

            // 4th Year · 2nd Semester
            ['subject_code'=>'CCS111_CS','descriptive_title'=>'Networking and Communication 1',   'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSP112',                                               'program'=>'BSCS','year_level'=>'4th Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CSEG6',    'descriptive_title'=>'Advance Game Design',              'lec_units'=>3,'lab_units'=>0,'pre_requisites'=>'CSEG5',                                               'program'=>'BSCS','year_level'=>'4th Year','semester'=>'2nd Semester'],
            ['subject_code'=>'CSP115',   'descriptive_title'=>'CS Practicum (300 hours)',          'lec_units'=>4,'lab_units'=>0,'pre_requisites'=>'CSP111',                                               'program'=>'BSCS','year_level'=>'4th Year','semester'=>'2nd Semester'],
        ];

        $now = now();
        foreach ($subjects as &$s) {
            $s['total_units'] = $s['lec_units'] + $s['lab_units'];
            $s['created_at']  = $now;
            $s['updated_at']  = $now;
        }
        unset($s);

        DB::table('subjects')->insert($subjects);
        $this->command->info('Curriculum seeded: ' . count($subjects) . ' subjects inserted.');
    }
}
