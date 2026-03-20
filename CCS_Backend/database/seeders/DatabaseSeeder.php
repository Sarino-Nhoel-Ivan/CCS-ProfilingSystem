<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Department;
use App\Models\Course;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin account ──────────────────────────────────────────
        // NOTE: User model has 'password' => 'hashed' cast, so we pass plain text.
        // The cast will hash it automatically. Do NOT use Hash::make() here.
        $admin = User::where('email', 'admin@ccs.pnc.edu.com')->first();
        if ($admin) {
            // Use DB update to bypass the cast and set the hash directly
            \DB::table('users')->where('email', 'admin@ccs.pnc.edu.com')->update([
                'name'     => 'CCS Admin',
                'password' => Hash::make('Admin@2026!'),
                'role'     => 'admin',
            ]);
        } else {
            // On create, bypass the model cast too
            \DB::table('users')->insert([
                'name'       => 'CCS Admin',
                'email'      => 'admin@ccs.pnc.edu.com',
                'password'   => Hash::make('Admin@2026!'),
                'role'       => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // ── CCS Department ─────────────────────────────────────────
        $ccs = Department::firstOrCreate(
            ['department_name' => 'College of Computer Studies'],
            [
                'office_location' => 'Building A, Room 101',
                'contact_number'  => '09000000000',
            ]
        );

        // ── Real IT & CS courses ───────────────────────────────────
        $courses = [
            // Information Technology
            ['course_code' => 'IT101',  'course_name' => 'Introduction to Computing',              'total_units' => 3],
            ['course_code' => 'IT102',  'course_name' => 'Computer Programming 1',                 'total_units' => 3],
            ['course_code' => 'IT103',  'course_name' => 'Computer Programming 2',                 'total_units' => 3],
            ['course_code' => 'IT201',  'course_name' => 'Data Structures and Algorithms',         'total_units' => 3],
            ['course_code' => 'IT202',  'course_name' => 'Web Development',                        'total_units' => 3],
            ['course_code' => 'IT203',  'course_name' => 'Database Management Systems',            'total_units' => 3],
            ['course_code' => 'IT301',  'course_name' => 'Systems Analysis and Design',            'total_units' => 3],
            ['course_code' => 'IT302',  'course_name' => 'Network Administration',                 'total_units' => 3],
            ['course_code' => 'IT303',  'course_name' => 'Information Assurance and Security',     'total_units' => 3],
            ['course_code' => 'IT401',  'course_name' => 'Capstone Project 1',                     'total_units' => 3],
            ['course_code' => 'IT402',  'course_name' => 'Capstone Project 2',                     'total_units' => 3],
            // Computer Science
            ['course_code' => 'CS101',  'course_name' => 'Introduction to Computer Science',       'total_units' => 3],
            ['course_code' => 'CS102',  'course_name' => 'Discrete Mathematics',                   'total_units' => 3],
            ['course_code' => 'CS201',  'course_name' => 'Object-Oriented Programming',            'total_units' => 3],
            ['course_code' => 'CS202',  'course_name' => 'Design and Analysis of Algorithms',      'total_units' => 3],
            ['course_code' => 'CS203',  'course_name' => 'Operating Systems',                      'total_units' => 3],
            ['course_code' => 'CS301',  'course_name' => 'Software Engineering',                   'total_units' => 3],
            ['course_code' => 'CS302',  'course_name' => 'Artificial Intelligence',                'total_units' => 3],
            ['course_code' => 'CS303',  'course_name' => 'Machine Learning',                       'total_units' => 3],
            ['course_code' => 'CS401',  'course_name' => 'Thesis Writing 1',                       'total_units' => 3],
            ['course_code' => 'CS402',  'course_name' => 'Thesis Writing 2',                       'total_units' => 3],
        ];

        foreach ($courses as $course) {
            Course::firstOrCreate(
                ['course_code' => $course['course_code']],
                array_merge($course, ['department_id' => $ccs->id])
            );
        }
    }
}
