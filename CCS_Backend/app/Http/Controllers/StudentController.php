<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\MedicalHistory;
use App\Models\Violation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

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
            'student_number'           => ['required', 'string', 'max:20', 'unique:students,student_number', 'regex:/^(22|23|24)\d{5}$/'],
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

        // Auto-create login account:
        // Login: student_number | Temp password: birthday in mm/dd/yyyy format
        $birthDate   = \Carbon\Carbon::parse($validatedData['birth_date']);
        $tempPassword = $birthDate->format('m/d/Y');

        \DB::table('users')->insert([
            'name'                 => $validatedData['student_number'],
            'email'                => $validatedData['email'],
            'password'             => Hash::make($tempPassword),
            'role'                 => 'student',
            'student_id'           => $student->id,
            'must_change_password' => true,
            'created_at'           => now(),
            'updated_at'           => now(),
        ]);

        // Send welcome email to student's gmail via Brevo HTTP API
        try {
            $fullName = trim($validatedData['first_name'] . ' ' . $validatedData['last_name']);
            $apiKey   = config('services.brevo.key', env('BREVO_API_KEY'));
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'api-key'      => $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.brevo.com/v3/smtp/email', [
                'sender'      => [
                    'name'  => config('mail.from.name'),
                    'email' => config('mail.from.address'),
                ],
                'to'          => [['email' => $validatedData['email'], 'name' => $fullName]],
                'subject'     => 'Your CCS Profiling System Account Has Been Created',
                'htmlContent' => $this->buildWelcomeEmail($fullName, $validatedData['student_number']),
            ]);
            if ($response->successful()) {
                \Log::info('Welcome email sent to: ' . $validatedData['email']);
            } else {
                \Log::error('Welcome email failed: ' . $response->body());
            }
        } catch (\Throwable $e) {
            \Log::error('Welcome email error: ' . $e->getMessage());
        }

        \App\Http\Controllers\NotificationController::push(
            'student_created',
            'New Student Registered',
            "{$validatedData['first_name']} {$validatedData['last_name']} ({$validatedData['student_number']}) has been registered.",
            ['student_id' => $student->id, 'student_number' => $validatedData['student_number']]
        );

        return response()->json($student, 201);
    }

    private function buildWelcomeEmail(string $name, string $studentNumber): string
    {
        $loginUrl = rtrim(env('FRONTEND_URL', 'https://ccs-profiling-system-iota.vercel.app'), '/') . '/student/login';
        return <<<HTML
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#f26522,#e04f0f);padding:32px 40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;font-weight:800;letter-spacing:-0.5px;">CCS Profiling System</h1>
      <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;font-size:13px;">Pamantasan ng Cabuyao — College of Computing Studies</p>
    </div>
    <div style="padding:36px 40px;">
      <p style="color:#1e293b;font-size:16px;font-weight:700;margin:0 0 8px;">Hello, {$name}!</p>
      <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">Your student account has been successfully created by the administration. You can now log in to the <strong>CCS Profile Hub</strong> using the credentials below.</p>

      <div style="background:#fff7f0;border:1.5px solid #fed7aa;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:0.05em;">Your Login Credentials</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b;width:140px;">Student Number</td>
            <td style="padding:6px 0;font-size:14px;font-weight:700;color:#1e293b;font-family:monospace;">{$studentNumber}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b;">Temporary Password</td>
            <td style="padding:6px 0;font-size:14px;color:#475569;">Your birthday in <strong>mm/dd/yyyy</strong> format</td>
          </tr>
        </table>
      </div>

      <div style="background:#fef3c7;border:1.5px solid #fcd34d;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">⚠️ <strong>Important:</strong> Use your birthday (mm/dd/yyyy) as your temporary password. You will be required to change it upon your first login.</p>
      </div>

      <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 24px;">If you have any concerns, please contact the CCS administration office.</p>

      <div style="text-align:center;margin:8px 0 8px;">
        <a href="{$loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#f26522,#e04f0f);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;box-shadow:0 4px 14px rgba(242,101,34,0.4);">Go to Student Login →</a>
      </div>
    </div>
    <div style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">© 2026 CCS Profiling System · Pamantasan ng Cabuyao</p>
    </div>
  </div>
</body>
</html>
HTML;
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
        \App\Http\Controllers\NotificationController::push(
            'student_updated',
            'Student Profile Updated',
            "{$student->first_name} {$student->last_name} ({$student->student_number})'s profile was updated.",
            ['student_id' => $student->id]
        );
        return response()->json($student->fresh());
    }

    public function destroy(Student $student)
    {
        $name   = "{$student->first_name} {$student->last_name}";
        $number = $student->student_number;
        $student->delete();
        \App\Http\Controllers\NotificationController::push(
            'student_deleted',
            'Student Record Deleted',
            "Student {$name} ({$number}) has been removed from the system.",
            ['student_number' => $number]
        );
        return response()->json(null, 204);
    }

    // ─── Medical Histories ────────────────────────────────────────────────────

    public function storeMedical(Request $request, Student $student)
    {
        $data = $request->validate([
            'bloodtype'                      => 'nullable|string|max:10',
            'existing_conditions'            => 'nullable|string',
            'emergency_contact_name'         => 'nullable|string|max:255',
            'emergency_contact_number'       => 'nullable|string|max:50',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'emergency_contact_address'      => 'nullable|string|max:255',
        ]);
        $record = $student->medicalHistories()->create($data);
        return response()->json($record, 201);
    }

    public function updateMedical(Request $request, Student $student, MedicalHistory $medical)
    {
        $data = $request->validate([
            'bloodtype'                      => 'nullable|string|max:10',
            'existing_conditions'            => 'nullable|string',
            'emergency_contact_name'         => 'nullable|string|max:255',
            'emergency_contact_number'       => 'nullable|string|max:50',
            'emergency_contact_relationship' => 'nullable|string|max:100',
            'emergency_contact_address'      => 'nullable|string|max:255',
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
        \App\Http\Controllers\NotificationController::push(
            'violation_added',
            'Violation Recorded',
            "A {$data['severity_level']} violation ({$data['violation_type']}) was recorded for {$student->first_name} {$student->last_name}.",
            ['student_id' => $student->id, 'violation_id' => $record->id, 'severity' => $data['severity_level']]
        );
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

        $cloudinaryUrl = config('cloudinary.cloud_url') ?? env('CLOUDINARY_URL');

        if (empty($cloudinaryUrl) || str_contains($cloudinaryUrl, 'your_')) {
            return response()->json(['message' => 'Cloudinary is not configured on the server.'], 500);
        }

        // Delete old Cloudinary photo if exists
        if ($student->profile_photo && str_starts_with($student->profile_photo, 'http')) {
            try {
                \Cloudinary\Configuration\Configuration::instance($cloudinaryUrl);
                $api = new \Cloudinary\Api\Admin\AdminApi();
                // Extract public_id: last segment before extension, under our folder
                $path     = parse_url($student->profile_photo, PHP_URL_PATH);
                $segments = explode('/', $path);
                $filename = pathinfo(end($segments), PATHINFO_FILENAME);
                $api->deleteAssets(['ccs_profile_photos/' . $filename]);
            } catch (\Throwable $e) {
                \Log::warning('Cloudinary delete failed: ' . $e->getMessage());
            }
        }

        // Upload to Cloudinary
        \Cloudinary\Configuration\Configuration::instance($cloudinaryUrl);
        $uploader = new \Cloudinary\Api\Upload\UploadApi();
        $result   = $uploader->upload($request->file('photo')->getRealPath(), [
            'folder'         => 'ccs_profile_photos',
            'transformation' => [['width' => 400, 'height' => 400, 'crop' => 'fill', 'gravity' => 'face']],
            'resource_type'  => 'image',
        ]);

        $photoUrl = $result['secure_url'];
        $student->update(['profile_photo' => $photoUrl]);

        return response()->json([
            'profile_photo' => $photoUrl,
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
