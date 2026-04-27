<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SectionController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Section::with('course')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'section_name' => 'required|string|max:50|unique:sections,section_name',
            'year_level'   => 'required|string|max:20',
            'semester'     => 'required|string|max:20',
            'course_id'    => 'nullable|exists:courses,id',
        ]);

        $section = \App\Models\Section::create($validated);
        return response()->json($section->load('course'), 201);
    }
}
