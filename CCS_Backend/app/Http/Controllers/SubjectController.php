<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index()
    {
        return response()->json(
            \App\Models\Subject::orderBy('program')
                ->orderByRaw("FIELD(year_level,'1st Year','2nd Year','3rd Year','4th Year')")
                ->orderByRaw("FIELD(semester,'1st Semester','2nd Semester')")
                ->orderBy('subject_code')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_code'      => 'required|string|unique:subjects',
            'descriptive_title' => 'required|string',
            'lab_units'         => 'required|integer|min:0',
            'lec_units'         => 'required|integer|min:0',
            'pre_requisites'    => 'nullable|string',
            'program'           => 'nullable|string|max:10',
            'year_level'        => 'nullable|string|max:20',
            'semester'          => 'nullable|string|max:20',
        ]);
        
        $validated['total_units'] = $validated['lab_units'] + $validated['lec_units'];
        $subject = \App\Models\Subject::create($validated);
        return response()->json($subject, 201);
    }

    public function show($id)
    {
        $subject = \App\Models\Subject::findOrFail($id);
        return response()->json($subject);
    }

    public function update(Request $request, $id)
    {
        $subject = \App\Models\Subject::findOrFail($id);

        $validated = $request->validate([
            'subject_code'      => 'required|string|unique:subjects,subject_code,' . $subject->id,
            'descriptive_title' => 'required|string',
            'lab_units'         => 'required|integer|min:0',
            'lec_units'         => 'required|integer|min:0',
            'pre_requisites'    => 'nullable|string',
            'program'           => 'nullable|string|max:10',
            'year_level'        => 'nullable|string|max:20',
            'semester'          => 'nullable|string|max:20',
        ]);
        
        $validated['total_units'] = $validated['lab_units'] + $validated['lec_units'];
        $subject->update($validated);
        return response()->json($subject);
    }

    public function destroy($id)
    {
        $subject = \App\Models\Subject::findOrFail($id);
        $subject->delete();
        return response()->json(null, 204);
    }
}
