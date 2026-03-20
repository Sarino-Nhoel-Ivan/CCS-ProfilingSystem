<?php

namespace App\Http\Controllers;

use App\Models\Affiliation;
use App\Models\Student;
use Illuminate\Http\Request;

class AffiliationController extends Controller
{
    public function index(Student $student)
    {
        return response()->json($student->affiliations);
    }

    public function store(Request $request, Student $student)
    {
        $data = $request->validate([
            'organization_name' => 'required|string|max:255',
            'position'          => 'required|string|max:255',
            'date_joined'       => 'required|date',
            'date_ended'        => 'nullable|date|after_or_equal:date_joined',
            'status'            => 'required|string|max:50',
            'adviser_name'      => 'nullable|string|max:255',
        ]);
        $record = $student->affiliations()->create($data);
        return response()->json($record, 201);
    }

    public function update(Request $request, Student $student, Affiliation $affiliation)
    {
        $data = $request->validate([
            'organization_name' => 'required|string|max:255',
            'position'          => 'required|string|max:255',
            'date_joined'       => 'required|date',
            'date_ended'        => 'nullable|date|after_or_equal:date_joined',
            'status'            => 'required|string|max:50',
            'adviser_name'      => 'nullable|string|max:255',
        ]);
        $affiliation->update($data);
        return response()->json($affiliation);
    }

    public function destroy(Student $student, Affiliation $affiliation)
    {
        $affiliation->delete();
        return response()->json(null, 204);
    }
}
