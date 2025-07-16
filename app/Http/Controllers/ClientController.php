<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\WorkspaceMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $workspaceId = $request->get('workspace_id');
        
        if (!$workspaceId) {
            return response()->json(['error' => 'Workspace ID required'], 400);
        }

        // Check workspace access
        $hasAccess = WorkspaceMember::where('user_id', Auth::id())
                              ->where('workspace_id', $workspaceId)
                              ->exists();
        
        if (!$hasAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $clients = Client::byWorkspace($workspaceId)
                        ->byType($request->get('type'))
                        ->when($request->get('status'), function($query, $status) {
                            if ($status === 'active') {
                                return $query->active();
                            }
                            return $query->where('status', $status);
                        })
                        ->when($request->get('search'), function($query, $search) {
                            return $query->where(function($q) use ($search) {
                                $q->where('name', 'like', "%{$search}%")
                                  ->orWhere('email', 'like', "%{$search}%")
                                  ->orWhere('phone_number', 'like', "%{$search}%");
                            });
                        })
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json($clients);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'workspace_id' => 'required|exists:workspaces,id',
            'customer_type' => 'required|in:personal,business',
            'name' => 'required|string|max:255',
            'phone_number' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'address' => 'required|string|max:500',
            'platform' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'joined_date' => 'nullable|date',
            'status' => 'nullable|in:active,inactive,churned',
            'contract_type' => 'nullable|in:one-off,ongoing',
            'client_stage' => 'nullable|in:prospect,client',
        ]);

        // Check workspace access  
        $hasAccess = WorkspaceMember::where('user_id', Auth::id())
                              ->where('workspace_id', $validatedData['workspace_id'])
                              ->exists();
        
        if (!$hasAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validatedData['created_by'] = Auth::id();
        $validatedData['status'] = $validatedData['status'] ?? 'active';

        $client = Client::create($validatedData);

        return response()->json($client, 201);
    }

    public function show($id)
    {
        $client = Client::findOrFail($id);
        
        // Check workspace access
        $hasAccess = WorkspaceMember::where('user_id', Auth::id())
                              ->where('workspace_id', $client->workspace_id)
                              ->exists();
        
        if (!$hasAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($client);
    }

    public function update(Request $request, $id)
    {
        $client = Client::findOrFail($id);
        
        // Check workspace access
        $hasAccess = WorkspaceMember::where('user_id', Auth::id())
                              ->where('workspace_id', $client->workspace_id)
                              ->exists();
        
        if (!$hasAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validatedData = $request->validate([
            'customer_type' => 'sometimes|in:personal,business',
            'name' => 'sometimes|string|max:255',
            'phone_number' => 'sometimes|string|max:20',
            'email' => 'sometimes|email|max:255',
            'address' => 'sometimes|string|max:500',
            'platform' => 'nullable|string|max:255',
            'industry' => 'nullable|string|max:255',
            'joined_date' => 'nullable|date',
            'status' => 'sometimes|in:active,inactive,churned',
            'contract_type' => 'nullable|in:one-off,ongoing',
            'client_stage' => 'sometimes|in:prospect,client',
        ]);

        $client->update($validatedData);

        return response()->json($client);
    }

    public function destroy($id)
    {
        $client = Client::findOrFail($id);
        
        // Check workspace access
        $hasAccess = WorkspaceMember::where('user_id', Auth::id())
                              ->where('workspace_id', $client->workspace_id)
                              ->exists();
        
        if (!$hasAccess) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $client->delete();

        return response()->json(['message' => 'Client deleted successfully']);
    }
}