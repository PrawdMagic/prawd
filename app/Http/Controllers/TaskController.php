<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Workspace;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Task::query();

        // Apply filters
        $query->byCategory($request->get('category'))
              ->byStatus($request->get('status'))
              ->byPriority($request->get('priority'))
              ->byChannel($request->get('channel'))
              ->search($request->get('search'));

        if ($request->get('workspace_id')) {
            $query->where('workspace_id', $request->get('workspace_id'));
        }

        // Apply sorting
        $sortBy = $request->get('sortBy', 'updated_at');
        $sortOrder = $request->get('sortOrder', 'desc');

        // Handle special sorting cases
        if ($sortBy === 'assignee') {
            $query->orderBy('assignee_name', $sortOrder);
        } elseif ($sortBy === 'dueDate') {
            $query->orderBy('due_date', $sortOrder);
        } elseif ($sortBy === 'createdAt') {
            $query->orderBy('created_at', $sortOrder);
        } elseif ($sortBy === 'updatedAt') {
            $query->orderBy('updated_at', $sortOrder);
        } elseif ($sortBy === 'priority') {
            // Custom priority sorting
            $query->orderByRaw("CASE 
                WHEN priority = 'urgent' THEN 4 
                WHEN priority = 'high' THEN 3 
                WHEN priority = 'medium' THEN 2 
                WHEN priority = 'low' THEN 1 
                ELSE 0 END " . ($sortOrder === 'desc' ? 'DESC' : 'ASC'));
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $tasks = $query->with('client')->get();

        return response()->json($tasks);
    }

    public function store(Request $request): JsonResponse
    {
        // DEBUG: Log user info
        $user = Auth::user();
        Log::info('Creating task - User info', [
            'user_id' => $user ? $user->id : 'null',
            'user_name' => $user ? $user->name : 'null',
            'user_email' => $user ? $user->email : 'null'
        ]);

        $validatedData = $request->validate([
            'workspace_id' => 'required|exists:workspaces,id',
            'category' => 'required|in:content,project,sales',
            'contentTarget' => 'nullable|in:in-house,client',
            'selectedClient' => 'nullable|exists:clients,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'tags' => 'nullable|array',
            'assignee.id' => 'required|string',
            'assignee.name' => 'required|string',
            'dueDate' => 'required|date',
            'followUpDate' => 'nullable|date',
            'publishDate' => 'nullable|date',
            'contentType' => 'nullable|string',
            'platforms' => 'nullable|array',
            'channel' => 'nullable|string',
            'parentProject' => 'nullable|string',
            'projectCategory' => 'nullable|string',
            'contact' => 'nullable|string',
            'salesActivity' => 'nullable|string',
            'dealStage' => 'nullable|string',
            'dealValue' => 'nullable|string',
            'dealCurrency' => 'nullable|in:IDR,USD,SGD',
            'notes' => 'nullable|string',
            'collaborators' => 'nullable|integer',
            'attachments' => 'nullable|integer',
        ]);

        // Set category defaults
        if ($validatedData['category'] === 'content') {
            $validatedData['channel'] = $validatedData['platforms'][0] ?? 'internal';
        } elseif ($validatedData['category'] === 'project') {
            $validatedData['publishDate'] = $validatedData['dueDate'];
        } elseif ($validatedData['category'] === 'sales') {
            $validatedData['publishDate'] = $validatedData['followUpDate'] ?? $validatedData['dueDate'];
        }

        // Handle assignee data
        if (isset($validatedData['assignee'])) {
            $validatedData['assignee_id'] = $validatedData['assignee']['id'];
            $validatedData['assignee_name'] = $validatedData['assignee']['name'];
            unset($validatedData['assignee']);
        }

        // Workspace authorization check
        $workspaceId = $validatedData['workspace_id'];
        $hasAccess = \App\Models\WorkspaceMember::where('user_id', $user->id)
                                        ->where('workspace_id', $workspaceId)
                                        ->exists();

        if (!$hasAccess) {
            return response()->json(['error' => 'You are not a member of this workspace'], 403);
        }

        // Prepare data
        $dbData = [
            'category' => $validatedData['category'],
            'content_target' => $validatedData['contentTarget'] ?? 'in-house',
            'title' => $validatedData['title'],
            'description' => $validatedData['description'] ?? null,
            'status' => $validatedData['status'] ?? null,
            'priority' => $validatedData['priority'] ?? null,
            'tags' => $validatedData['tags'] ?? null,
            'assignee_id' => $validatedData['assignee_id'],
            'assignee_name' => $validatedData['assignee_name'],
            'due_date' => $validatedData['dueDate'],
            'follow_up_date' => $validatedData['followUpDate'] ?? null,
            'publish_date' => $validatedData['publishDate'] ?? null,
            'content_type' => $validatedData['contentType'] ?? null,
            'platforms' => $validatedData['platforms'] ?? null,
            'channel' => $validatedData['channel'] ?? 'internal',
            'parent_project' => $validatedData['parentProject'] ?? null,
            'project_category' => $validatedData['projectCategory'] ?? null,
            'contact' => $validatedData['contact'] ?? null,
            'sales_activity' => $validatedData['salesActivity'] ?? null,
            'deal_stage' => $validatedData['dealStage'] ?? null,
            'deal_value' => $validatedData['dealValue'] ?? null,
            'deal_currency' => $validatedData['dealCurrency'] ?? 'IDR',
            'notes' => $validatedData['notes'] ?? null,
            'collaborators' => $validatedData['collaborators'] ?? 1,
            'attachments' => $validatedData['attachments'] ?? 0,
            'workspace_id' => $workspaceId,
            'created_by' => $user ? $user->id : null, // FIX: Pastikan dapat user id
            'client_id' => $validatedData['selectedClient'] ?? null,
        ];

        // DEBUG: Log final data
        Log::info('Task creation data', [
            'workspace_id' => $dbData['workspace_id'],
            'created_by' => $dbData['created_by'],
            'title' => $dbData['title']
        ]);

        $task = Task::create($dbData);

        // Log task creation activity
        \App\Models\TaskActivity::logActivity(
            $task->id,
            $user->id,
            'task_created',
            $user->name . ' created this task'
        );

        // Create notification for assignee (if different from creator)
        if ($validatedData['assignee_id'] !== $user->email) {
            $assignee = \App\Models\User::where('email', $validatedData['assignee_id'])->first();
            if ($assignee) {
                \App\Models\Notification::createNotification(
                    $assignee->id,
                    'task_assigned',
                    'New task assigned to you',
                    $user->name . ' assigned you to "' . $validatedData['title'] . '"',
                    $task->id
                );
            }
        }

        return response()->json($task, 201);
    }
    
    public function show(Task $task): JsonResponse
    {
        return response()->json($task->load('client'));
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        // ADD SECURITY CHECK
        $user = Auth::user();
        
        // Check if user has access to this task's workspace
        $hasAccess = \App\Models\WorkspaceMember::where('user_id', $user->id)
                                        ->where('workspace_id', $task->workspace_id)
                                        ->exists();
        
        if (!$hasAccess) {
            return response()->json(['error' => 'Unauthorized - You cannot edit this task'], 403);
        }

        $validatedData = $request->validate([
            'category' => 'sometimes|in:content,project,sales',
            'contentTarget' => 'sometimes|in:in-house,client',
            'selectedClient' => 'nullable|exists:clients,id',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'tags' => 'nullable|array',
            'assignee.id' => 'sometimes|string',
            'assignee.name' => 'sometimes|string',
            'dueDate' => 'sometimes|date',
            'followUpDate' => 'nullable|date',
            'publishDate' => 'nullable|date',
            'contentType' => 'nullable|string',
            'platforms' => 'nullable|array',
            'channel' => 'nullable|string',
            'parentProject' => 'nullable|string',
            'projectCategory' => 'nullable|string',
            'contact' => 'nullable|string',
            'salesActivity' => 'nullable|string',
            'dealStage' => 'nullable|string',
            'dealValue' => 'nullable|string',
            'dealCurrency' => 'nullable|in:IDR,USD,SGD',
            'notes' => 'nullable|string',
            'collaborators' => 'nullable|integer',
            'attachments' => 'nullable|integer',
        ]);

        // Handle assignee data
        if (isset($validatedData['assignee'])) {
            $validatedData['assignee_id'] = $validatedData['assignee']['id'];
            $validatedData['assignee_name'] = $validatedData['assignee']['name'];
            unset($validatedData['assignee']);
        }

        // Convert camelCase to snake_case for database
        $fieldMapping = [
            'dueDate' => 'due_date',
            'followUpDate' => 'follow_up_date', 
            'publishDate' => 'publish_date',
            'contentType' => 'content_type',
            'contentTarget' => 'content_target',
            'selectedClient' => 'client_id',
            'parentProject' => 'parent_project',
            'projectCategory' => 'project_category',
            'salesActivity' => 'sales_activity',
            'dealStage' => 'deal_stage',
            'dealValue' => 'deal_value',
        ];

        $dbData = [];
        foreach ($validatedData as $key => $value) {
            $dbKey = $fieldMapping[$key] ?? $key;
            $dbData[$dbKey] = $value;
        }

        // IMPORTANT: Get original values BEFORE update
        $originalValues = $task->getAttributes();

        $task->update($dbData);

        // Auto promote prospect to client when deal is closed
        if ($task->category === 'sales' && isset($dbData['deal_stage']) && $dbData['deal_stage'] === 'closed') {
            // Find client by contact name
            $client = \App\Models\Client::where('name', $task->contact)
                                        ->where('workspace_id', $task->workspace_id)
                                        ->where('client_stage', 'prospect')
                                        ->first();
            
            if ($client) {
                $client->update(['client_stage' => 'client']);
                
                // Log the promotion
                \App\Models\TaskActivity::logActivity(
                    $task->id,
                    Auth::id(),
                    'client_promoted',
                    Auth::user()->name . ' closed deal - ' . $client->name . ' promoted to active client',
                    ['client_name' => $client->name, 'from' => 'prospect', 'to' => 'client']
                );
            }
        }

        // Log task update activity
        $changes = [];
        foreach ($dbData as $key => $newValue) {
            $oldValue = $originalValues[$key] ?? null;
            if ($oldValue != $newValue) {
                $changes[$key] = ['old' => $oldValue, 'new' => $newValue];
            }
        }

        if (!empty($changes)) {
            $description = Auth::user()->name . ' updated the task';
            $action = 'task_updated';
            
            // Special handling for status changes
            if (isset($changes['status'])) {
                $description = Auth::user()->name . ' changed status from "' . 
                            ($changes['status']['old'] ?? 'Not Set') . '" to "' . 
                            $changes['status']['new'] . '"';
                $action = 'status_changed'; // Use specific action
            }
            
            \App\Models\TaskActivity::logActivity(
                $task->id,
                Auth::id(),
                $action,
                $description,
                $changes
            );

            // Create notification for status changes (if task is assigned to someone else)
            if (isset($changes['status']) && $task->assignee_id !== Auth::user()->email) {
                $assignee = \App\Models\User::where('email', $task->assignee_id)->first();
                if ($assignee) {
                    \App\Models\Notification::createNotification(
                        $assignee->id,
                        'status_changed',
                        'Task status updated',
                        Auth::user()->name . ' changed status of "' . $task->title . '" to ' . $changes['status']['new'],
                        $task->id
                    );
                }
            }
        }

        return response()->json($task);
    }

    public function destroy(Task $task): JsonResponse
    {
        $task->delete();

        return response()->json(['message' => 'Task deleted successfully']);
    }

    public function stats(Request $request): JsonResponse
    {
        $user = Auth::user();
        $workspaceId = $request->get('workspace_id'); // NEW: Get workspace filter
        
        if ($workspaceId) {
            // Filter by specific workspace
            $hasAccess = DB::table('workspace_members')
                        ->where('user_id', $user->id)
                        ->where('workspace_id', $workspaceId)
                        ->exists();
            
            if (!$hasAccess) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }
            
            $baseQuery = Task::where('workspace_id', $workspaceId);
        } else {
            // Original logic - all accessible workspaces
            $accessibleWorkspaceIds = DB::table('workspace_members')
                                ->where('user_id', $user->id)
                                ->pluck('workspace_id')
                                ->toArray();
            
            if (empty($accessibleWorkspaceIds)) {
                return response()->json([
                    'total' => 0,
                    'draft' => 0,
                    'inProgress' => 0,
                    'scheduled' => 0,
                    'published' => 0,
                    'highPriority' => 0,
                    'overdue' => 0,
                    'dueToday' => 0,
                    'totalCollaborators' => 0,
                    'totalAttachments' => 0,
                ]);
            }
            
            $baseQuery = Task::whereIn('workspace_id', $accessibleWorkspaceIds);
        }
        
        // Rest stays the same - calculation logic
        $total = $baseQuery->count();
        $draft = (clone $baseQuery)->whereIn('status', ['draft', 'todo', 'lead', 'idea'])->count();
        $inProgress = (clone $baseQuery)->whereIn('status', ['in-progress', 'dikerjakan', 'ongoing', 'qualified', 'review'])->count();
        $scheduled = (clone $baseQuery)->whereIn('status', ['scheduled', 'planned', 'confirmed', 'proposal'])->count();
        $published = (clone $baseQuery)->whereIn('status', ['published', 'done', 'completed', 'selesai', 'closed'])->count();
        $highPriority = (clone $baseQuery)->whereIn('priority', ['high', 'urgent'])->count();
        
        $overdue = (clone $baseQuery)->where('due_date', '<', now())
                                    ->whereNotIn('status', ['published', 'done', 'completed', 'selesai', 'closed'])
                                    ->count();
        
        $dueToday = (clone $baseQuery)->whereDate('due_date', today())->count();

        return response()->json([
            'total' => $total,
            'draft' => $draft,
            'inProgress' => $inProgress,
            'scheduled' => $scheduled,
            'published' => $published,
            'highPriority' => $highPriority,
            'overdue' => $overdue,
            'dueToday' => $dueToday,
            'totalCollaborators' => (clone $baseQuery)->sum('collaborators'),
            'totalAttachments' => (clone $baseQuery)->sum('attachments'),
        ]);
    }

    public function getWorkspaceActivities(Request $request): JsonResponse
    {
        $user = Auth::user();
        $workspaceId = $request->get('workspace_id');
        
        if ($workspaceId) {
            // Get all activities including notes
            $activities = \App\Models\TaskActivity::whereIn('action', [
                'task_created', 'task_updated', 'status_changed', 'member_joined',
                'note_created', 'note_updated', 'note_deleted' // ✅ TAMBAH NOTES ACTIVITIES
            ])
            ->with('user', 'task')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->filter(function($activity) use ($workspaceId, $user) {
                // Include workspace activities
                if (is_null($activity->task_id)) {
                    $metadata = $activity->metadata;
                    
                    // Workspace-specific activities (member_joined)
                    if (isset($metadata['workspace_id'])) {
                        return $metadata['workspace_id'] == $workspaceId;
                    }
                    
                    // Notes activities - include if user is workspace member
                    if (in_array($activity->action, ['note_created', 'note_updated', 'note_deleted'])) {
                        $hasAccess = \App\Models\WorkspaceMember::where('user_id', $user->id)
                                                        ->where('workspace_id', $workspaceId)
                                                        ->exists();
                        return $hasAccess;
                    }
                    
                    return false;
                }
                // Include task activities
                return $activity->task && $activity->task->workspace_id == $workspaceId;
            })
            ->take(15);
        } else {
            $activities = collect([]);
        }

        return response()->json($activities->values());
    }

}