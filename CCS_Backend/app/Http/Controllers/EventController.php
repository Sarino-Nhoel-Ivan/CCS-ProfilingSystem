<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index()
    {
        return response()->json(\App\Models\Event::orderBy('eventDate', 'desc')->get());
    }

    public function show($id)
    {
        return response()->json(\App\Models\Event::with(['students' => function($q) {
            $q->select('id', 'first_name', 'last_name', 'year_level', 'student_type');
        }])->findOrFail($id));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'eventName' => 'required|string|max:255',
            'description' => 'nullable|string',
            'eventType' => 'required|in:Academic,Sports,Cultural,CommunityService,Other',
            'eventDate' => 'required|date',
            'location' => 'required|string|max:255',
            'status' => 'required|in:Upcoming,Ongoing,Completed,Cancelled'
        ]);

        $event = \App\Models\Event::create($validated);
        NotificationController::push(
            'event_created',
            'New Event Scheduled',
            "Event \"{$validated['eventName']}\" ({$validated['eventType']}) has been scheduled for {$validated['location']}.",
            ['event_id' => $event->id]
        );
        return response()->json($event, 201);
    }

    public function update(Request $request, $id)
    {
        $event = \App\Models\Event::findOrFail($id);

        $validated = $request->validate([
            'eventName' => 'required|string|max:255',
            'description' => 'nullable|string',
            'eventType' => 'required|in:Academic,Sports,Cultural,CommunityService,Other',
            'eventDate' => 'required|date',
            'location' => 'required|string|max:255',
            'status' => 'required|in:Upcoming,Ongoing,Completed,Cancelled'
        ]);

        $oldStatus = $event->status;
        $event->update($validated);

        // Only notify on status change
        if ($oldStatus !== $validated['status']) {
            NotificationController::push(
                'event_status_changed',
                'Event Status Changed',
                "Event \"{$validated['eventName']}\" status changed from {$oldStatus} to {$validated['status']}.",
                ['event_id' => $event->id, 'old_status' => $oldStatus, 'new_status' => $validated['status']]
            );
        }
        return response()->json($event);
    }

    public function destroy($id)
    {
        $event = \App\Models\Event::findOrFail($id);
        $event->delete();
        return response()->json(null, 204);
    }
}
