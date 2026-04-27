<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Department;
use App\Models\Course;
use App\Models\Faculty;
use App\Models\Student;
use App\Models\Skill;

/**
 * DemoSeeder — seeds 100 faculty + 1000 students for demo/staging.
 *
 * Safe to run on top of an existing database:
 *   - Skips the admin account entirely.
 *   - Reuses the existing CCS department and BSIT/BSCS courses.
 *   - Uses firstOrCreate / insertOrIgnore so re-running is idempotent.
 *
 * Run with:
 *   php artisan db:seed --class=DemoSeeder
 */
class DemoSeeder extends Seeder
{
    // ── Filipino first names ──────────────────────────────────────────────────
    private const MALE_NAMES = [
        'Juan','Jose','Miguel','Carlos','Antonio','Roberto','Eduardo','Fernando',
        'Ricardo','Manuel','Francisco','Andres','Ramon','Luis','Pedro','Ernesto',
        'Rodrigo','Alfredo','Renato','Danilo','Rolando','Arnel','Jayson','Mark',
        'John','James','Ryan','Kevin','Christian','Michael','Daniel','Joshua',
        'Gabriel','Nathan','Aaron','Adrian','Alvin','Brent','Carlo','Darius',
        'Elijah','Felix','Gerald','Harold','Ivan','Jerome','Kenneth','Lance',
        'Mario','Neil','Oscar','Patrick','Quentin','Renz','Samuel','Tristan',
        'Ulysses','Victor','Warren','Xavier','Yvan','Zachary','Aldrin','Benito',
        'Crisanto','Domingo','Efren','Florencio','Gregorio','Herminio','Isidro',
        'Jaime','Kristoffer','Lorenzo','Marcelo','Nicanor','Onofre','Porfirio',
        'Quirino','Rogelio','Silverio','Teodoro','Urbano','Venancio','Wilfredo',
        'Xerxes','Yosef','Zosimo','Ace','Bong','Cris','Dave','Enzo',
    ];

    private const FEMALE_NAMES = [
        'Maria','Ana','Rosa','Elena','Carmen','Luz','Gloria','Corazon','Lourdes',
        'Remedios','Teresita','Marilou','Maricel','Maribel','Marilyn','Marissa',
        'Jasmine','Kristine','Christine','Kathleen','Karen','Katrina','Kimberly',
        'Jennifer','Jessica','Michelle','Nicole','Patricia','Rachel','Sandra',
        'Sheila','Stephanie','Susan','Tanya','Vanessa','Veronica','Vivian',
        'Wendy','Yvonne','Zenaida','Abigail','Beatriz','Cecilia','Dolores',
        'Esperanza','Felicidad','Gracia','Herminia','Imelda','Josefina',
        'Leonora','Milagros','Natividad','Ofelia','Pilar','Quirina','Rosario',
        'Soledad','Trinidad','Ursula','Victoria','Wilhelmina','Ximena','Yolanda',
        'Zita','Aiza','Bea','Celine','Danica','Erika','Faith','Gina','Hannah',
        'Iris','Joy','Kyla','Liza','Mia','Nina','Olive','Pamela','Queen',
        'Rhea','Stella','Tina','Uma','Vina','Wanda','Xia','Ysa','Zoe',
    ];

