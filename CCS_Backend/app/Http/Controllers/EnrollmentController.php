<?php

namespace App\Http\Controllers;

use App\Models\CurriculumSubject;
use App\Models\Student;
use App\Models\StudentEnrollment;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    // ── GET /curriculum-subjects ──────────────────────────────────────────────
    // List all curriculum subject definitions (admin manages these)
    public function curriculumIndex()
    {
        return response()->json(
            CurriculumSubject::with('subject')->orderBy('year_level')->orderBy('semester')->get()
        );
    }

    // ── POST /curriculum-subjects ─────────────────────────────────────────────
    // Admin adds a subject to a year level + semester in the curriculum
    public function curriculumStore(Request $request)
    {
        $data = $request->validate([
            'year_level' => 'required|string',
            'semester'   => 'required|string',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $entry = CurriculumSubject::firstOrCreate(
            ['year_level' => $data['year_level'], 'semester' => $data['semester'], 'subject_id' => $data['subject_id']]
        );

        return response()->json($entry->load('subject'), 201);
    }

    // ── DELETE /curriculum-subjects/{id} ──────────────────────────────────────
    public function curriculumDestroy($id)
    {
        CurriculumSubject::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    // ── POST /students/{student}/enroll ───────────────────────────────────────
    // Enroll a student: auto-assigns all curriculum subjects for their year level
    public function enroll(Request $request, Student $student)
    {
        $data = $request->validate([
            'semester'    => 'required|string',
            'school_year' => 'required|string',
        ]);

        $curriculumSubjects = CurriculumSubject::where('year_level', $student->year_level)
            ->where('semester', $data['semester'])
            ->get();

        if ($curriculumSubjects->isEmpty()) {
            return response()->json([
                'message' => "No curriculum subjects found for {$student->year_level}, {$data['semester']} semester."
            ], 422);
        }

        $created = [];
        foreach ($curriculumSubjects as $cs) {
            $enrollment = StudentEnrollment::firstOrCreate(
                [
                    'student_id'  => $student->id,
                    'subject_id'  => $cs->subject_id,
                    'semester'    => $data['semester'],
                    'school_year' => $data['school_year'],
                ],
                [
                    'year_level' => $student->year_level,
                    'faculty_id' => null,
                    'status'     => 'enrolled',
                ]
            );
            $created[] = $enrollment;
        }

        return response()->json([
            'message'     => "Student enrolled with " . count($created) . " subject(s).",
            'enrollments' => StudentEnrollment::where('student_id', $student->id)
                ->where('semester', $data['semester'])
                ->where('school_year', $data['school_year'])
                ->with('subject', 'faculty')
                ->get(),
        ], 201);
    }

    // ── GET /students/{student}/enrollments ───────────────────────────────────
    // Student/Admin views a student's enrolled subjects
    public function studentEnrollments(Request $request, Student $student)
    {
        $query = StudentEnrollment::where('student_id', $student->id)
            ->with('subject', 'faculty');

        if ($request->has('semester'))    $query->where('semester', $request->semester);
        if ($request->has('school_year')) $query->where('school_year', $request->school_year);

        return response()->json($query->get());
    }

    // ── PUT /enrollments/{enrollment}/assign-faculty ──────────────────────────
    // Admin assigns a faculty to a specific enrollment (student + subject)
    public function assignFaculty(Request $request, StudentEnrollment $enrollment)
    {
        $data = $request->validate([
            'faculty_id' => 'required|exists:faculties,id',
        ]);

        $enrollment->update(['faculty_id' => $data['faculty_id']]);

        return response()->json($enrollment->load('subject', 'faculty', 'student'));
    }

    // ── PUT /enrollments/{enrollment} ─────────────────────────────────────────
    // Update enrollment status (enrolled → dropped / completed)
    public function updateEnrollment(Request $request, StudentEnrollment $enrollment)
    {
        $data = $request->validate([
            'status'     => 'sometimes|in:enrolled,dropped,completed',
            'faculty_id' => 'nullable|exists:faculties,id',
        ]);

        $enrollment->update($data);
        return response()->json($enrollment->load('subject', 'faculty'));
    }

    // ── GET /enrollments?semester=&school_year= ───────────────────────────────
    // Admin sees all enrollments (optionally filtered)
    public function allEnrollments(Request $request)
    {
        $query = StudentEnrollment::with('student', 'subject', 'faculty');

        if ($request->has('semester'))    $query->where('semester', $request->semester);
        if ($request->has('school_year')) $query->where('school_year', $request->school_year);
        if ($request->has('year_level'))  $query->where('year_level', $request->year_level);
        if ($request->has('faculty_id'))  $query->where('faculty_id', $request->faculty_id);

        return response()->json($query->get());
    }
}
