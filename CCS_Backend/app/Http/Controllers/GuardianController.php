<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Guardian;
use Illuminate\Http\Request;

class GuardianController extends Controller
{
    public function index(Student $student)
    {
        return response()->json($student->guardians);
    }

    public function store(Request $request, Student $student)
    {
        $data = $request->validate([
            'full_name'      => 'required|string|max:255',
            'relationship'   => 'required|string|max:100',
            'occupation'     => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'email'          => 'nullable|email|max:255',
            'address'        => 'nullable|string|max:500',
        ]);
        $guardian = $student->guardians()->create($data);
        return response()->json($guardian, 201);
    }

    public function update(Request $request, Student $student, Guardian $guardian)
    {
        $data = $request->validate([
            'full_name'      => 'required|string|max:255',
            'relationship'   => 'required|string|max:100',
            'occupation'     => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:50',
            'email'          => 'nullable|email|max:255',
            'address'        => 'nullable|string|max:500',
        ]);
        $guardian->update($data);
        return response()->json($guardian);
    }

    public function destroy(Student $student, Guardian $guardian)
    {
        $guardian->delete();
        return response()->json(null, 204);
    }
}
