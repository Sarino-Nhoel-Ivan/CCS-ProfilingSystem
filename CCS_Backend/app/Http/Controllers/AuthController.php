<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Faculty;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // The one fixed admin email — only this address can hold the admin role
    const ADMIN_EMAIL = 'admin@ccs.pnc.edu.com';

    /**
     * Register a new faculty or student account.
     * Admin accounts are seeded only — registration is blocked for admin role.
     */
    public function register(Request $request)
    {
        $role = $request->input('role');

        if ($role === 'admin') {
            return response()->json(['message' => 'Admin accounts cannot be registered through this endpoint.'], 403);
        }

        if ($role === 'faculty') {
            return $this->registerFaculty($request);
        }

        if ($role === 'student') {
            return $this->registerStudent($request);
        }

        return response()->json(['message' => 'Invalid role. Must be faculty or student.'], 422);
    }

    /**
     * Faculty registration.
     * Any valid personal email — OTP sent there, same email used for login.
     */
    private function registerFaculty(Request $request)
    {
        $validated = $request->validate([
            'first_name'        => 'required|string|max:100',
            'middle_name'       => 'nullable|string|max:100',
            'last_name'         => 'required|string|max:100',
            'email'             => 'required|string|email|max:255|unique:users,email|unique:faculties,email',
            'password'          => 'required|string|min:8|confirmed',
            'position'          => 'nullable|string|max:100',
            'employment_status' => 'nullable|in:Regular,Part-time,Contractual',
            'hire_date'         => 'nullable|date|before_or_equal:today',
            'contact_number'    => 'nullable|string|max:20|regex:/^[0-9+\-\s()]+$/',
            'office_location'   => 'nullable|string|max:100',
            'department_id'     => 'nullable|exists:departments,id',
        ]);

        // Require OTP verification on the faculty email
        $email = strtolower(trim($validated['email']));
        if (!Cache::get("otp_verified:{$email}")) {
            return response()->json([
                'message' => 'Email address has not been verified. Please complete OTP verification first.',
            ], 422);
        }
        Cache::forget("otp_verified:{$email}");

        $faculty = Faculty::create([
            'first_name'        => $validated['first_name'],
            'middle_name'       => $validated['middle_name']       ?? null,
            'last_name'         => $validated['last_name'],
            'email'             => $email,
            'position'          => $validated['position']          ?? null,
            'employment_status' => $validated['employment_status'] ?? null,
            'hire_date'         => $validated['hire_date']         ?? null,
            'contact_number'    => $validated['contact_number']    ?? null,
            'office_location'   => $validated['office_location']   ?? null,
            'department_id'     => $validated['department_id']     ?? null,
        ]);

        \DB::table('users')->insert([
            'name'       => trim($validated['first_name'] . ' ' . $validated['last_name']),
            'email'      => $email,
            'password'   => Hash::make($validated['password']),
            'role'       => 'faculty',
            'faculty_id' => $faculty->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $user = User::where('email', $email)->first();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'role'       => $user->role,
                'faculty_id' => $user->faculty_id,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Student registration.
     * Login identifier is student_number (must start with 22, 23, or 24).
     * OTP is sent to their personal email (not used for login).
     */
    private function registerStudent(Request $request)
    {
        $validated = $request->validate([
            'student_number'       => [
                'required',
                'string',
                'max:20',
                'unique:students,student_number',
                'regex:/^(22|23|24)\d{5}$/',
            ],
            'email'                => 'required|string|email|max:255|unique:students,email|unique:users,email',
            'password'             => 'required|string|min:8|confirmed',
            'first_name'           => 'required|string|max:100',
            'last_name'            => 'required|string|max:100',
            'middle_name'          => 'nullable|string|max:100',
            'suffix'               => 'nullable|string|max:20',
            'gender'               => 'required|in:Male,Female',
            'civil_status'         => 'nullable|string|max:50',
            'nationality'          => 'nullable|string|max:100',
            'religion'             => 'nullable|string|max:100',
            'birth_date'           => 'nullable|date|before:today',
            'place_of_birth'       => 'nullable|string|max:200',
            'contact_number'       => 'required|string|max:20|regex:/^[0-9+\-\s()]+$/',
            'street'               => 'nullable|string|max:255',
            'barangay'             => 'nullable|string|max:100',
            'city'                 => 'nullable|string|max:100',
            'province'             => 'nullable|string|max:100',
            'zip_code'             => 'nullable|string|max:10|regex:/^\d+$/',
            'program'              => 'nullable|in:Information Technology,Computer Science',
            'year_level'           => 'nullable|in:1st Year,2nd Year,3rd Year,4th Year',
            'student_type'         => 'nullable|in:Regular,Irregular,Returnee,Shiftee,Transferee',
            'enrollment_status'    => 'nullable|in:Enrolled,Not Enrolled',
            'date_enrolled'        => 'nullable|date|before_or_equal:today',
            'course_id'            => 'nullable|exists:courses,id',
            'department_id'        => 'nullable|exists:departments,id',
            'lrn'                  => 'nullable|string|max:12|regex:/^\d{0,12}$/',
            'last_school_attended' => 'nullable|string|max:200',
            'last_year_attended'   => 'nullable|string|max:10',
            'father_name'          => 'nullable|string|max:200',
            'father_occupation'    => 'nullable|string|max:200',
            'mother_name'          => 'nullable|string|max:200',
            'mother_occupation'    => 'nullable|string|max:200',
            'guardian_contact'     => 'nullable|string|max:20|regex:/^[0-9+\-\s()]+$/',
        ], [
            'student_number.regex'   => 'Student number must start with 22, 23, or 24 followed by 5 digits (e.g. 2201535).',
            'student_number.unique'  => 'This student number is already registered.',
            'contact_number.regex'   => 'Contact number may only contain digits, spaces, +, -, and parentheses.',
            'guardian_contact.regex' => 'Guardian contact may only contain digits, spaces, +, -, and parentheses.',
            'zip_code.regex'         => 'Zip code must contain digits only.',
            'lrn.regex'              => 'LRN must contain digits only.',
        ]);

        // Require OTP verification on the student's personal email
        $email = strtolower(trim($validated['email']));
        if (!Cache::get("otp_verified:{$email}")) {
            return response()->json([
                'message' => 'Email address has not been verified. Please complete OTP verification first.',
            ], 422);
        }
        Cache::forget("otp_verified:{$email}");

        // Resolve department from the selected course
        $courseId = $validated['course_id'] ?? null;
        $course   = $courseId ? \App\Models\Course::find($courseId) : null;

        $student = Student::create([
            'student_number'       => $validated['student_number'],
            'first_name'           => $validated['first_name'],
            'middle_name'          => $validated['middle_name']          ?? null,
            'last_name'            => $validated['last_name'],
            'suffix'               => $validated['suffix']               ?? null,
            'email'                => $email,
            'gender'               => $validated['gender'],
            'birth_date'           => $validated['birth_date']           ?? null,
            'place_of_birth'       => $validated['place_of_birth']       ?? null,
            'nationality'          => $validated['nationality']          ?? null,
            'civil_status'         => $validated['civil_status']         ?? null,
            'religion'             => $validated['religion']             ?? null,
            'contact_number'       => $validated['contact_number'],
            'street'               => $validated['street']               ?? null,
            'barangay'             => $validated['barangay']             ?? null,
            'city'                 => $validated['city']                 ?? null,
            'province'             => $validated['province']             ?? null,
            'zip_code'             => $validated['zip_code']             ?? null,
            'program'              => $validated['program']              ?? null,
            'year_level'           => $validated['year_level']           ?? null,
            'student_type'         => $validated['student_type']         ?? null,
            'enrollment_status'    => $validated['enrollment_status']    ?? null,
            'date_enrolled'        => $validated['date_enrolled']        ?? null,
            'course_id'            => $course?->id                       ?? null,
            'department_id'        => $course?->department_id ?? ($validated['department_id'] ?? null),
            'lrn'                  => $validated['lrn']                  ?? null,
            'last_school_attended' => $validated['last_school_attended'] ?? null,
            'last_year_attended'   => $validated['last_year_attended']   ?? null,
        ]);

        // Store guardian/family data if provided
        $guardians = [
            ['full_name' => $validated['father_name'] ?? null, 'relationship' => 'Father', 'occupation' => $validated['father_occupation'] ?? null, 'contact_number' => null],
            ['full_name' => $validated['mother_name'] ?? null, 'relationship' => 'Mother', 'occupation' => $validated['mother_occupation'] ?? null, 'contact_number' => $validated['guardian_contact'] ?? null],
        ];
        foreach ($guardians as $g) {
            if ($g['full_name']) {
                $student->guardians()->create(array_filter($g, fn($v) => $v !== null));
            }
        }

        // User login uses student_number as the identifier stored in `name`, email is personal
        \DB::table('users')->insert([
            'name'       => $validated['student_number'], // used as login identifier
            'email'      => $email,
            'password'   => Hash::make($validated['password']),
            'role'       => 'student',
            'student_id' => $student->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $user = User::where('email', $email)->first();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => [
                'id'             => $user->id,
                'student_number' => $validated['student_number'],
                'email'          => $user->email,
                'role'           => $user->role,
                'student_id'     => $user->student_id,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Login.
     * - Admin: email + password (only ADMIN_EMAIL allowed)
     * - Faculty: email (@pnc.edu.com) + password
     * - Student: student_number + password
     */
    public function login(Request $request)
    {
        // Determine login type: student_number or email
        $isStudentLogin = $request->filled('student_number') && !$request->filled('email');

        if ($isStudentLogin) {
            return $this->loginStudent($request);
        }

        return $this->loginByEmail($request);
    }

    private function loginStudent(Request $request)
    {
        $request->validate([
            'student_number' => [
                'required',
                'string',
                'max:20',
                'regex:/^(22|23|24)\d{5}$/',
            ],
            'password' => 'required|string',
        ], [
            'student_number.regex' => 'Student number must start with 22, 23, or 24 followed by 5 digits.',
        ]);

        // student_number is stored in users.name for student accounts
        $user = User::where('role', 'student')->where('name', $request->student_number)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'student_number' => ['Invalid student number or password.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => [
                'id'                  => $user->id,
                'student_number'      => $user->name,
                'role'                => $user->role,
                'student_id'          => $user->student_id,
                'must_change_password'=> (bool) $user->must_change_password,
            ],
            'token' => $token,
        ]);
    }

    private function loginByEmail(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $email = strtolower(trim($request->email));
        $user  = User::where('email', $email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Admin can only log in with the fixed admin email
        if ($user->role === 'admin' && $email !== strtolower(self::ADMIN_EMAIL)) {
            throw ValidationException::withMessages([
                'email' => ['Unauthorized access.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user'  => [
                'id'                  => $user->id,
                'name'                => $user->role !== 'student' ? $user->name : null,
                'email'               => $user->email,
                'role'                => $user->role,
                'student_id'          => $user->student_id,
                'faculty_id'          => $user->faculty_id,
                'must_change_password'=> (bool) $user->must_change_password,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Logout (revoke token).
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Force-change password (first login).
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'new_password'              => 'required|string|min:8|confirmed',
            'new_password_confirmation' => 'required|string',
        ]);

        $user = $request->user();
        $user->update([
            'password'             => Hash::make($request->new_password),
            'must_change_password' => false,
        ]);

        return response()->json(['message' => 'Password changed successfully.']);
    }
}
