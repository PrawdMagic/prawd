<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <title>Login - {{ config('app.name', 'Content Planner') }}</title>
    
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />
    
    @vite(['resources/css/app.css'])
</head>
<body class="font-sans antialiased bg-b-dark min-h-screen flex items-center justify-center">
    <div class="w-full max-w-md">
        <div class="bg-b-semidark rounded-3xl shadow-2xl p-8">
            <!-- Logo -->
            <div class="text-center mb-8">
                <div class="text-center mb-8">
                    <div class="flex items-center justify-center mx-auto mb-4 p-3 opacity-85">
                        <img src="{{ asset('prawdlogolight.png') }}" alt="Prawd Logo" class="w-20 h-20 object-contain">
                    </div>
                    <h1 class="text-2xl font-bold text-t-light">Welcome Back</h1>
                    <p class="text-t-mut mt-2">Sign in to your <strong>Prawd</strong> account</p>
                </div>
            </div>

            <!-- Error Message -->
            @if(session('error'))
                <div class="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <p class="text-red-400 text-sm">{{ session('error') }}</p>
                </div>
            @endif

            <!-- Google Login Button -->
            <a href="{{ route('auth.google') }}" 
               class="w-full flex items-center justify-center px-6 py-4 bg-white hover:bg-gray-50 text-gray-800 rounded-2xl transition-all duration-200 font-medium shadow-sm hover:shadow-md group">
                <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
                <svg class="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </a>

            <!-- Footer -->
            <div class="mt-8 text-center">
                <p class="text-xs text-t-mut">
                    By signing in, you agree to our </br> 
                    <a href="#" class="text-t-grn hover:underline">Terms of Service</a> 
                    and 
                    <a href="#" class="text-t-grn hover:underline">Privacy Policy</a>
                </p>
            </div>
        </div>
    </div>
</body>
</html>