<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\StudentController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OtpController;

// ── Public Auth Routes ─────────────────────────────────────────
Route::post('/auth/register',   [AuthController::class, 'register']);
Route::post('/auth/login',      [AuthController::class, 'login']);

// ── OTP Routes (public, email verification) ────────────────────
Route::post('/auth/send-otp',   [OtpController::class, 'send']);
Route::post('/auth/verify-otp', [OtpController::class, 'verify']);

// ── Protected Auth Routes ──────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user',          fn(Request $r) => $r->user());
    Route::post('/auth/logout',  [AuthController::class, 'logout']);
});

Route::get('/search', [\App\Http\Controllers\SearchController::class, 'index']);

Route::get('/faculties/export/csv',        [\App\Http\Controllers\FacultyController::class, 'export']);
Route::post('/faculties/{faculty}/photo',  [\App\Http\Controllers\FacultyController::class, 'uploadPhoto']);
Route::get('/students/export/csv',  [StudentController::class, 'export']);
Route::post('/students/advanced-search', [StudentController::class, 'advancedSearch']);

Route::apiResource('students', StudentController::class);

// Nested sub-resources for student records
Route::post('/students/{student}/medical-histories',             [StudentController::class, 'storeMedical']);
Route::put('/students/{student}/medical-histories/{medical}',    [StudentController::class, 'updateMedical']);
Route::delete('/students/{student}/medical-histories/{medical}', [StudentController::class, 'destroyMedical']);

Route::post('/students/{student}/violations',                    [StudentController::class, 'storeViolation']);
Route::put('/students/{student}/violations/{violation}',         [StudentController::class, 'updateViolation']);
Route::delete('/students/{student}/violations/{violation}',      [StudentController::class, 'destroyViolation']);

Route::put('/students/{student}/skills',                         [StudentController::class, 'syncSkills']);
Route::post('/students/{student}/photo',                         [StudentController::class, 'uploadPhoto']);

// Affiliations
Route::get('/students/{student}/affiliations',                   [\App\Http\Controllers\AffiliationController::class, 'index']);
Route::post('/students/{student}/affiliations',                  [\App\Http\Controllers\AffiliationController::class, 'store']);
Route::put('/students/{student}/affiliations/{affiliation}',     [\App\Http\Controllers\AffiliationController::class, 'update']);
Route::delete('/students/{student}/affiliations/{affiliation}',  [\App\Http\Controllers\AffiliationController::class, 'destroy']);

// Guardians
Route::get('/students/{student}/guardians',                      [\App\Http\Controllers\GuardianController::class, 'index']);
Route::post('/students/{student}/guardians',                     [\App\Http\Controllers\GuardianController::class, 'store']);
Route::put('/students/{student}/guardians/{guardian}',           [\App\Http\Controllers\GuardianController::class, 'update']);
Route::delete('/students/{student}/guardians/{guardian}',        [\App\Http\Controllers\GuardianController::class, 'destroy']);

// Academic Histories
Route::get('/students/{student}/academic-histories',                          [\App\Http\Controllers\AcademicHistoryController::class, 'index']);
Route::post('/students/{student}/academic-histories',                         [\App\Http\Controllers\AcademicHistoryController::class, 'store']);
Route::put('/students/{student}/academic-histories/{academicHistory}',        [\App\Http\Controllers\AcademicHistoryController::class, 'update']);
Route::delete('/students/{student}/academic-histories/{academicHistory}',     [\App\Http\Controllers\AcademicHistoryController::class, 'destroy']);

Route::apiResource('courses',     \App\Http\Controllers\CourseController::class);
Route::apiResource('departments', \App\Http\Controllers\DepartmentController::class);
Route::apiResource('faculties',   \App\Http\Controllers\FacultyController::class);
Route::apiResource('subjects',    \App\Http\Controllers\SubjectController::class);
Route::apiResource('sections',    \App\Http\Controllers\SectionController::class);
Route::apiResource('schedules',   \App\Http\Controllers\ScheduleController::class);
Route::apiResource('events',      \App\Http\Controllers\EventController::class);
Route::apiResource('skills',      \App\Http\Controllers\SkillController::class);
