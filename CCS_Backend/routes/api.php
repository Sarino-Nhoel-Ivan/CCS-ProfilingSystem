<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StudentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OtpController;

/*
|--------------------------------------------------------------------------
| API Routes — CCS Profiling System
|--------------------------------------------------------------------------
|
| NOTE ON CLIENT-SIDE ROUTING (Part 1 & Part 2):
|
| Part 1 — Static client-side routes (React Router, no page reload):
|   /admin/dashboard  →  Dashboard overview
|   /admin/users      →  Student Information module
|   /admin/reports    →  Faculty Information module
|
| Part 2 — Dynamic client-side routes:
|   /admin/users/:id  →  Opens specific student's detail view
|   /admin/reports/:id→  Opens specific faculty member's detail view
|   /student?section= →  Student dashboard section (profile, academic, etc.)
|   /faculty?section= →  Faculty dashboard section (profile, subjects, etc.)
|
|   Clicking a user from the list navigates to their detail page
|   without a full page reload (SPA behavior via React Router).
|
| Part 3 — Props vs State:
|   Parent (StudentModule / Users Page):
|     - Stores user list in STATE: const [students, setStudents] = useState([])
|     - Fetches from this API and keeps data in state
|     - Passes individual student data to child via PROPS
|   Child (StudentCard component):
|     - Receives `student` object as prop — no own data fetching
|     - Receives `onSelect` callback prop to notify parent on click
|     - Purely presentational: renders what it receives via props
|   Flow: Parent (Users Page) → props → Child (StudentCard)
|
| The routes below are the SERVER-SIDE API endpoints that supply data
| to those frontend pages via HTTP requests.
|
*/

// ── Health Check ───────────────────────────────────────────────
Route::get('/health', fn() => response()->json(['status' => 'ok', 'timestamp' => now()]));

// ── Public Auth Routes ─────────────────────────────────────────
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

// ── OTP Routes (email verification before registration) ────────
Route::post('/auth/send-otp',   [OtpController::class, 'send']);
Route::post('/auth/verify-otp', [OtpController::class, 'verify']);

// ── Protected Auth Routes ──────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',                      fn(Request $r) => $r->user());
    Route::post('/auth/logout',              [AuthController::class, 'logout']);
    Route::post('/auth/change-password',     [AuthController::class, 'changePassword']);
});

// ── Search ─────────────────────────────────────────────────────
// Powers the Comprehensive Search module (/admin/search)
Route::get('/search', [\App\Http\Controllers\SearchController::class, 'index']);

// ══════════════════════════════════════════════════════════════
// DASHBOARD ROUTES  (/admin/dashboard)
// Supplies aggregate data: students, faculty, events counts
// ══════════════════════════════════════════════════════════════
Route::get('/students/export/csv',       [StudentController::class, 'export']);
Route::post('/students/advanced-search', [StudentController::class, 'advancedSearch']);
Route::get('/faculties/export/csv',      [\App\Http\Controllers\FacultyController::class, 'export']);

// ══════════════════════════════════════════════════════════════
// USERS ROUTES  (/admin/users)
// Full CRUD for student profiles and all nested sub-resources
// ══════════════════════════════════════════════════════════════
Route::apiResource('students', StudentController::class);

// Student → Medical Histories
Route::post('/students/{student}/medical-histories',             [StudentController::class, 'storeMedical']);
Route::put('/students/{student}/medical-histories/{medical}',    [StudentController::class, 'updateMedical']);
Route::delete('/students/{student}/medical-histories/{medical}', [StudentController::class, 'destroyMedical']);

// Student → Violations
Route::post('/students/{student}/violations',                    [StudentController::class, 'storeViolation']);
Route::put('/students/{student}/violations/{violation}',         [StudentController::class, 'updateViolation']);
Route::delete('/students/{student}/violations/{violation}',      [StudentController::class, 'destroyViolation']);

// Student → Skills (sync pivot table)
Route::put('/students/{student}/skills',                         [StudentController::class, 'syncSkills']);

