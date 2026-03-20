<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('faculties', function (Blueprint $table) {
            $table->string('position')->nullable()->change();
            $table->string('employment_status')->nullable()->change();
            $table->date('hire_date')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('faculties', function (Blueprint $table) {
            $table->string('position')->nullable(false)->change();
            $table->string('employment_status')->nullable(false)->change();
            $table->date('hire_date')->nullable(false)->change();
        });
    }
};
