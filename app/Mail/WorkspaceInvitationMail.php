<?php

namespace App\Mail;

use App\Models\WorkspaceInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class WorkspaceInvitationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $invitation;

    public function __construct(WorkspaceInvitation $invitation)
    {
        $this->invitation = $invitation;
    }

    public function build()
    {
        return $this->subject("You're invited to join {$this->invitation->workspace->name}")
                    ->view('emails.workspace-invitation');
    }
}