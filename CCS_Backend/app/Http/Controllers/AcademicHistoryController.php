<?php

namespace App\Http\Controllers;

use App\Models\AcademicHistory;
use App\Models\Student;
use Illuminate\Http\Request;

class AcademicHistoryController extends Controller
{
    public function index(Student $student)
    {
        return response()->json($student->academicHistories()->orderBy('school_year')->orderBy('semester')->get());
    }

    public function store(Request $request, Student $student)
    {
        $data = $request->validate([
            'school_name'      => 'nullable|string|max:255',
            'school_year'      => 'required|string|max:20',
            'semester'         => 'required|string|max:50',
            'gpa'              => 'nullable|numeric|min:1|max:5',
            'academic_standing'=> 'required|string|max:100',
            'total_units'      => 'required|integer|min:0',
            'completed_units'  => 'required|integer|min:0',
        ]);
        $record = $student->academicHistories()->create($data);
        return response()->json($record, 201);
    }

    public function update(Request $request, Student $student, AcademicHistory $academicHistory)
    {
        $data = $request->validate([
            'school_name'      => 'nullable|string|max:255',
            'school_year'      => 'required|string|max:20',
            'semester'         => 'required|string|max:50',
            'gpa'              => 'nullable|numeric|min:1|max:5',
            'academic_standing'=> 'required|string|max:100',
            'total_units'      => 'required|integer|min:0',
            'completed_units'  => 'required|integer|min:0',
        ]);
        $academicHistory->update($data);
        return response()->json($academicHistory);
    }

    public function destroy(Student $student, AcademicHistory $academicHistory)
    {
        $academicHistory->delete();
        return response()->json(null, 204);
    }
}
