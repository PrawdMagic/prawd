<?php

namespace App\Http\Controllers\Auth;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->user();
            
            $user = User::updateOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'name' => $googleUser->getName(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'email_verified_at' => now(),
                ]
            );
            
            // Download avatar
            $user->downloadAvatar($googleUser->getAvatar());
            
            // Create personal workspace if not exists
            if (!$user->workspaces()->exists()) {
                $workspace = Workspace::create([
                    'name' => $user->name . "'s Workspace",
                    'description' => 'Personal workspace',
                    'owner_id' => $user->id,
                ]);
                
                $workspace->members()->attach($user->id, ['role' => 'admin']);
            }
            
            Auth::login($user);

            // IMPROVED: Check if there's a pending invitation
            if (session('invitation_token')) {
                $token = session('invitation_token');
                $expectedEmail = session('invitation_email');
                $workspaceName = session('invitation_workspace');
                
                // Clear session data
                session()->forget(['invitation_token', 'invitation_email', 'invitation_workspace']);
                
                Log::info('Processing invitation after Google login', [
                    'token' => $token,
                    'user_email' => $user->email,
                    'expected_email' => $expectedEmail,
                    'workspace' => $workspaceName
                ]);
                
                $invitation = \App\Models\WorkspaceInvitation::where('token', $token)
                    ->where('status', 'pending')
                    ->where('email', $user->email)
                    ->first();
                
                if ($invitation && !$invitation->isExpired()) {
                    try {
                        $invitation->accept($user);
                        Log::info('Invitation accepted successfully', [
                            'user_id' => $user->id,
                            'workspace_id' => $invitation->workspace_id
                        ]);
                        return redirect('/?message=' . urlencode('Successfully joined workspace: ' . $invitation->workspace->name) . '&type=success');
                    } catch (\Exception $e) {
                        Log::error('Error accepting invitation in callback', [
                            'error' => $e->getMessage(),
                            'user_id' => $user->id,
                            'invitation_id' => $invitation->id
                        ]);
                        return redirect('/?message=' . urlencode($e->getMessage()) . '&type=error');
                    }
                } else {
                    Log::warning('Invitation not found or expired in callback', [
                        'token' => $token,
                        'user_email' => $user->email,
                        'invitation_found' => $invitation ? 'yes' : 'no',
                        'invitation_expired' => $invitation ? ($invitation->isExpired() ? 'yes' : 'no') : 'n/a'
                    ]);
                    return redirect('/?message=' . urlencode('Invitation has expired or is invalid') . '&type=error');
                }
            }

            return redirect()->intended('/');
                
        } catch (\Exception $e) {
            Log::error('Google OAuth callback error', ['error' => $e->getMessage()]);
            return redirect('/login')->with('error', 'Login failed');
        }
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return response()->json(['message' => 'Logged out successfully']);
    }
}