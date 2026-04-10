<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_skill', function (Blueprint $table) {
            $table->string('skill_level')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('student_skill', function (Blueprint $table) {
            $table->string('skill_level')->nullable(false)->change();
        });
    }
};
