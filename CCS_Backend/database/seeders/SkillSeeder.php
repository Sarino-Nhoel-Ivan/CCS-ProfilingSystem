<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            // ── Academic: Programming Languages ──────────────────────
            ['skill_name' => 'Python',              'skill_category' => 'Academic', 'description' => 'General-purpose programming language widely used in data science, AI, and web development.'],
            ['skill_name' => 'JavaScript',          'skill_category' => 'Academic', 'description' => 'Core language of the web, used for frontend and backend (Node.js) development.'],
            ['skill_name' => 'Java',                'skill_category' => 'Academic', 'description' => 'Object-oriented language used in enterprise applications and Android development.'],
            ['skill_name' => 'C / C++',             'skill_category' => 'Academic', 'description' => 'Low-level languages used in systems programming, embedded systems, and competitive programming.'],
            ['skill_name' => 'PHP',                 'skill_category' => 'Academic', 'description' => 'Server-side scripting language widely used in web development.'],
            ['skill_name' => 'TypeScript',          'skill_category' => 'Academic', 'description' => 'Typed superset of JavaScript for large-scale application development.'],
            ['skill_name' => 'Kotlin',              'skill_category' => 'Academic', 'description' => 'Modern language for Android and JVM development.'],
            ['skill_name' => 'Swift',               'skill_category' => 'Academic', 'description' => 'Apple\'s language for iOS and macOS development.'],
            ['skill_name' => 'Go (Golang)',         'skill_category' => 'Academic', 'description' => 'Compiled language known for concurrency and performance.'],
            ['skill_name' => 'Rust',                'skill_category' => 'Academic', 'description' => 'Systems language focused on safety and performance.'],

            // ── Academic: Web & Mobile Development ───────────────────
            ['skill_name' => 'HTML & CSS',          'skill_category' => 'Academic', 'description' => 'Foundational technologies for building and styling web pages.'],
            ['skill_name' => 'React.js',            'skill_category' => 'Academic', 'description' => 'JavaScript library for building user interfaces.'],
            ['skill_name' => 'Vue.js',              'skill_category' => 'Academic', 'description' => 'Progressive JavaScript framework for building UIs.'],
            ['skill_name' => 'Laravel',             'skill_category' => 'Academic', 'description' => 'PHP framework for elegant web application development.'],
            ['skill_name' => 'Node.js',             'skill_category' => 'Academic', 'description' => 'JavaScript runtime for server-side development.'],
            ['skill_name' => 'React Native',        'skill_category' => 'Academic', 'description' => 'Framework for building cross-platform mobile apps using React.'],
            ['skill_name' => 'Flutter',             'skill_category' => 'Academic', 'description' => 'Google\'s UI toolkit for building natively compiled mobile, web, and desktop apps.'],
            ['skill_name' => 'Android Development', 'skill_category' => 'Academic', 'description' => 'Building native Android applications using Java or Kotlin.'],

            // ── Academic: Database & Data ─────────────────────────────
            ['skill_name' => 'MySQL',               'skill_category' => 'Academic', 'description' => 'Popular open-source relational database management system.'],
            ['skill_name' => 'PostgreSQL',          'skill_category' => 'Academic', 'description' => 'Advanced open-source relational database.'],
            ['skill_name' => 'MongoDB',             'skill_category' => 'Academic', 'description' => 'NoSQL document-oriented database.'],
            ['skill_name' => 'SQL',                 'skill_category' => 'Academic', 'description' => 'Structured Query Language for managing relational databases.'],
            ['skill_name' => 'Data Analysis',       'skill_category' => 'Academic', 'description' => 'Analyzing and interpreting complex data sets.'],
            ['skill_name' => 'Machine Learning',    'skill_category' => 'Academic', 'description' => 'Building systems that learn from data to make predictions.'],

            // ── Academic: DevOps & Tools ──────────────────────────────
            ['skill_name' => 'Git & GitHub',        'skill_category' => 'Academic', 'description' => 'Version control and collaborative development platform.'],
            ['skill_name' => 'Linux / CLI',         'skill_category' => 'Academic', 'description' => 'Command-line proficiency and Linux system administration.'],
            ['skill_name' => 'Docker',              'skill_category' => 'Academic', 'description' => 'Containerization platform for consistent development environments.'],
            ['skill_name' => 'REST API Design',     'skill_category' => 'Academic', 'description' => 'Designing and consuming RESTful web services.'],
            ['skill_name' => 'Cybersecurity',       'skill_category' => 'Academic', 'description' => 'Protecting systems, networks, and programs from digital attacks.'],
            ['skill_name' => 'Network Administration', 'skill_category' => 'Academic', 'description' => 'Managing and maintaining computer networks.'],
            ['skill_name' => 'UI/UX Design',        'skill_category' => 'Academic', 'description' => 'Designing user interfaces and experiences for digital products.'],
            ['skill_name' => 'Figma',               'skill_category' => 'Academic', 'description' => 'Collaborative UI design and prototyping tool.'],

            // ── Non-Academic: Sports ──────────────────────────────────
            ['skill_name' => 'Basketball',          'skill_category' => 'Non-Academic', 'description' => 'Team sport played on a court.'],
            ['skill_name' => 'Volleyball',          'skill_category' => 'Non-Academic', 'description' => 'Team sport played over a net.'],
            ['skill_name' => 'Football / Soccer',   'skill_category' => 'Non-Academic', 'description' => 'The world\'s most popular team sport.'],
            ['skill_name' => 'Badminton',           'skill_category' => 'Non-Academic', 'description' => 'Racket sport played with a shuttlecock.'],
            ['skill_name' => 'Table Tennis',        'skill_category' => 'Non-Academic', 'description' => 'Indoor racket sport played on a table.'],
            ['skill_name' => 'Swimming',            'skill_category' => 'Non-Academic', 'description' => 'Aquatic sport and fitness activity.'],
            ['skill_name' => 'Chess',               'skill_category' => 'Non-Academic', 'description' => 'Strategic board game of skill and tactics.'],
            ['skill_name' => 'Track & Field',       'skill_category' => 'Non-Academic', 'description' => 'Athletic events including running, jumping, and throwing.'],

            // ── Non-Academic: Arts & Creative ────────────────────────
            ['skill_name' => 'Drawing / Illustration', 'skill_category' => 'Non-Academic', 'description' => 'Creating visual art by hand or digitally.'],
            ['skill_name' => 'Photography',         'skill_category' => 'Non-Academic', 'description' => 'Capturing images using a camera.'],
            ['skill_name' => 'Video Editing',       'skill_category' => 'Non-Academic', 'description' => 'Editing and producing video content.'],
            ['skill_name' => 'Graphic Design',      'skill_category' => 'Non-Academic', 'description' => 'Creating visual content for communication.'],
            ['skill_name' => 'Music (Instrument)',  'skill_category' => 'Non-Academic', 'description' => 'Playing a musical instrument.'],
            ['skill_name' => 'Singing / Vocals',    'skill_category' => 'Non-Academic', 'description' => 'Vocal performance and singing.'],
            ['skill_name' => 'Dancing',             'skill_category' => 'Non-Academic', 'description' => 'Performing choreographed or freestyle dance.'],

            // ── Non-Academic: Leadership & Soft Skills ────────────────
            ['skill_name' => 'Public Speaking',     'skill_category' => 'Non-Academic', 'description' => 'Delivering speeches and presentations to an audience.'],
            ['skill_name' => 'Leadership',          'skill_category' => 'Non-Academic', 'description' => 'Guiding and motivating a team toward a goal.'],
            ['skill_name' => 'Event Management',    'skill_category' => 'Non-Academic', 'description' => 'Planning and organizing events.'],
            ['skill_name' => 'Journalism / Writing','skill_category' => 'Non-Academic', 'description' => 'Writing articles, stories, or reports.'],
            ['skill_name' => 'Debate',              'skill_category' => 'Non-Academic', 'description' => 'Structured argumentation and critical thinking.'],
        ];

        foreach ($skills as $skill) {
            Skill::firstOrCreate(
                ['skill_name' => $skill['skill_name'], 'skill_category' => $skill['skill_category']],
                ['description' => $skill['description']]
            );
        }
    }
}
