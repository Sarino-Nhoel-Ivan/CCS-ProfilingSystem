<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('faculties', function (Blueprint $table) {
            // Basic Information
            $table->string('employee_id')->nullable()->after('id');
            $table->string('gender')->nullable()->after('suffix');
            $table->date('date_of_birth')->nullable()->after('gender');
            $table->string('civil_status')->nullable()->after('date_of_birth');
            $table->string('nationality')->nullable()->default('Filipino')->after('civil_status');
            // Contact Information
            $table->string('personal_email')->nullable()->after('email');
            $table->string('telephone_number')->nullable()->after('contact_number');
            $table->text('home_address')->nullable()->after('telephone_number');
            $table->text('office_address')->nullable()->after('home_address');
            // Professional Information
            $table->string('academic_rank')->nullable()->after('position');
            $table->string('area_of_specialization')->nullable()->after('academic_rank');
            $table->integer('years_of_service')->nullable()->after('hire_date');
            $table->json('courses_handled')->nullable()->after('years_of_service');
            // Educational Background (structured)
            $table->json('bachelors_degree')->nullable()->after('educational_attainment');
            $table->json('masters_degree')->nullable()->after('bachelors_degree');
            $table->json('doctorate_degree')->nullable()->after('masters_degree');
            $table->json('certifications')->nullable()->after('doctorate_degree');
        });
    }

    public function down(): void
    {
        Schema::table('faculties', function (Blueprint $table) {
            $table->dropColumn([
                'employee_id', 'gender', 'date_of_birth', 'civil_status', 'nationality',
                'personal_email', 'telephone_number', 'home_address', 'office_address',
                'academic_rank', 'area_of_specialization', 'years_of_service', 'courses_handled',
                'bachelors_degree', 'masters_degree', 'doctorate_degree', 'certifications',
            ]);
        });
    }
};
