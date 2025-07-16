<?php

use Illuminate\Support\Facades\Schedule;

// Check overdue tasks every day at 9 AM
Schedule::command('tasks:check-overdue')
    ->dailyAt('09:00')
    ->timezone('Asia/Jakarta');

// Optional: Check again at 5 PM  
Schedule::command('tasks:check-overdue')
    ->dailyAt('17:00')
    ->timezone('Asia/Jakarta');