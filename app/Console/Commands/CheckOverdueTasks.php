<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Task;
use App\Models\User;
use App\Models\Notification;
use Carbon\Carbon;

class CheckOverdueTasks extends Command
{
    protected $signature = 'tasks:check-overdue';
    protected $description = 'Check for overdue tasks and send notifications';

    public function handle()
    {
        $now = Carbon::now();
        $today = $now->format('Y-m-d');
        
        // Find overdue tasks (not completed, past due date)
        $overdueTasks = Task::where('due_date', '<', $now)
            ->whereNotIn('status', ['published', 'done', 'completed', 'selesai', 'closed'])
            ->get();

        $notificationCount = 0;

        foreach ($overdueTasks as $task) {
            // Check if we already sent overdue notification today
            $existingNotification = Notification::where('user_id', function($query) use ($task) {
                $query->select('id')
                      ->from('users')
                      ->where('email', $task->assignee_id)
                      ->limit(1);
            })
            ->where('task_id', $task->id)
            ->where('type', 'task_overdue')
            ->whereDate('created_at', $today)
            ->exists();

            if (!$existingNotification) {
                $assignee = User::where('email', $task->assignee_id)->first();
                if ($assignee) {
                    $dueDate = Carbon::parse($task->due_date)->startOfDay();
                    $today = $now->startOfDay();
                    
                    // Calculate days - use absolute value for overdue days
                    $daysDiff = $today->diffInDays($dueDate, false);
                    
                    // Format message based on difference
                    if ($daysDiff < 0) {
                        // Negative means dueDate is in the past (overdue)
                        $daysOverdue = abs($daysDiff);
                        if ($daysOverdue == 0) {
                            $overdueMessage = "Task \"{$task->title}\" is overdue (due today)";
                        } else {
                            $overdueMessage = "Task \"{$task->title}\" is {$daysOverdue} day(s) overdue";
                        }
                    } else {
                        // Positive or zero means not overdue yet (shouldn't happen in this context)
                        $overdueMessage = "Task \"{$task->title}\" is overdue";
                    }
                    
                    Notification::createNotification(
                        $assignee->id,
                        'task_overdue',
                        'Task is overdue',
                        $overdueMessage,
                        $task->id
                    );
                    
                    $notificationCount++;
                }
            }
        }

        $this->info("Checked overdue tasks. Sent {$notificationCount} notifications.");
        return 0;
    }
}