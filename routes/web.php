<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ClientController;

// Invitation routes (tidak perlu login)
Route::get('/invitation/{token}', [WorkspaceController::class, 'showInvitation'])->name('invitation.show');
Route::match(['GET', 'POST'], '/invitation/{token}/accept', [WorkspaceController::class, 'acceptInvitation'])->name('invitation.accept');

// Google OAuth routes (tidak perlu login)
Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

// Logout route (perlu login)
Route::middleware('auth')->group(function () {
    Route::post('/auth/logout', [GoogleAuthController::class, 'logout'])->name('auth.logout');
});

// Guest routes (hanya bisa diakses kalau belum login)
Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return view('login');
    })->name('login');
});


Route::middleware('auth')->group(function () {
    Route::get('/', function () {
        return view('app');
    });
    
    // Workspace API routes
    Route::prefix('api')->group(function () {
        Route::get('/workspaces', [App\Http\Controllers\WorkspaceController::class, 'index']);
        Route::post('/workspaces', [App\Http\Controllers\WorkspaceController::class, 'store']);
        Route::get('/workspaces/{id}', [App\Http\Controllers\WorkspaceController::class, 'show']);
        Route::get('/workspaces/{id}/members', [App\Http\Controllers\WorkspaceController::class, 'getMembers']); // ← TAMBAH INI
        Route::post('/workspaces/{id}/invite', [App\Http\Controllers\WorkspaceController::class, 'inviteMember']);
        Route::delete('/workspaces/{workspaceId}/members/{userId}', [App\Http\Controllers\WorkspaceController::class, 'removeMember']);
        Route::put('/workspaces/{workspaceId}/members/{userId}', [App\Http\Controllers\WorkspaceController::class, 'updateMember']);


        Route::get('/tasks', [App\Http\Controllers\TaskController::class, 'index']);
        Route::post('/tasks', [App\Http\Controllers\TaskController::class, 'store']);
        Route::get('/tasks/stats', [App\Http\Controllers\TaskController::class, 'stats']);
        Route::get('/workspace-activities', [App\Http\Controllers\TaskController::class, 'getWorkspaceActivities']);
        Route::get('/tasks/{task}', [App\Http\Controllers\TaskController::class, 'show']);
        Route::put('/tasks/{task}', [App\Http\Controllers\TaskController::class, 'update']);
        Route::delete('/tasks/{task}', [App\Http\Controllers\TaskController::class, 'destroy']);

        Route::get('/tasks/{taskId}/comments', [App\Http\Controllers\TaskCommentController::class, 'index']);
        Route::post('/tasks/{taskId}/comments', [App\Http\Controllers\TaskCommentController::class, 'store']);
        Route::put('/comments/{commentId}', [App\Http\Controllers\TaskCommentController::class, 'update']);
        Route::delete('/comments/{commentId}', [App\Http\Controllers\TaskCommentController::class, 'destroy']);

        // Task Activities route
        Route::get('/tasks/{taskId}/activities', [App\Http\Controllers\TaskCommentController::class, 'getActivities']);

        // Notification routes
        Route::get('/notifications', [App\Http\Controllers\NotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [App\Http\Controllers\NotificationController::class, 'getUnreadCount']);
        Route::put('/notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
        Route::put('/notifications/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);

        // Calendar Notes routes
        Route::get('/calendar-notes', [App\Http\Controllers\CalendarNoteController::class, 'index']);
        Route::post('/calendar-notes', [App\Http\Controllers\CalendarNoteController::class, 'store']);
        Route::delete('/calendar-notes', [App\Http\Controllers\CalendarNoteController::class, 'destroy']);

        // Client routes
        Route::get('/clients', [App\Http\Controllers\ClientController::class, 'index']);
        Route::post('/clients', [App\Http\Controllers\ClientController::class, 'store']);
        Route::get('/clients/{id}', [App\Http\Controllers\ClientController::class, 'show']);
        Route::put('/clients/{id}', [App\Http\Controllers\ClientController::class, 'update']);
        Route::delete('/clients/{id}', [App\Http\Controllers\ClientController::class, 'destroy']);

    });

    
    // Catch-all route untuk SPA routing
    Route::get('/{any}', function () {
        return view('app');
    })->where('any', '.*');
});


