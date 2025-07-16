<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskCommentController extends Controller
{
    // Get comments for a task
    public function index($taskId)
    {
        $task = Task::findOrFail($taskId);
        
        // Check if user has access to this task's workspace
        $hasAccess = \App\Models\WorkspaceMember::where('user_id', Auth::id())
                                          ->where('workspace_id', $task->workspace_id)
                                          ->exists();
        
        if (!$hasAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $comments = TaskComment::where('task_id', $taskId)
                              ->with('user')
                              ->orderBy('created_at', 'asc')
                              ->get();

        return response()->json($comments);
    }

    // Add comment to task
    public function store(Request $request, $taskId)
    {
        $task = Task::findOrFail($taskId);
        
        // Check if user has access to this task's workspace
        $hasAccess = \App\Models\WorkspaceMember::where('user_id', Auth::id())
                                          ->where('workspace_id', $task->workspace_id)
                                          ->exists();
        
        if (!$hasAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        $comment = TaskComment::create([
            'task_id' => $taskId,
            'user_id' => Auth::id(),
            'comment' => $request->comment,
        ]);

        $comment->load('user');

        // Log activity
        \App\Models\TaskActivity::logActivity(
            $taskId,
            Auth::id(),
            'comment_added',
            Auth::user()->name . ' added a comment'
        );

        // Create notifications for relevant users
        $commenterEmail = Auth::user()->email;
        $notifiedUsers = [];

        // 1. Notify assignee (if commenter is not the assignee)
        if ($task->assignee_id !== $commenterEmail) {
            $assignee = \App\Models\User::where('email', $task->assignee_id)->first();
            if ($assignee && !in_array($assignee->id, $notifiedUsers)) {
                Notification::createNotification(
                    $assignee->id,
                    'task_comment',
                    'New comment on your task',
                    Auth::user()->name . ' commented on "' . $task->title . '"',
                    $task->id
                );
                $notifiedUsers[] = $assignee->id;
            }
        }

        // 2. Notify task creator (if commenter is not the creator)
        if ($task->created_by && $task->created_by !== Auth::id()) {
            $creator = \App\Models\User::find($task->created_by);
            if ($creator && !in_array($creator->id, $notifiedUsers)) {
                Notification::createNotification(
                    $creator->id,
                    'task_comment',
                    'New comment on task you created',
                    Auth::user()->name . ' commented on "' . $task->title . '"',
                    $task->id
                );
                $notifiedUsers[] = $creator->id;
            }
        }

        return response()->json($comment, 201);
    }

    // Update comment
    public function update(Request $request, $commentId)
    {
        $comment = TaskComment::findOrFail($commentId);

        // Only comment author can edit
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'comment' => 'required|string|max:1000',
        ]);

        $comment->update([
            'comment' => $request->comment,
        ]);

        $comment->load('user');

        // Log activity
        \App\Models\TaskActivity::logActivity(
            $comment->task_id,
            Auth::id(),
            'comment_updated',
            Auth::user()->name . ' updated a comment'
        );

        return response()->json($comment);
    }

    // Delete comment
    public function destroy($commentId)
    {
        $comment = TaskComment::findOrFail($commentId);

        // Only comment author can delete
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $comment->delete();

        // Log activity  
        \App\Models\TaskActivity::logActivity(
            $comment->task_id,
            Auth::id(),
            'comment_deleted',
            Auth::user()->name . ' deleted a comment'
        );

        return response()->json(['message' => 'Comment deleted successfully']);
    }

    // Get activities for a task
    public function getActivities($taskId)
    {
        $task = Task::findOrFail($taskId);
        
        // Check if user has access to this task's workspace
        $hasAccess = \App\Models\WorkspaceMember::where('user_id', Auth::id())
                                        ->where('workspace_id', $task->workspace_id)
                                        ->exists();
        
        if (!$hasAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $activities = \App\Models\TaskActivity::where('task_id', $taskId)
                                            ->with('user')
                                            ->orderBy('created_at', 'desc')
                                            ->limit(50) // Last 50 activities
                                            ->get();

        return response()->json($activities);
    }

}