// Student → Profile Photo
Route::post('/students/{student}/photo',                         [StudentController::class, 'uploadPhoto']);

// Student → Affiliations
Route::get('/students/{student}/affiliations',                   [\App\Http\Controllers\AffiliationController::class, 'index']);
Route::post('/students/{student}/affiliations',                  [\App\Http\Controllers\AffiliationController::class, 'store']);
Route::put('/students/{student}/affiliations/{affiliation}',     [\App\Http\Controllers\AffiliationController::class, 'update']);
Route::delete('/students/{student}/affiliations/{affiliation}',  [\App\Http\Controllers\AffiliationController::class, 'destroy']);

// Student → Guardians
Route::get('/students/{student}/guardians',                      [\App\Http\Controllers\GuardianController::class, 'index']);
Route::post('/students/{student}/guardians',                     [\App\Http\Controllers\GuardianController::class, 'store']);
Route::put('/students/{student}/guardians/{guardian}',           [\App\Http\Controllers\GuardianController::class, 'update']);
Route::delete('/students/{student}/guardians/{guardian}',        [\App\Http\Controllers\GuardianController::class, 'destroy']);

// Student → Academic Histories
Route::get('/students/{student}/academic-histories',                      [\App\Http\Controllers\AcademicHistoryController::class, 'index']);
Route::post('/students/{student}/academic-histories',                     [\App\Http\Controllers\AcademicHistoryController::class, 'store']);
Route::put('/students/{student}/academic-histories/{academicHistory}',    [\App\Http\Controllers\AcademicHistoryController::class, 'update']);
Route::delete('/students/{student}/academic-histories/{academicHistory}', [\App\Http\Controllers\AcademicHistoryController::class, 'destroy']);

// ══════════════════════════════════════════════════════════════
// REPORTS ROUTES  (/admin/reports)
// Full CRUD for faculty profiles and photo upload
// ══════════════════════════════════════════════════════════════
Route::post('/faculties/{faculty}/photo', [\App\Http\Controllers\FacultyController::class, 'uploadPhoto']);
Route::apiResource('faculties', \App\Http\Controllers\FacultyController::class);

// ══════════════════════════════════════════════════════════════
// SUPPORTING DATA ROUTES
// Reference data used across all modules
// ══════════════════════════════════════════════════════════════
Route::apiResource('courses',     \App\Http\Controllers\CourseController::class);
Route::apiResource('departments', \App\Http\Controllers\DepartmentController::class);
Route::apiResource('subjects',    \App\Http\Controllers\SubjectController::class);
Route::apiResource('sections',    \App\Http\Controllers\SectionController::class);
Route::apiResource('schedules',   \App\Http\Controllers\ScheduleController::class);
Route::apiResource('events',      \App\Http\Controllers\EventController::class);
Route::apiResource('skills',      \App\Http\Controllers\SkillController::class);

// ══════════════════════════════════════════════════════════════
// ENROLLMENT & CURRICULUM ROUTES
// ══════════════════════════════════════════════════════════════
use App\Http\Controllers\EnrollmentController;

// Curriculum management (admin defines which subjects belong to each year/semester)
Route::get('/curriculum-subjects',        [EnrollmentController::class, 'curriculumIndex']);
Route::post('/curriculum-subjects',       [EnrollmentController::class, 'curriculumStore']);
Route::delete('/curriculum-subjects/{id}',[EnrollmentController::class, 'curriculumDestroy']);

// Enroll a student (auto-assigns subjects based on their year_level)
Route::post('/students/{student}/enroll',       [EnrollmentController::class, 'enroll']);
Route::get('/students/{student}/enrollments',   [EnrollmentController::class, 'studentEnrollments']);

// Admin manages individual enrollment records
Route::get('/enrollments',                              [EnrollmentController::class, 'allEnrollments']);
Route::put('/enrollments/{enrollment}/assign-faculty',  [EnrollmentController::class, 'assignFaculty']);
Route::put('/enrollments/{enrollment}',                 [EnrollmentController::class, 'updateEnrollment']);