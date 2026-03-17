<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $yearLevel = fake()->randomElement(['1st Year', '2nd Year', '3rd Year', '4th Year']);
        $program   = fake()->randomElement(['Information Technology', 'Computer Science']);
        $yearPrefix  = ['1st Year' => '1', '2nd Year' => '2', '3rd Year' => '3', '4th Year' => '4'][$yearLevel];
        $programCode = $program === 'Information Technology' ? 'IT' : 'CS';
        $section = $yearPrefix . $programCode . '-' . fake()->randomElement(['A', 'B', 'C', 'D', 'E']);

        return [
            'student_number' => fake()->randomElement(['22', '23', '24']) . fake()->numerify('#####'),
            'first_name' => fake()->firstName(),
            'middle_name' => fake()->optional()->lastName(),
            'last_name' => fake()->lastName(),
            'suffix' => fake()->optional(0.1)->suffix(),
            'gender' => fake()->randomElement(['Male', 'Female']),
            'birth_date' => fake()->dateTimeBetween('-25 years', '-18 years')->format('Y-m-d'),
            'place_of_birth' => fake()->city() . ', ' . fake()->state(),
            'nationality' => 'Filipino',
            'civil_status' => fake()->randomElement(['Single', 'Married']),
            'religion' => fake()->randomElement(['Roman Catholic', 'Iglesia ni Cristo', 'Islam', 'Protestant']),
            'email' => fake()->unique()->safeEmail(),
            'contact_number' => fake()->phoneNumber(),
            'alternate_contact_number' => fake()->optional()->phoneNumber(),
            'street' => fake()->streetAddress(),
            'barangay' => 'Barangay ' . fake()->numberBetween(1, 100),
            'city' => fake()->city(),
            'province' => fake()->state(),
            'zip_code' => fake()->postcode(),
            'year_level' => $yearLevel,
            'section' => $section,
            'program' => $program,
            'student_type' => fake()->randomElement([
                'Regular', 'Irregular', 'Returnee', 'Shiftee', 'Transferee',
                'Graduated', 'Dropped', 'LOA', 'Suspended',
            ]),
            'enrollment_status' => fake()->randomElement(['Enrolled', 'Not Enrolled']),
            'date_enrolled' => fake()->dateTimeBetween('-4 years', 'now')->format('Y-m-d'),
            'course_id' => \App\Models\Course::factory(),
            'department_id' => \App\Models\Department::factory(),
        ];
    }
}
