<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('faculties', function (Blueprint $table) {
            $table->string('suffix')->nullable()->after('last_name');
            $table->string('profile_photo')->nullable()->after('suffix');
            $table->string('office_hours')->nullable()->after('office_location');
            // Professional Background
            $table->json('educational_attainment')->nullable()->after('office_hours');
            $table->json('expertise_areas')->nullable()->after('educational_attainment');
            $table->json('work_experience')->nullable()->after('expertise_areas');
            $table->text('research_interests')->nullable()->after('work_experience');
            // Additional Information
            $table->text('biography')->nullable()->after('research_interests');
            $table->json('achievements')->nullable()->after('biography');
            $table->json('publications')->nullable()->after('achievements');
            $table->json('social_links')->nullable()->after('publications');
        });
    }

    public function down(): void
    {
        Schema::table('faculties', function (Blueprint $table) {
            $table->dropColumn([
                'suffix', 'profile_photo', 'office_hours',
                'educational_attainment', 'expertise_areas', 'work_experience', 'research_interests',
                'biography', 'achievements', 'publications', 'social_links',
            ]);
        });
    }
};
