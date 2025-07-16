<?php

namespace App\Http\Controllers;

use App\Models\CalendarNote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class CalendarNoteController extends Controller
{
    // Get notes for current user (multiple dates)
    public function index(Request $request)
    {
        $startDate = $request->get('start_date');
        $endDate = $request->get('end_date');
        
        $query = CalendarNote::where('user_id', Auth::id());
        
        if ($startDate && $endDate) {
            $query->whereBetween('date', [$startDate, $endDate]);
        }
        
        $notes = $query->get();
        
        // Manual key mapping untuk debug
        $notesMap = [];
        foreach ($notes as $note) {
            $notesMap[$note->date->format('Y-m-d')] = [
                'id' => $note->id,
                'note' => $note->note,
                'date' => $note->date->format('Y-m-d'),
            ];
        }
        
        return response()->json($notesMap);
    }

    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'note' => 'required|string|max:1000',
        ]);

        $existingNote = CalendarNote::where('user_id', Auth::id())
                                    ->where('date', $request->date)
                                    ->first();

        $note = CalendarNote::updateOrCreate(
            [
                'user_id' => Auth::id(),
                'date' => $request->date,
            ],
            [
                'note' => $request->note,
            ]
        );

        // Log activity
        if ($existingNote) {
            // Updated existing note
            \App\Models\TaskActivity::logActivity(
                null, // No specific task
                Auth::id(),
                'note_updated',
                Auth::user()->name . ' updated a note for ' . \Carbon\Carbon::parse($request->date)->format('M j, Y'),
                [
                    'date' => $request->date,
                    'old_note' => $existingNote->note,
                    'new_note' => $request->note
                ]
            );
        } else {
            // Created new note
            \App\Models\TaskActivity::logActivity(
                null, // No specific task
                Auth::id(),
                'note_created',
                Auth::user()->name . ' added a note for ' . \Carbon\Carbon::parse($request->date)->format('M j, Y'),
                [
                    'date' => $request->date,
                    'note' => $request->note
                ]
            );
        }

        return response()->json($note, 201);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $note = CalendarNote::where('user_id', Auth::id())
                            ->where('date', $request->date)
                            ->first();

        if ($note) {
            // Log activity before deletion
            \App\Models\TaskActivity::logActivity(
                null, // No specific task
                Auth::id(),
                'note_deleted',
                Auth::user()->name . ' deleted a note for ' . \Carbon\Carbon::parse($request->date)->format('M j, Y'),
                [
                    'date' => $request->date,
                    'deleted_note' => $note->note
                ]
            );

            $note->delete();
        }

        return response()->json(['message' => 'Note deleted successfully']);
    }
}