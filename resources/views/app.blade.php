<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <title>{{ config('app.name', 'Task Magic') }}</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap" rel="stylesheet" />
    
    <!-- Scripts -->
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
</head>
<body class="font-sans antialiased bg-b-dark">
    <div id="app"></div>
    
    <script>
        window.Laravel = {
            csrfToken: '{{ csrf_token() }}',
            user: @auth {{ Js::from(auth()->user()->append('avatar_url')) }} @else null @endauth,
            appUrl: '{{ config('app.url') }}',
        };
    </script>
</body>
</html>