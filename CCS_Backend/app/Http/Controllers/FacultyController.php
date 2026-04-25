<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class FacultyController extends Controller
{
    public function index()
    {
        return response()->json(Faculty::with('department')->get());
    }

    public function create() {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name'        => 'required|string|max:255',
            'middle_name'       => 'nullable|string|max:255',
            'last_name'         => 'required|string|max:255',
            'suffix'            => 'nullable|string|max:50',
            'gender'            => 'nullable|string|max:50',
            'date_of_birth'     => 'nullable|date',
            'position'          => 'required|string|max:255',
            'employment_status' => 'required|string|max:255',
            'hire_date'         => 'required|date',
            'email'             => ['required','email','unique:faculties,email','max:255'],
            'contact_number'    => 'nullable|string|max:255',
            'office_location'   => 'nullable|string|max:255',
            'office_hours'      => 'nullable|string|max:255',
            'department_id'     => 'required|exists:departments,id',
        ]);

        $faculty = Faculty::create($validated);
        $faculty->load('department');

        // Default password = date_of_birth in MM/DD/YYYY format if provided,
        // otherwise fall back to hire_date.
        if (!empty($validated['date_of_birth'])) {
            $tempPassword = \Carbon\Carbon::parse($validated['date_of_birth'])->format('m/d/Y');
            $passwordNote = 'date of birth';
        } else {
            $tempPassword = \Carbon\Carbon::parse($validated['hire_date'])->format('m/d/Y');
            $passwordNote = 'hire date';
        }

        DB::table('users')->insertOrIgnore([
            'name'                 => trim($validated['first_name'] . ' ' . $validated['last_name']),
            'email'                => strtolower(trim($validated['email'])),
            'password'             => Hash::make($tempPassword),
            'role'                 => 'faculty',
            'faculty_id'           => $faculty->id,
            'must_change_password' => true,
            'created_at'           => now(),
            'updated_at'           => now(),
        ]);

        // Send welcome email notification
        try {
            $fullName = trim($validated['first_name'] . ' ' . $validated['last_name']);
            $apiKey   = config('services.brevo.key', env('BREVO_API_KEY'));
            Http::withHeaders([
                'api-key'      => $apiKey,
                'Content-Type' => 'application/json',
            ])->post('https://api.brevo.com/v3/smtp/email', [
                'sender' => [
                    'name'  => config('mail.from.name'),
                    'email' => config('mail.from.address'),
                ],
                'to'      => [['email' => $validated['email'], 'name' => $fullName]],
                'subject' => 'Your CCS Profiling System Faculty Account Has Been Created',
                'htmlContent' => $this->buildWelcomeEmail($fullName, $validated['email'], $tempPassword, $passwordNote),
            ]);
        } catch (\Throwable $e) {
            \Log::error('Faculty welcome email error: ' . $e->getMessage());
        }

        \App\Http\Controllers\NotificationController::push(
            'faculty_created',
            'New Faculty Registered',
            "{$validated['first_name']} {$validated['last_name']} has been added as faculty ({$validated['position']}).",
            ['faculty_id' => $faculty->id]
        );

        return response()->json($faculty, 201);
    }

    private function buildWelcomeEmail(string $name, string $email, string $tempPassword, string $passwordNote = 'hire date'): string
    {
        $loginUrl = rtrim(env('FRONTEND_URL', 'https://ccs-profiling-system-iota.vercel.app'), '/') . '/faculty/login';
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
      <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">Your faculty account has been successfully created by the administration. You can now log in to the <strong>CCS Profile Hub</strong> using the credentials below.</p>

      <div style="background:#fff7f0;border:1.5px solid #fed7aa;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#c2410c;text-transform:uppercase;letter-spacing:0.05em;">Your Login Credentials</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b;width:160px;">Email Address</td>
            <td style="padding:6px 0;font-size:14px;font-weight:700;color:#1e293b;font-family:monospace;">{$email}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;font-size:13px;color:#64748b;">Temporary Password</td>
            <td style="padding:6px 0;font-size:14px;font-weight:700;color:#1e293b;font-family:monospace;">{$tempPassword}</td>
          </tr>
        </table>
      </div>

      <div style="background:#fef3c7;border:1.5px solid #fcd34d;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">⚠️ <strong>Important:</strong> Your temporary password is your <strong>{$passwordNote}</strong> in <strong>mm/dd/yyyy</strong> format. You will be required to change it upon your first login.</p>
      </div>

      <p style="color:#475569;font-size:13px;line-height:1.6;margin:0 0 24px;">If you have any concerns, please contact the CCS administration office.</p>

      <div style="text-align:center;margin:8px 0 8px;">
        <a href="{$loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#f26522,#e04f0f);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;box-shadow:0 4px 14px rgba(242,101,34,0.4);">Go to Faculty Login →</a>
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

    public function show(Faculty $faculty)
    {
        return response()->json($faculty->load('department'));
    }

    public function edit(Faculty $faculty) {}

    public function update(Request $request, Faculty $faculty)
    {
        $validated = $request->validate([
            // Basic Information
            'employee_id'            => 'nullable|string|max:100',
            'first_name'             => 'sometimes|required|string|max:255',
            'middle_name'            => 'nullable|string|max:255',
            'last_name'              => 'sometimes|required|string|max:255',
            'suffix'                 => 'nullable|string|max:50',
            'gender'                 => 'nullable|string|max:50',
            'date_of_birth'          => 'nullable|date',
            'civil_status'           => 'nullable|string|max:50',
            'nationality'            => 'nullable|string|max:100',
            // Contact Information
            'email'                  => 'sometimes|required|email|max:255|unique:faculties,email,'.$faculty->id,
            'personal_email'         => 'nullable|email|max:255',
            'contact_number'         => 'nullable|string|max:50',
            'telephone_number'       => 'nullable|string|max:50',
            'home_address'           => 'nullable|string',
            'office_address'         => 'nullable|string',
            'office_location'        => 'nullable|string|max:255',
            'office_hours'           => 'nullable|string|max:255',
            // Professional Information
            'position'               => 'nullable|string|max:255',
            'academic_rank'          => 'nullable|string|max:255',
            'area_of_specialization' => 'nullable|string|max:255',
            'employment_status'      => 'nullable|string|max:255',
            'hire_date'              => 'nullable|date',
            'years_of_service'       => 'nullable|integer|min:0',
            'courses_handled'        => 'nullable|array',
            'department_id'          => 'nullable|exists:departments,id',
            // Educational Background
            'educational_attainment' => 'nullable|array',
            'bachelors_degree'       => 'nullable|array',
            'masters_degree'         => 'nullable|array',
            'doctorate_degree'       => 'nullable|array',
            'certifications'         => 'nullable|array',
            // Professional background
            'expertise_areas'        => 'nullable|array',
            'work_experience'        => 'nullable|array',
            'research_interests'     => 'nullable|string',
            // Additional
            'biography'              => 'nullable|string',
            'achievements'           => 'nullable|array',
            'publications'           => 'nullable|array',
            'social_links'           => 'nullable|array',
        ]);

        $faculty->update($validated);
        \App\Http\Controllers\NotificationController::push(
            'faculty_updated',
            'Faculty Profile Updated',
            "{$faculty->first_name} {$faculty->last_name}'s profile was updated.",
            ['faculty_id' => $faculty->id]
        );
        return response()->json($faculty->fresh()->load('department'));
    }

    public function destroy(Faculty $faculty)
    {
        if ($faculty->profile_photo) {
            Storage::disk('public')->delete($faculty->profile_photo);
        }
        $name = "{$faculty->first_name} {$faculty->last_name}";
        $faculty->delete();
        \App\Http\Controllers\NotificationController::push(
            'faculty_deleted',
            'Faculty Record Deleted',
            "Faculty member {$name} has been removed from the system.",
            []
        );
        return response()->json(['message' => 'Faculty deleted successfully.']);
    }

    /**
     * Upload profile photo.
     */
    public function uploadPhoto(Request $request, Faculty $faculty)
    {
        $request->validate(['photo' => 'required|image|max:10240']);

        $cloudinaryUrl = config('cloudinary.cloud_url') ?? env('CLOUDINARY_URL');

        if (empty($cloudinaryUrl) || str_contains($cloudinaryUrl, 'your_')) {
            return response()->json(['message' => 'Cloudinary is not configured on the server.'], 500);
        }

        // Delete old photo if exists
        if ($faculty->profile_photo && str_starts_with($faculty->profile_photo, 'http')) {
            try {
                \Cloudinary\Configuration\Configuration::instance($cloudinaryUrl);
                $api      = new \Cloudinary\Api\Admin\AdminApi();
                $path     = parse_url($faculty->profile_photo, PHP_URL_PATH);
                $segments = explode('/', $path);
                $filename = pathinfo(end($segments), PATHINFO_FILENAME);
                $api->deleteAssets(['ccs_profile_photos/' . $filename]);
            } catch (\Throwable $e) {
                \Log::warning('Cloudinary delete failed: ' . $e->getMessage());
            }
        }

        \Cloudinary\Configuration\Configuration::instance($cloudinaryUrl);
        $uploader = new \Cloudinary\Api\Upload\UploadApi();
        $result   = $uploader->upload($request->file('photo')->getRealPath(), [
            'folder'         => 'ccs_profile_photos',
            'transformation' => [['width' => 400, 'height' => 400, 'crop' => 'fill', 'gravity' => 'face']],
            'resource_type'  => 'image',
        ]);

        $photoUrl = $result['secure_url'];
        $faculty->update(['profile_photo' => $photoUrl]);

        return response()->json(['profile_photo' => $photoUrl, 'faculty' => $faculty->load('department')]);
    }

    public function export()
    {
        $faculties = Faculty::with('department')->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=faculties.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0",
        ];

        $columns = ['ID','First Name','Middle Name','Last Name','Suffix','Position','Department',
                    'Employment Status','Hire Date','Email','Contact Number','Office Location','Office Hours'];

        $callback = function () use ($faculties, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            foreach ($faculties as $f) {
                fputcsv($file, [
                    $f->id, $f->first_name, $f->middle_name, $f->last_name, $f->suffix,
                    $f->position, $f->department?->department_name ?? 'N/A',
                    $f->employment_status, $f->hire_date, $f->email,
                    $f->contact_number, $f->office_location, $f->office_hours,
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
