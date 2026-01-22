<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    public function handle($request, Closure $next, ...$roles)
    {
        \Log::info('Role Middleware Check', [
            'user_role' => $request->user()?->role,
            'allowed_roles' => $roles,
            'in_array' => in_array($request->user()?->role, $roles)
        ]);

        if (!in_array($request->user()?->role, $roles)) {
            abort(403, 'Unauthorized');
        }

        return $next($request);
    }
}
