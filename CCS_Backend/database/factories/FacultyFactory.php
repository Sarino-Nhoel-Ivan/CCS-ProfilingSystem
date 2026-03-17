<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Faculty>
 */
class FacultyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'middle_name' => fake()->optional()->lastName(),
            'last_name' => fake()->lastName(),
            'position' => fake()->randomElement(['Instructor I', 'Instructor II', 'Assistant Professor', 'Associate Professor', 'Professor']),
            'employment_status' => fake()->randomElement(['Regular', 'Part-time', 'Contractual']),
            'hire_date' => fake()->dateTimeBetween('-10 years', 'now')->format('Y-m-d'),
            'email' => 'faculty' . fake()->unique()->numberBetween(1, 9999) . '.' . strtolower(fake()->lastName()) . '@pnc.edu.com',
            'contact_number' => fake()->phoneNumber(),
            'office_location' => 'Faculty Room ' . fake()->numberBetween(1, 5),
            'department_id' => \App\Models\Department::factory(),
        ];
    }
}
