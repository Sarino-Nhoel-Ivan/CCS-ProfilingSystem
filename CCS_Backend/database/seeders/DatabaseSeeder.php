<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed only the admin user.
     * Faculty and student accounts are created through registration.
     */
    public function run(): void
    {
        // Fixed admin account — only this email has admin access
        User::updateOrCreate(
            ['email' => 'admin@ccs.pnc.edu.com'],
            [
                'name'     => 'CCS Admin',
                'email'    => 'admin@ccs.pnc.edu.com',
                'password' => Hash::make('Admin@2026!'),
                'role'     => 'admin',
            ]
        );
    }
}