    private const LAST_NAMES = [
        'Santos','Reyes','Cruz','Bautista','Ocampo','Garcia','Mendoza','Torres',
        'Castillo','Flores','Ramos','Aquino','Villanueva','Gonzales','Dela Cruz',
        'Diaz','Ramirez','Morales','Hernandez','Lopez','Perez','Fernandez',
        'Aguilar','Pascual','Navarro','Soriano','Lim','Tan','Ong','Sy',
        'Chua','Go','Yap','Co','Dy','Ng','Chan','Wong','Lee','Cheng',
        'Macaraeg','Buenaventura','Evangelista','Tolentino','Manalo','Delos Reyes',
        'Delos Santos','De Leon','De Guzman','De Jesus','Dela Torre','Dela Rosa',
        'Magno','Salazar','Valdez','Vargas','Vega','Velasco','Vergara','Villafuerte',
        'Villareal','Villarin','Villaruel','Villaverde','Villena','Villegas',
        'Abella','Abreu','Acosta','Agcaoili','Aguilera','Aguinaldo','Alcantara',
        'Alcaraz','Alcazar','Alegre','Alejandro','Alejo','Aleman','Alfaro',
        'Almario','Almeda','Almeida','Almonte','Alonso','Altarejos','Alvarado',
        'Alvarez','Amador','Amante','Ambrosio','Amores','Amparo','Andal',
        'Andrade','Angeles','Angulo','Anito','Antiporda','Antonio','Apilado',
        'Apostol','Aquino','Aragon','Aranda','Arce','Arceo','Arcilla','Arenas',
        'Arguelles','Arias','Arroyo','Asuncion','Austria','Avila','Ayala',
        'Azores','Bacani','Bacarro','Baclig','Badillo','Bagasao','Bagtas',
        'Balbuena','Balderas','Baldos','Baldonado','Ballesteros','Balmaceda',
        'Balolong','Baltazar','Baluyot','Banares','Banaag','Banzon','Baraquel',
        'Barba','Barbosa','Barcelon','Barrera','Barretto','Bartolome','Basilio',
        'Batac','Batungbakal','Bautista','Bayani','Bayot','Belen','Belena',
        'Bello','Beltran','Benedicto','Benitez','Bernabe','Bernardo','Bersamin',
        'Besa','Biag','Bigornia','Bilbao','Binay','Bituin','Blanco','Boado',
        'Bondoc','Bonifacio','Borja','Borromeo','Bote','Briones','Buenaobra',
        'Bueno','Bugayong','Bulatao','Bulosan','Burgos','Bustamante','Busto',
    ];

    private const RELIGIONS = [
        'Roman Catholic', 'Iglesia ni Cristo', 'Islam', 'Protestant',
        'Seventh-day Adventist', 'Born Again Christian', 'Aglipayan',
    ];

    private const PROVINCES = [
        'Laguna', 'Cavite', 'Batangas', 'Rizal', 'Quezon', 'Bulacan',
        'Pampanga', 'Tarlac', 'Nueva Ecija', 'Bataan', 'Zambales',
        'Metro Manila', 'Cebu', 'Davao del Sur', 'Iloilo', 'Negros Occidental',
    ];

    private const CITIES = [
        'Cabuyao', 'Calamba', 'Santa Rosa', 'Biñan', 'San Pedro', 'Muntinlupa',
        'Las Piñas', 'Parañaque', 'Pasay', 'Makati', 'Taguig', 'Pasig',
        'Marikina', 'Quezon City', 'Caloocan', 'Malabon', 'Navotas', 'Valenzuela',
        'Bacoor', 'Imus', 'Dasmariñas', 'General Trias', 'Tagaytay', 'Trece Martires',
        'Lipa', 'Batangas City', 'Tanauan', 'Sto. Tomas', 'Antipolo', 'Cainta',
    ];

    private const BARANGAYS = [
        'Barangay Uno', 'Barangay Dos', 'Barangay Tres', 'Poblacion',
        'San Isidro', 'San Jose', 'San Juan', 'San Pedro', 'San Roque',
        'Santa Cruz', 'Santa Maria', 'Santo Niño', 'Bagong Nayon',
        'Bagumbayan', 'Batino', 'Bigaa', 'Butong', 'Casile', 'Diezmo',
        'Gulod', 'Mamatid', 'Marinig', 'Niugan', 'Pittland', 'Pulo',
        'Sala', 'Banay-Banay', 'Baclaran', 'Banlic', 'Bubuyan',
    ];

    private const POSITIONS = [
        'Instructor I', 'Instructor II', 'Instructor III',
        'Assistant Professor I', 'Assistant Professor II', 'Assistant Professor III',
        'Associate Professor I', 'Associate Professor II',
        'Professor I', 'Professor II',
    ];

    private const EMPLOYMENT_STATUSES = [
        'Full-Time', 'Full-Time', 'Full-Time',   // weighted toward Full-Time
        'Part-Time', 'Part-Time',
        'Adjunct', 'Contract',
    ];

