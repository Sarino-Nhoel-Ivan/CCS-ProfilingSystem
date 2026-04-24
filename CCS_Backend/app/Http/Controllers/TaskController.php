<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Student;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    // GET /students/{student}/tasks  — list tasks for a student
    public function index(Student $student)
    {
        return response()->json(
            $student->tasks()->with('faculty')->orderBy('due_date')->get()
        );
    }

    // GET /tasks?faculty_id=X  — list all tasks assigned by a faculty
    public function facultyTasks(Request $request)
    {
        $facultyId = $request->query('faculty_id');
        $query = Task::with(['student:id,first_name,last_name,student_number,section,profile_photo'])
                     ->orderBy('due_date');

        if ($facultyId) {
            $query->where('faculty_id', $facultyId);
        }

        return response()->json($query->get());
    }

    // POST /students/{student}/tasks
    public function store(Request $request, Student $student)
    {
        $data = $request->validate([
            'subject'     => 'required|string|max:100',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
            'priority'    => 'in:Low,Medium,High',
            'faculty_id'  => 'nullable|exists:faculties,id',
        ]);

        $task = $student->tasks()->create($data);
        return response()->json($task->load('faculty'), 201);
    }

    // PUT /students/{student}/tasks/{task}
    public function update(Request $request, Student $student, Task $task)
    {
        abort_if($task->student_id !== $student->id, 403);

        $data = $request->validate([
            'subject'     => 'sometimes|string|max:100',
            'title'       => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
            'priority'    => 'in:Low,Medium,High',
            'done'        => 'boolean',
        ]);

        $task->update($data);
        return response()->json($task->fresh('faculty'));
    }

    // DELETE /students/{student}/tasks/{task}
    public function destroy(Student $student, Task $task)
    {
        abort_if($task->student_id !== $student->id, 403);
        $task->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // POST /tasks/bulk  — assign the same task to every student in a section
    public function bulkStore(Request $request)
    {
        $data = $request->validate([
            'section'     => 'required|string|max:100',
            'subject'     => 'required|string|max:100',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
            'priority'    => 'in:Low,Medium,High',
            'faculty_id'  => 'nullable|exists:faculties,id',
        ]);

        $students = Student::where('section', $data['section'])->get();

        if ($students->isEmpty()) {
            return response()->json(['message' => 'No students found in this section.'], 422);
        }

        $taskData = collect($data)->except('section')->toArray();
        foreach ($students as $student) {
            $student->tasks()->create($taskData);
        }

        return response()->json([
            'message' => "Task assigned to {$students->count()} student(s) in section {$data['section']}.",
            'count'   => $students->count(),
        ], 201);
    }
}
