<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One row per student-subject per semester enrollment
        Schema::create('student_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('faculty_id')->nullable()->constrained('faculties')->nullOnDelete();
            $table->string('year_level');
            $table->string('semester');
            $table->string('school_year');         // e.g. "2025-2026"
            $table->string('status')->default('enrolled'); // enrolled, dropped, completed
            $table->timestamps();

            $table->unique(['student_id', 'subject_id', 'semester', 'school_year'], 'unique_enrollment');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_enrollments');
    }
};
