<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->string('program')->nullable()->after('pre_requisites')
                  ->comment('BSIT or BSCS');
            $table->string('year_level')->nullable()->after('program')
                  ->comment('1st Year, 2nd Year, 3rd Year, 4th Year');
            $table->string('semester')->nullable()->after('year_level')
                  ->comment('1st Semester, 2nd Semester');
        });
    }

    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn(['program', 'year_level', 'semester']);
        });
    }
};
