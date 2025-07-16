<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\User;
use App\Models\TaskActivity;
use App\Models\WorkspaceMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;


class WorkspaceController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        $workspaces = Workspace::whereHas('members', function($query) use ($userId) {
            $query->where('user_id', $userId);
        })->with('owner', 'members')->get();
        
        return response()->json($workspaces);
    }

    public function show($id)
    {
        $workspace = Workspace::with('owner', 'members', 'tasks')->findOrFail($id);
        
        // Check if user is member
        if (!$workspace->members->contains(Auth::id())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        return response()->json($workspace);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $workspace = Workspace::create([
            'name' => $request->name,
            'description' => $request->description,
            'owner_id' => Auth::id(),
        ]);

        // Add creator as admin
        $workspace->members()->attach(Auth::id(), ['role' => 'admin']);

        return response()->json($workspace->load('owner', 'members'));
    }

    public function inviteMember(Request $request, $workspaceId)
    {
        $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:' . \App\Models\WorkspaceMember::getValidRolesString(),
            'member_type' => 'required|in:internal,external', 
            'external_category' => 'nullable|in:freelance,outsourced,vendor', 
            'notes' => 'nullable|string|max:500',     
        ]);

        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check if user is admin or owner
        $userRole = $workspace->members()->where('user_id', Auth::id())->first()->pivot->role;
        if (!in_array($userRole, ['owner', 'admin'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if user already exists
        $existingUser = User::where('email', $request->email)->first();
        
        if ($existingUser) {
            // User exists - check if already member
            if ($workspace->members->contains($existingUser->id)) {
                return response()->json(['error' => 'User already in workspace'], 400);
            }
            
            // Add directly to workspace
            $workspace->members()->attach($existingUser->id, [
                'role' => $request->role,
                'member_type' => $request->member_type,
                'external_category' => $request->external_category,
                'notes' => $request->notes,
            ]);

            \App\Models\TaskActivity::create([
                'task_id' => null,
                'user_id' => Auth::id(),
                'action' => 'member_joined',
                'description' => Auth::user()->name . ' added ' . $existingUser->name . ' to the workspace',
                'metadata' => [
                    'workspace_id' => $workspace->id,
                    'workspace_name' => $workspace->name,
                    'invited_user' => $existingUser->name,
                    'role' => $request->role
                ]
            ]);

            return response()->json(['message' => 'Member added successfully']);
        } else {
            // User doesn't exist - create invitation
            
            // Check if invitation already exists
            $existingInvitation = \App\Models\WorkspaceInvitation::where('workspace_id', $workspaceId)
                ->where('email', $request->email)
                ->where('status', 'pending')
                ->first();
                
            if ($existingInvitation) {
                return response()->json(['error' => 'Invitation already sent to this email'], 400);
            }

            // Create invitation
            $invitation = \App\Models\WorkspaceInvitation::create([
                'workspace_id' => $workspaceId,
                'invited_by' => Auth::id(),
                'email' => $request->email,
                'role' => $request->role,
                'member_type' => $request->member_type,
                'external_category' => $request->external_category,
                'notes' => $request->notes,
                'token' => \App\Models\WorkspaceInvitation::generateToken(),
                'expires_at' => now()->addDays(7), // 7 days expiry
            ]);

            // Send email invitation
            try {
                Mail::to($request->email)->send(new \App\Mail\WorkspaceInvitationMail($invitation));
                
                \App\Models\TaskActivity::create([
                    'task_id' => null,
                    'user_id' => Auth::id(),
                    'action' => 'invitation_sent',
                    'description' => Auth::user()->name . ' sent invitation email to ' . $request->email,
                    'metadata' => [
                        'workspace_id' => $workspace->id,
                        'workspace_name' => $workspace->name,
                        'invited_email' => $request->email,
                        'role' => $request->role,
                        'email_sent' => true
                    ]
                ]);
                
                $emailSent = true;
            } catch (\Exception $e) {
                Log::error('Failed to send invitation email: ' . $e->getMessage());
                $emailSent = false;
            }

            \App\Models\TaskActivity::create([
                'task_id' => null,
                'user_id' => Auth::id(),
                'action' => 'member_invited',
                'description' => Auth::user()->name . ' sent invitation to ' . $request->email,
                'metadata' => [
                    'workspace_id' => $workspace->id,
                    'workspace_name' => $workspace->name,
                    'invited_email' => $request->email,
                    'role' => $request->role
                ]
            ]);

            return response()->json([
                'message' => $emailSent ? 'Invitation email sent successfully' : 'Invitation created (email failed)', 
                'invitation_token' => $invitation->token,
                'invitation_link' => url("/invitation/{$invitation->token}"),
                'invited_email' => $request->email,
                'email_sent' => $emailSent,
                'requires_manual_sharing' => !$emailSent
            ]);
        }
    }

    public function removeMember($workspaceId, $userIdentifier)
    {
        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check if user is admin
        $userRole = $workspace->members()->where('user_id', Auth::id())->first()->pivot->role;
        if ($userRole !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Find user by email (since frontend sends email as ID)
        $userToRemove = User::where('email', $userIdentifier)->first();
        if (!$userToRemove) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Remove from workspace
        $workspace->members()->detach($userToRemove->id);

        return response()->json(['message' => 'Member removed successfully']);
    }

    public function getMembers($workspaceId)
    {
        $workspace = Workspace::with(['members' => function($query) {
            $query->select('users.*', 'workspace_members.role', 'workspace_members.member_type', 'workspace_members.external_category', 'workspace_members.notes');
        }])->findOrFail($workspaceId);
        
        // Check if user is member
        if (!$workspace->members->contains(Auth::id())) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $members = $workspace->members->map(function ($member) {
            return [
                'id' => $member->email,
                'name' => $member->name,
                'role' => $member->pivot->role,
                'member_type' => $member->pivot->member_type,              // TAMBAH INI
                'external_category' => $member->pivot->external_category,  // TAMBAH INI
                'notes' => $member->pivot->notes,                         // TAMBAH INI
                'avatar' => $member->avatar_url,
            ];
        });
        
        return response()->json($members);
    }

    public function updateMember(Request $request, $workspaceId, $userId)
    {
        $request->validate([
            'role' => 'sometimes|in:' . \App\Models\WorkspaceMember::getValidRolesString(),
            'member_type' => 'sometimes|in:internal,external',
            'external_category' => 'nullable|in:freelance,outsourced,vendor',
            'notes' => 'nullable|string|max:500',
        ]);

        $workspace = Workspace::findOrFail($workspaceId);
        
        // Check if user is admin
        $userRole = $workspace->members()->where('user_id', Auth::id())->first()->pivot->role;
        if ($userRole !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Find user by email
        $userToUpdate = User::where('email', $userId)->first();
        if (!$userToUpdate) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Update member data
        $workspace->members()->updateExistingPivot($userToUpdate->id, $request->only([
            'role', 'member_type', 'external_category', 'notes'
        ]));

        return response()->json(['message' => 'Member updated successfully']);
    }

    public function showInvitation($token)
    {
        $invitation = \App\Models\WorkspaceInvitation::where('token', $token)
            ->where('status', 'pending')
            ->with(['workspace', 'inviter'])
            ->first();

        if (!$invitation) {
            return redirect('/login')->with('error', 'Invalid or expired invitation');
        }

        if ($invitation->isExpired()) {
            $invitation->markAsExpired();
            return redirect('/login')->with('error', 'Invitation has expired');
        }

        return view('invitation', compact('invitation'));
    }

    public function acceptInvitation(Request $request, $token)
    {
        $invitation = \App\Models\WorkspaceInvitation::where('token', $token)
            ->where('status', 'pending')
            ->first();

        if (!$invitation) {
            return redirect('/login')->with('error', 'Invalid invitation');
        }

        if ($invitation->isExpired()) {
            $invitation->markAsExpired();
            return redirect('/login')->with('error', 'Invitation has expired');
        }

        // Check if user is logged in
        if (!Auth::check()) {
            // Store invitation token in session DENGAN LEBIH DETAIL
            session([
                'invitation_token' => $token,
                'invitation_email' => $invitation->email,
                'invitation_workspace' => $invitation->workspace->name
            ]);
            
            // Log untuk debugging
            Log::info('Storing invitation in session', [
                'token' => $token,
                'email' => $invitation->email,
                'workspace' => $invitation->workspace->name
            ]);
            
            return redirect('/auth/google');
        }

        $user = Auth::user();

        // Check if email matches
        if ($user->email !== $invitation->email) {
            Log::warning('Email mismatch in invitation', [
                'user_email' => $user->email,
                'invitation_email' => $invitation->email
            ]);
            return redirect('/?message=' . urlencode('Email mismatch. Please use the email that received the invitation.') . '&type=error');
        }

        try {
            $invitation->accept($user);
            return redirect('/?message=' . urlencode('Successfully joined workspace: ' . $invitation->workspace->name) . '&type=success');
        } catch (\Exception $e) {
            Log::error('Error accepting invitation', [
                'error' => $e->getMessage(),
                'user_id' => $user->id,
                'invitation_id' => $invitation->id
            ]);
            return redirect('/?message=' . urlencode($e->getMessage()) . '&type=error');
        }
    }

}