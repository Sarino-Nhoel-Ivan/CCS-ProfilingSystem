<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use Illuminate\Http\Request;
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
        return response()->json($faculty, 201);
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
        return response()->json($faculty->fresh()->load('department'));
    }

    public function destroy(Faculty $faculty)
    {
        if ($faculty->profile_photo) {
            Storage::disk('public')->delete($faculty->profile_photo);
        }
        $faculty->delete();
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