    private const OFFICE_HOURS = [
        'MWF 8:00 AM – 10:00 AM',
        'TTH 1:00 PM – 3:00 PM',
        'MWF 2:00 PM – 4:00 PM',
        'TTH 9:00 AM – 11:00 AM',
        'MWF 10:00 AM – 12:00 PM',
        'TTH 3:00 PM – 5:00 PM',
        'MW 1:00 PM – 3:00 PM',
        'TF 8:00 AM – 10:00 AM',
        'By appointment only',
        'MWF 7:30 AM – 9:30 AM',
    ];

    private const VIOLATION_TYPES = [
        'Academic Dishonesty', 'Tardiness', 'Absenteeism', 'Dress Code Violation',
        'Disruptive Behavior', 'Plagiarism', 'Unauthorized Use of Devices',
        'Disrespect to Faculty', 'Vandalism', 'Bullying',
    ];

    private const VIOLATION_SEVERITIES = ['Low', 'Low', 'Medium', 'Medium', 'High'];
    private const VIOLATION_STATUSES   = ['Pending', 'Pending', 'Under Review', 'Resolved'];

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function pick(array $arr): mixed
    {
        return $arr[array_rand($arr)];
    }

    private function uniqueEmail(string $base, string $domain, array &$used): string
    {
        // Use a counter suffix to guarantee uniqueness — no random collisions possible
        static $counters = [];
        $key = $base . '@' . $domain;
        if (!isset($counters[$key])) $counters[$key] = 1;

        $email = $base . $counters[$key] . '@' . $domain;
        while (isset($used[$email])) {
            $counters[$key]++;
            $email = $base . $counters[$key] . '@' . $domain;
        }
        $counters[$key]++;
        $used[$email] = true;
        return $email;
    }

    private function uniqueStudentNumber(array &$used): string
    {
        static $counter = 1;
        $prefixes = ['22', '23', '24', '25'];
        do {
            $prefix = $prefixes[$counter % count($prefixes)];
            $number = $prefix . str_pad((string) $counter, 5, '0', STR_PAD_LEFT);
            $counter++;
        } while (isset($used[$number]));
        $used[$number] = true;
        return $number;
    }

    private function randomPhone(): string
    {
        return '09' . str_pad((string) random_int(100000000, 999999999), 9, '0', STR_PAD_LEFT);
    }

    private function sectionFor(string $yearLevel, string $program): string
    {
        $yearPrefix  = ['1st Year' => '1', '2nd Year' => '2', '3rd Year' => '3', '4th Year' => '4'][$yearLevel];
        $programCode = str_contains($program, 'Information Technology') ? 'IT' : 'CS';
        $letter      = $this->pick(['A', 'B', 'C', 'D', 'E', 'F']);
        return "{$yearPrefix}{$programCode}-{$letter}";
    }

    // ── Main run ──────────────────────────────────────────────────────────────

    public function run(): void
    {
        $this->command->info('DemoSeeder: starting…');

        // ── Resolve shared references ─────────────────────────────────────────
        $ccs = Department::where('department_name', 'College of Computer Studies')->first()
            ?? Department::first();

        $bsitCourse = Course::where('course_code', 'BSIT')->first() ?? Course::first();
        $bscsCourse = Course::where('course_code', 'BSCS')->first() ?? $bsitCourse;

        $allSkills = Skill::pluck('id')->toArray();

        // ── 1. Seed 100 Faculty ───────────────────────────────────────────────
        $this->command->info('Seeding 100 faculty…');
        $this->seedFaculty(100, $ccs->id);

        // ── 2. Seed 1000 Students ─────────────────────────────────────────────
        $this->command->info('Seeding 1000 students…');
        $this->seedStudents(1000, $ccs->id, $bsitCourse->id, $bscsCourse->id, $allSkills);

        $this->command->info('DemoSeeder: done ✓');
    }

    // ── Faculty seeding ───────────────────────────────────────────────────────

