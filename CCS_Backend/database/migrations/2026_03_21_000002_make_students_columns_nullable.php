<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->date('birth_date')->nullable()->change();
            $table->string('nationality')->nullable()->change();
            $table->string('civil_status')->nullable()->change();
            $table->string('year_level')->nullable()->change();
            $table->string('student_type')->nullable()->change();
            $table->string('enrollment_status')->nullable()->change();
            $table->date('date_enrolled')->nullable()->change();
            $table->foreignId('course_id')->nullable()->change();
            $table->foreignId('department_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->date('birth_date')->nullable(false)->change();
            $table->string('nationality')->nullable(false)->change();
            $table->string('civil_status')->nullable(false)->change();
            $table->string('year_level')->nullable(false)->change();
            $table->string('student_type')->nullable(false)->change();
            $table->string('enrollment_status')->nullable(false)->change();
            $table->date('date_enrolled')->nullable(false)->change();
        });
    }
};
