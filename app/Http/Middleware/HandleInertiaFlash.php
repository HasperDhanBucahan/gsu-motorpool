<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HandleInertiaFlash
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Capture flash messages from the session and add them to Inertia's shared data.
        if ($request->session()->has('success')) {
            Inertia::share('flash', [
                'success' => $request->session()->get('success'),
            ]);
        }

        // Proceed with the request
        return $next($request);
    }
}
