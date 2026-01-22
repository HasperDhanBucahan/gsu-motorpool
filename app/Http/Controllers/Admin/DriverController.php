<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Driver;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class DriverController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Assignment/Drivers', [
            'drivers' => Driver::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'description' => 'nullable|string|max:1000',
        ]);

        Driver::create($validated);
        return redirect()->back()->with('success', 'Driver added successfully.');
    }

    public function update(Request $request, $id)
    {
        $driver = Driver::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:20',
            'description' => 'nullable|string|max:1000',
        ]);

        $driver->update($validated);

        return redirect()->back()->with('success', 'Driver updated successfully.');
    }

    public function destroy($id)
    {
        Driver::findOrFail($id)->delete();

        return redirect()->back()->with('success', 'Driver deleted successfully.');
    }
}