<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /** GET /notifications — list recent (last 50), unread count */
    public function index()
    {
        $notifications = Notification::orderByDesc('created_at')->limit(50)->get();
        $unread        = Notification::where('is_read', false)->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unread,
        ]);
    }

    /** POST /notifications/{id}/read — mark one as read */
    public function markRead($id)
    {
        $n = Notification::findOrFail($id);
        $n->update(['is_read' => true, 'read_at' => now()]);
        return response()->json(['success' => true]);
    }

    /** POST /notifications/read-all — mark all as read */
    public function markAllRead()
    {
        Notification::where('is_read', false)->update(['is_read' => true, 'read_at' => now()]);
        return response()->json(['success' => true]);
    }

    /** DELETE /notifications/{id} — delete one */
    public function destroy($id)
    {
        Notification::findOrFail($id)->delete();
        return response()->json(null, 204);
    }

    /** DELETE /notifications — clear all */
    public function clearAll()
    {
        Notification::truncate();
        return response()->json(['success' => true]);
    }

    // ── Static helper called by other controllers ─────────────────────────────
    public static function push(string $type, string $title, string $message, array $data = []): void
    {
        try {
            Notification::create([
                'type'    => $type,
                'title'   => $title,
                'message' => $message,
                'data'    => $data,
                'is_read' => false,
            ]);
        } catch (\Throwable $e) {
            \Log::error('Notification push failed: ' . $e->getMessage());
        }
    }
}
