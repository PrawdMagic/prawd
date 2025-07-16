<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Workspace Invitation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 20px; line-height: 1.6;}
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: #e4e4e4; color: #2e2e2f; padding: 32px 24px; border-top-left-radius: 1.5rem; border-top-right-radius: 1.5rem; text-align: center; }
        .content { padding: 10px 24px; background: #f9fafb}
        .button { display: block; background-color: #4A6A5F; color: white !important; padding: 14px 0; text-decoration: none; border-radius: 1rem; font-weight: 600; margin: 20px 0; transition: background 0.2s; }
        .info-box { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px 24px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280 !important; text-align: center; }
        .highlight { background: #fef3c7; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
        ol { padding-left: 20px; }
        ol li { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎯 You're Invited!</h1>
            <p style="margin: 8px 0 0; opacity: 0.9; font-size: 16px;">Join your team in Prawd Task Magic</p>
        </div>
        
        <div class="content">            
            <p style="color: #2e2e2f; font-size: 1rem; margin-bottom: 0 !important">Hi there! 👋</p>
            
            <p style="color: #2e2e2f; font-size: 1rem; margin-top: 0 !important"><strong>{{ $invitation->inviter->name }}</strong> has invited you to join the <span class="highlight">{{ $invitation->workspace->name }}</span> workspace as a <strong>{{ ucfirst($invitation->role) }}</strong>.</p>
            
            
            <p style="color: #2e2e2f; font-size: 1.5rem; margin-bottom: 0 !important"><strong>What happens next?</strong></p>
            <ol>
                <li style="color: #2e2e2f; font-size: 1rem">Click the <strong>"Accept Invitation"</strong> button below</li>
                <li style="color: #2e2e2f; font-size: 1rem">Sign in with your <strong>Google account</strong></li>
                <li style="color: #2e2e2f; font-size: 1rem">Start collaborating with the team right away! 🎉</li>
            </ol>

            <div style="text-align: center; margin: 32px 0">
                <a href="{{ url('/invitation/' . $invitation->token) }}" class="button" style="font-size: 1.5rem">
                    Accept Invitation
                </a>
            </div>
            
            @if($invitation->notes)
                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 16px; margin-top: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #374151"><strong>Note from {{ $invitation->inviter->name }}:</strong></p>
                    <p style="margin: 8px 0 0; font-size: 14px; font-style: italic; color: #374151">"{{ $invitation->notes }}"</p>
                </div>
            @endif
        </div>
        
        <div class="footer">
            <p style="margin: 0;"><strong>⏰ This invitation expires on {{ $invitation->expires_at->format('M j, Y \a\t g:i A') }}</strong></p>
            <p style="margin: 12px 0 0; color: #374151;">If you didn't expect this invitation, you can safely ignore this email.</p>
            <p style="margin: 8px 0 0; font-size: 12px; opacity: 0.7; color: #374151;">Sent by ContentPlanner workspace management system</p>
        </div>
    </div>
</body>
</html>