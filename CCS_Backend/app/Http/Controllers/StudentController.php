<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\MedicalHistory;
use App\Models\Violation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StudentController extends Controller
{
    public function index()
    {
        $students = Student::with(['course.department', 'guardians', 'medicalHistories', 'academicHistories', 'affiliations', 'violations', 'skills', 'events'])->get();
        return response()->json($students);
    }

    public function create() {}

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'student_number'           => 'required|string|max:20|unique:students,student_number|regex:/^(22|23|24)\d{5}$/',
            'first_name'               => 'required|string|max:255',
            'middle_name'              => 'nullable|string|max:255',
            'last_name'                => 'required|string|max:255',
            'suffix'                   => 'nullable|string|max:50',
            'gender'                   => 'required|string|max:50',
            'birth_date'               => 'required|date',
            'place_of_birth'           => 'required|string|max:255',
            'nationality'              => 'required|string|max:100',
            'civil_status'             => 'required|string|max:50',
            'religion'                 => 'nullable|string|max:100',
            'email'                    => 'required|email|unique:students,email|max:255',
            'contact_number'           => 'required|string|max:50',
            'alternate_contact_number' => 'nullable|string|max:50',
            'street'                   => 'nullable|string|max:255',
            'barangay'                 => 'nullable|string|max:255',
            'city'                     => 'required|string|max:255',
            'province'                 => 'nullable|string|max:255',
            'zip_code'                 => 'nullable|string|max:20',
            'year_level'               => 'required|string|max:50',
            'section'                  => 'nullable|string|max:50',
            'student_type'             => 'required|string|max:50',
            'enrollment_status'        => 'required|string|max:50',
            'date_enrolled'            => 'required|date',
            'program'                  => 'nullable|string|max:255',
            'course_id'                => 'nullable|exists:courses,id',
            'department_id'            => 'nullable|exists:departments,id',
            'lrn'                      => 'nullable|string|max:12',
            'last_school_attended'     => 'nullable|string|max:255',
            'last_year_attended'       => 'nullable|string|max:20',
            'honors_received'          => 'nullable|string',
        ]);
        $student = Student::create($validatedData);
        return response()->json($student, 201);
    }

    public function show($id)
    {
        $student = Student::with(['course.department', 'guardians', 'medicalHistories', 'academicHistories', 'affiliations', 'violations', 'skills', 'events'])->findOrFail($id);
        return response()->json($student);
    }

    public function edit(Student $student) {}

    public function update(Request $request, Student $student)
    {
        $validatedData = $request->validate([
            'student_number'           => ['sometimes', 'required', 'string', 'max:20', 'regex:/^(22|23|24)\d{5}$/', 'unique:students,student_number,' . $student->id],
            'first_name'               => 'sometimes|required|string|max:255',
            'middle_name'              => 'nullable|string|max:255',
            'last_name'                => 'sometimes|required|string|max:255',
            'suffix'                   => 'nullable|string|max:50',
            'gender'                   => 'sometimes|required|string|max:50',
            'birth_date'               => 'sometimes|required|date',
            'place_of_birth'           => 'sometimes|required|string|max:255',
            'nationality'              => 'nullable|string|max:100',
            'civil_status'             => 'nullable|string|max:50',
            'religion'                 => 'nullable|string|max:100',
            'email'                    => 'sometimes|required|email|max:255|unique:students,email,' . $student->id,
            'contact_number'           => 'sometimes|required|string|max:50',
            'alternate_contact_number' => 'nullable|string|max:50',
            'street'                   => 'nullable|string|max:255',
            'barangay'                 => 'nullable|string|max:255',
            'city'                     => 'sometimes|required|string|max:255',
            'province'                 => 'nullable|string|max:255',
            'zip_code'                 => 'nullable|string|max:20',
            'year_level'               => 'sometimes|required|string|max:50',
            'section'                  => 'nullable|string|max:50',
            'student_type'             => 'sometimes|required|string|max:50',
            'enrollment_status'        => 'sometimes|required|string|max:50',
            'date_enrolled'            => 'sometimes|required|date',
            'program'                  => 'nullable|string|max:255',
            'course_id'                => 'nullable|exists:courses,id',
            'department_id'            => 'nullable|exists:departments,id',
            'lrn'                      => 'nullable|string|max:12',
            'last_school_attended'     => 'nullable|string|max:255',
            'last_year_attended'       => 'nullable|string|max:20',
            'honors_received'          => 'nullable|string',
        ]);
        $student->update($validatedData);
        return response()->json($student->fresh());
    }

    public function destroy(Student $student)
    {
        $student->delete();
        return response()->json(null, 204);
    }

    // ─── Medical Histories ────────────────────────────────────────────────────

    public function storeMedical(Request $request, Student $student)
    {
        $data = $request->validate([
            'bloodtype'                => 'nullable|string|max:10',
            'existing_conditions'      => 'nullable|string',
            'emergency_contact_name'   => 'nullable|string|max:255',
            'emergency_contact_number' => 'nullable|string|max:50',
        ]);
        $record = $student->medicalHistories()->create($data);
        return response()->json($record, 201);
    }

    public function updateMedical(Request $request, Student $student, MedicalHistory $medical)
    {
        $data = $request->validate([
            'bloodtype'                => 'nullable|string|max:10',
            'existing_conditions'      => 'nullable|string',
            'emergency_contact_name'   => 'nullable|string|max:255',
            'emergency_contact_number' => 'nullable|string|max:50',
        ]);
        $medical->update($data);
        return response()->json($medical);
    }

    public function destroyMedical(Student $student, MedicalHistory $medical)
    {
        $medical->delete();
        return response()->json(null, 204);
    }

    // ─── Violations ──────────────────────────────────────────────────────────

    public function storeViolation(Request $request, Student $student)
    {
        $data = $request->validate([
            'violation_type'  => 'required|string|max:255',
            'description'     => 'nullable|string',
            'date_reported'   => 'required|date',
            'reported_by'     => 'nullable|string|max:255',
            'severity_level'  => 'required|in:Low,Medium,High',
            'action_taken'    => 'nullable|string',
            'status'          => 'required|in:Pending,Resolved,Under Review',
            'resolution_date' => 'nullable|date',
        ]);
        $record = $student->violations()->create($data);
        return response()->json($record, 201);
    }

    public function updateViolation(Request $request, Student $student, Violation $violation)
    {
        $data = $request->validate([
            'violation_type'  => 'required|string|max:255',
            'description'     => 'nullable|string',
            'date_reported'   => 'required|date',
            'reported_by'     => 'nullable|string|max:255',
            'severity_level'  => 'required|in:Low,Medium,High',
            'action_taken'    => 'nullable|string',
            'status'          => 'required|in:Pending,Resolved,Under Review',
            'resolution_date' => 'nullable|date',
        ]);
        $violation->update($data);
        return response()->json($violation);
    }

    public function destroyViolation(Student $student, Violation $violation)
    {
        $violation->delete();
        return response()->json(null, 204);
    }

    // ─── Skills (sync pivot) ─────────────────────────────────────────────────

    public function syncSkills(Request $request, Student $student)
    {
        $request->validate([
            'skills'                      => 'array',
            'skills.*.skill_id'           => 'required|exists:skills,id',
            'skills.*.skill_level'        => 'nullable|string|max:50',
            'skills.*.certification'      => 'nullable|boolean',
            'skills.*.certification_name' => 'nullable|string|max:255',
            'skills.*.certification_date' => 'nullable|date',
        ]);

        $syncData = [];
        foreach ($request->skills as $skill) {
            $syncData[$skill['skill_id']] = [
                'skill_level'        => $skill['skill_level'] ?? null,
                'certification'      => $skill['certification'] ?? false,
                'certification_name' => $skill['certification_name'] ?? null,
                'certification_date' => $skill['certification_date'] ?? null,
            ];
        }
        $student->skills()->sync($syncData);
        return response()->json(['message' => 'Skills updated successfully']);
    }

    // ─── Export ──────────────────────────────────────────────────────────────

    public function export()
    {
        $students = Student::with(['course.department'])->get();
        $headers  = [
            'Content-type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename=students.csv',
            'Pragma'              => 'no-cache',
            'Cache-Control'       => 'must-revalidate, post-check=0, pre-check=0',
            'Expires'             => '0',
        ];
        $columns = ['ID', 'First Name', 'Middle Name', 'Last Name', 'Course', 'Department', 'Year Level', 'Enrollment Status', 'Email', 'Contact Number'];
        $callback = function () use ($students, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($students as $student) {
                fputcsv($file, [
                    $student->id,
                    $student->first_name,
                    $student->middle_name,
                    $student->last_name,
                    $student->course ? $student->course->course_code : 'N/A',
                    ($student->course && $student->course->department) ? $student->course->department->department_name : 'N/A',
                    $student->year_level,
                    $student->enrollment_status,
                    $student->email,
                    $student->contact_number,
                ]);
            }
            fclose($file);
        };
        return response()->stream($callback, 200, $headers);
    }

    // ─── Profile Photo ───────────────────────────────────────────

    public function uploadPhoto(Request $request, Student $student)
    {
        $request->validate([
            'photo' => [
                'required',
                'file',
                'max:10240',
                function ($attribute, $value, $fail) {
                    // Validate by reading magic bytes — no re-encoding
                    $finfo = finfo_open(FILEINFO_MIME_TYPE);
                    $mime  = finfo_file($finfo, $value->getRealPath());
                    finfo_close($finfo);
                    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
                    if (!in_array($mime, $allowed)) {
                        $fail('The photo must be a JPEG, PNG, WebP, or GIF image.');
                    }
                },
            ],
        ]);

        // Delete old photo if exists
        if ($student->profile_photo) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($student->profile_photo);
        }

        // Store the raw file bytes without any processing
        $file      = $request->file('photo');
        $ext       = strtolower($file->getClientOriginalExtension()) ?: 'jpg';
        $filename  = \Illuminate\Support\Str::random(40) . '.' . $ext;
        $file->storeAs('profile_photos', $filename, 'public');

        $student->update(['profile_photo' => 'profile_photos/' . $filename]);

        return response()->json([
            'profile_photo' => 'profile_photos/' . $filename,
            'updated_at'    => $student->fresh()->updated_at,
        ]);
    }

    // ─── Advanced Search ─────────────────────────────────────────────────────

    public function advancedSearch(Request $request)
    {
        $query = Student::with(['course.department', 'guardians', 'medicalHistories', 'academicHistories', 'affiliations', 'violations', 'skills', 'events']);

        if ($request->has('searchQuery') && !empty($request->searchQuery)) {
            $sq = $request->searchQuery;
            $query->where(function (\Illuminate\Database\Eloquent\Builder $q) use ($sq) {
                $q->where('first_name', 'like', "%{$sq}%")
                  ->orWhere('last_name', 'like', "%{$sq}%")
                  ->orWhere('email', 'like', "%{$sq}%");
            });
        }

        if ($request->has('skills') && is_array($request->skills) && count($request->skills) > 0) {
            foreach ($request->skills as $skillId) {
                $query->whereHas('skills', fn($q) => $q->where('skills.id', $skillId));
            }
        }

        if ($request->has('affiliations') && is_array($request->affiliations) && count($request->affiliations) > 0) {
            foreach ($request->affiliations as $name) {
                $query->whereHas('affiliations', fn($q) => $q->where('organization_name', $name));
            }
        }

        if ($request->has('events') && is_array($request->events) && count($request->events) > 0) {
            $query->whereHas('events', fn($q) => $q->whereIn('events.id', $request->events));
        }

        if ($request->has('violations')) {
            $hasViolations = filter_var($request->violations, FILTER_VALIDATE_BOOLEAN);
            $hasViolations ? $query->whereHas('violations') : $query->doesntHave('violations');
        }

        return response()->json($query->get());
    }
}
