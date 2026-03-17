<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use Illuminate\Http\Request;

class FacultyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Faculty::with('department')->get());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'first_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'last_name' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'employment_status' => 'required|string|max:255',
            'hire_date' => 'required|date',
            'email' => [
                'required',
                'email',
                'unique:faculties,email',
                'max:255',
                'regex:/^[a-zA-Z0-9._%+\-]+@pnc\.edu\.com$/',
            ],
            'contact_number' => 'nullable|string|max:255',
            'office_location' => 'nullable|string|max:255',
            'department_id' => 'required|exists:departments,id',
        ]);

        $faculty = Faculty::create($validatedData);

        // Load relationships to return a complete resource if needed, like department
        $faculty->load('department');

        return response()->json($faculty, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Faculty $faculty)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Faculty $faculty)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Faculty $faculty)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Faculty $faculty)
    {
        //
    }

    /**
     * Export a listing of the resource to CSV.
     */
    public function export()
    {
        $faculties = Faculty::with('department')->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=faculties.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = [
            'ID', 
            'First Name', 
            'Middle Name', 
            'Last Name', 
            'Position', 
            'Department', 
            'Employment Status', 
            'Hire Date', 
            'Email', 
            'Contact Number', 
            'Office Location'
        ];

        $callback = function() use($faculties, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($faculties as $faculty) {
                $row = [
                    $faculty->id,
                    $faculty->first_name,
                    $faculty->middle_name,
                    $faculty->last_name,
                    $faculty->position,
                    $faculty->department ? $faculty->department->department_name : 'N/A',
                    $faculty->employment_status,
                    $faculty->hire_date,
                    $faculty->email,
                    $faculty->contact_number,
                    $faculty->office_location
                ];
                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