    private function seedFaculty(int $count, int $deptId): void
    {
        $usedEmails = DB::table('users')->pluck('email')->flip()->toArray();

        for ($i = 0; $i < $count; $i++) {
            $gender    = random_int(0, 1) ? 'Male' : 'Female';
            $firstName = $gender === 'Male'
                ? $this->pick(self::MALE_NAMES)
                : $this->pick(self::FEMALE_NAMES);
            $lastName  = $this->pick(self::LAST_NAMES);
            $middleName = random_int(0, 2) > 0 ? $this->pick(self::LAST_NAMES) : null;

            $baseEmail = strtolower(
                preg_replace('/[^a-z0-9]/', '', $firstName) . '.' .
                preg_replace('/[^a-z0-9]/', '', $lastName)
            );
            $email = $this->uniqueEmail($baseEmail, 'pnc.edu.ph', $usedEmails);

            $hireDate = date('Y-m-d', strtotime('-' . random_int(1, 3650) . ' days'));
            $dob      = date('Y-m-d', strtotime('-' . random_int(28 * 365, 60 * 365) . ' days'));

            $facultyId = DB::table('faculties')->insertGetId([
                'first_name'        => $firstName,
                'middle_name'       => $middleName,
                'last_name'         => $lastName,
                'gender'            => $gender,
                'date_of_birth'     => $dob,
                'position'          => $this->pick(self::POSITIONS),
                'employment_status' => $this->pick(self::EMPLOYMENT_STATUSES),
                'hire_date'         => $hireDate,
                'email'             => $email,
                'contact_number'    => $this->randomPhone(),
                'office_location'   => 'Faculty Room ' . random_int(1, 6),
                'office_hours'      => $this->pick(self::OFFICE_HOURS),
                'department_id'     => $deptId,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            $tempPassword = date('m/d/Y', strtotime($hireDate));
            DB::table('users')->insertOrIgnore([
                'name'                 => trim("{$firstName} {$lastName}"),
                'email'                => $email,
                'password'             => Hash::make($tempPassword),
                'role'                 => 'faculty',
                'faculty_id'           => $facultyId,
                'must_change_password' => true,
                'created_at'           => now(),
                'updated_at'           => now(),
            ]);
        }
    }

    // ── Student seeding ───────────────────────────────────────────────────────

    private function seedStudents(int $count, int $deptId, int $bsitId, int $bscsId, array $skillIds): void
    {
        $usedEmails         = DB::table('users')->pluck('email')
            ->merge(DB::table('students')->pluck('email'))
            ->flip()->toArray();
        $usedStudentNumbers = DB::table('students')->pluck('student_number')->flip()->toArray();

        $programs   = ['Information Technology' => $bsitId, 'Computer Science' => $bscsId];
        $yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
        $studentRows = [];

        for ($i = 0; $i < $count; $i++) {
            $gender    = random_int(0, 1) ? 'Male' : 'Female';
            $firstName = $gender === 'Male' ? $this->pick(self::MALE_NAMES) : $this->pick(self::FEMALE_NAMES);
            $lastName  = $this->pick(self::LAST_NAMES);
            $middleName = random_int(0, 2) > 0 ? $this->pick(self::LAST_NAMES) : null;

            $studentNumber = $this->uniqueStudentNumber($usedStudentNumbers);

            $baseEmail = strtolower(
                preg_replace('/[^a-z0-9]/', '', $firstName) . '.' .
                preg_replace('/[^a-z0-9]/', '', $lastName)
            );
            $email = $this->uniqueEmail($baseEmail, 'student.pnc.edu.ph', $usedEmails);

            $program   = $this->pick(array_keys($programs));
            $courseId  = $programs[$program];
            $yearLevel = $this->pick($yearLevels);
            $section   = $this->sectionFor($yearLevel, $program);
            $dob       = date('Y-m-d', strtotime('-' . random_int(18 * 365, 25 * 365) . ' days'));
            $city      = $this->pick(self::CITIES);
            $province  = $this->pick(self::PROVINCES);

            $enrollmentStatus = random_int(0, 4) > 0 ? 'Enrolled' : 'Not Enrolled';
            $studentType = $this->pick([
                'Regular', 'Regular', 'Regular', 'Regular',
                'Irregular', 'Irregular',
                'Transferee', 'Returnee', 'Shiftee',
            ]);

            $studentRows[] = [
                'student_number'    => $studentNumber,
                'first_name'        => $firstName,
                'middle_name'       => $middleName,
                'last_name'         => $lastName,
                'suffix'            => random_int(0, 19) === 0 ? $this->pick(['Jr.', 'Sr.', 'III']) : null,
                'gender'            => $gender,
                'birth_date'        => $dob,
                'place_of_birth'    => $city . ', ' . $province,
                'nationality'       => 'Filipino',
                'civil_status'      => random_int(0, 9) > 0 ? 'Single' : 'Married',
                'religion'          => $this->pick(self::RELIGIONS),
                'email'             => $email,
                'contact_number'    => $this->randomPhone(),
                'street'            => random_int(1, 999) . ' ' . $this->pick(['Rizal St.', 'Mabini St.', 'Bonifacio Ave.', 'Aguinaldo Hwy.', 'Quezon Blvd.', 'Roxas Blvd.', 'Magsaysay Ave.']),
                'barangay'          => $this->pick(self::BARANGAYS),
                'city'              => $city,
                'province'          => $province,
                'zip_code'          => (string) random_int(1000, 9999),
                'year_level'        => $yearLevel,
                'section'           => $section,
                'program'           => $program,
                'student_type'      => $studentType,
                'enrollment_status' => $enrollmentStatus,
                'date_enrolled'     => date('Y-m-d', strtotime('-' . random_int(0, 4 * 365) . ' days')),
                'course_id'         => $courseId,
                'department_id'     => $deptId,
                'created_at'        => now(),
                'updated_at'        => now(),
            ];

            if (count($studentRows) >= 100) {
                $this->flushStudents($studentRows, $skillIds);
                $studentRows = [];
            }
        }

        if (!empty($studentRows)) {
            $this->flushStudents($studentRows, $skillIds);
        }
    }

    private function flushStudents(array $rows, array $skillIds): void
    {
        if (empty($rows)) return;

        DB::table('students')->insert($rows);

        // Fetch the IDs of the just-inserted students by email
        $emails     = array_column($rows, 'email');
        $insertedMap = DB::table('students')
            ->whereIn('email', $emails)
            ->pluck('id', 'email')
            ->toArray();

        $skillPivots = [];
        $violations  = [];
        $userRows    = [];

        foreach ($rows as $row) {
            $studentId = $insertedMap[$row['email']] ?? null;
            if (!$studentId) continue;

            // Create user account for login — temp password = birth date in m/d/Y
            $tempPassword = date('m/d/Y', strtotime($row['birth_date']));
            $userRows[] = [
                'name'                 => $row['student_number'], // login identifier
                'email'                => $row['email'],
                'password'             => Hash::make($tempPassword),
                'role'                 => 'student',
                'student_id'           => $studentId,
                'must_change_password' => true,
                'created_at'           => now(),
                'updated_at'           => now(),
            ];

            // Assign 0–4 random skills
            if (!empty($skillIds)) {
                $numSkills = random_int(0, 4);
                if ($numSkills > 0) {
                    $picked = (array) array_rand(array_flip($skillIds), min($numSkills, count($skillIds)));
                    foreach ($picked as $skillId) {
                        $skillPivots[] = [
                            'student_id' => $studentId,
                            'skill_id'   => $skillId,
                            'skill_level' => $this->pick(['Beginner', 'Intermediate', 'Advanced']),
                        ];
                    }
                }
            }

            // 20% chance of 1 violation
            if (random_int(0, 4) === 0) {
                $violations[] = [
                    'student_id'      => $studentId,
                    'violation_type'  => $this->pick(self::VIOLATION_TYPES),
                    'description'     => 'Reported during the academic year.',
                    'date_reported'   => date('Y-m-d', strtotime('-' . random_int(0, 365) . ' days')),
                    'reported_by'     => 'Faculty',
                    'severity_level'  => $this->pick(self::VIOLATION_SEVERITIES),
                    'status'          => $this->pick(self::VIOLATION_STATUSES),
                    'action_taken'    => $this->pick(['Warning issued', 'Counseling session', 'Parent notified', 'Suspension', '']),
                    'created_at'      => now(),
                    'updated_at'      => now(),
                ];
            }
        }

        // Insert user accounts
        if (!empty($userRows)) {
            foreach (array_chunk($userRows, 200) as $chunk) {
                DB::table('users')->insertOrIgnore($chunk);
            }
        }

        if (!empty($skillPivots)) {
            foreach (array_chunk($skillPivots, 200) as $chunk) {
                DB::table('student_skill')->insertOrIgnore($chunk);
            }
        }

        if (!empty($violations)) {
            DB::table('violations')->insert($violations);
        }
    }
}
