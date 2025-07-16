<!DOCTYPE html>
<html>
<head>
    <title>Workspace Invitation - Prawd</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        "b-dark": "color(srgb 0.081 0.0873 0.1)",
                        "b-semidark": "color(srgb 0.1033 0.1096 0.135)",
                        "b-closedark": "color(srgb 0.12 0.1246 0.16)",
                        "b-darklight": "color(srgb 0.1241 0.1356 0.17)",
                        "b-acc": "color(srgb 0.2247 0.2014 0.38 / 0.47)",
                        "b-acc-hov": "color(srgb 0.2247 0.2014 0.38 / 0.72)",
                        "b-red": "rgba(205, 68, 68, 1)",
                        "b-red-inb": "color(srgb 0.375 0.2269 0.3282 / 0.47)",
                        "b-red-inb-hov": "color(srgb 0.375 0.2269 0.3282 / 0.72)",
                        "b-grn": "rgba(117, 144, 45, 0.38)",
                        "b-grn-hov": "rgba(117, 144, 45, 0.65)",
                        "b-blue": "rgba(44, 71, 126, 0.47)",
                        "b-blue-hov": "rgba(44, 71, 126, 0.65)",
                        "bor": "rgba(51, 52, 60, 0.45)",
                        "borlight": "rgba(65, 66, 79, 1)",
                        "bor-grn": "rgba(153, 198, 35, 1)",
                        "t-light": "rgba(200, 202, 210, 1)",
                        "t-mut": "rgba(156, 157, 163, 1)",
                        "t-darkmut": "rgba(113, 114, 119, 1)",
                        "t-grn": "rgba(153, 198, 35, 1)",
                        "t-blue": "color(srgb 0.3462 0.4906 0.805)",
                        "t-acc": "rgba(136, 131, 255, 1)",
                        "t-purp": "color(srgb 0.658 0.3317 0.9703)",
                        "t-yel": "color(srgb 0.8951 0.6858 0.0537)",
                        "t-red": "rgba(182, 51, 67, 1)",
                        "t-red-inb": "color(srgb 0.84 0.6726 0.6342)",
                        "t-red-badge": "rgba(245, 125, 140, 1)",
                        
                        "b-unique-a": "color(srgb 0.12 0.1556 0.16)",
                        "b-unique-b": "color(srgb 0.1302 0.1467 0.21)",
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-b-dark min-h-screen flex items-center justify-center p-4">
    <div class="bg-b-semidark rounded-3xl shadow-2xl border border-b-darklight p-8 w-full max-w-md">
        
        <div class="text-center mb-8">
            <div class="flex items-center justify-center mx-auto mb-4 p-3 opacity-85">
                <img src="{{ asset('prawdlogolight.png') }}" alt="Prawd Logo" class="w-20 h-20 object-contain">
            </div>
            <h1 class="text-2xl font-bold text-t-light">Workspace Invitation</h1>
            <p class="text-t-mut text-sm">Join your team in Task Magic</p>
        </div>

        <!-- Invitation Details -->
        <div class="space-y-4 mb-8">
            <div class="bg-b-closedark rounded-2xl p-6 border border-b-darklight">
                <div class="space-y-4">
                    <div>
                        <div class="text-xs text-t-mut uppercase tracking-wide font-medium mb-1">Invited by</div>
                        <div class="text-t-light font-semibold">{{ $invitation->inviter->name }}</div>
                    </div>
                    
                    <div>
                        <div class="text-xs text-t-mut uppercase tracking-wide font-medium mb-1">Workspace</div>
                        <div class="text-t-grn font-semibold">{{ $invitation->workspace->name }}</div>
                    </div>
                    
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="text-xs text-t-mut uppercase tracking-wide font-medium mb-1">Role</div>
                            <div class="text-t-light font-semibold capitalize">{{ $invitation->role }}</div>
                        </div>
                        <div>
                            @if($invitation->member_type === 'external')
                                <span class="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium">External</span>
                            @else
                                <span class="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium">Internal</span>
                            @endif
                        </div>
                    </div>
                </div>
            </div>

            @if($invitation->notes)
            <div class="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4">
                <div class="text-xs text-blue-400 uppercase tracking-wide font-medium mb-2">Personal Message</div>
                <div class="text-t-light text-sm italic">"{{ $invitation->notes }}"</div>
            </div>
            @endif
        </div>

        <!-- Action Button -->
            <a href="{{ route('invitation.accept', $invitation->token) }}" 
                class="w-full flex items-center justify-center px-6 py-4 bg-b-acc text-t-yel rounded-2xl transition-all duration-200 font-medium shadow-sm hover:shadow-md group">
                <span>PRAWD</span>
                <svg class="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
            </a>
        
        <!-- Footer -->
        <div class="mt-8 pt-6 border-t border-b-darklight">
            <div class="text-center text-[10px] text-t-darkmut">
                <p>You'll be signed in with Google to join the workspace, Ex. {{ $invitation->expires_at->format('M j, Y') }}</p>
                <p class="text-xs text-t-mut text-center mt-2">
                    This invitation was sent to <span class="text-t-light font-medium">{{ $invitation->email }}</span>
                </p>
            </div>
        </div>
        
    </div>
</body>
</html>