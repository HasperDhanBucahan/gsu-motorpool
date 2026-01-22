<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vehicle;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function index(): Response
    {
        $vehicles = Vehicle::all();

        return Inertia::render('Assignment/Vehicles', [
            'vehicles' => $vehicles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'model'        => 'required|string|max:255',
            'plate_number' => 'required|string|max:50|unique:vehicles',
            'fuel_type'    => 'required|string|max:100',
            'description'  => 'required|string|max:1000',
            'status'       => 'required|string|in:available,in_use,maintenance',
        ]);

        Vehicle::create($validated);
        return redirect()->back()->with('success', 'Vehicle added successfully.');
    }

    public function update(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $validated = $request->validate([
            'model'        => 'required|string|max:255',
            'plate_number' => 'required|string|max:50|unique:vehicles,plate_number,' . $vehicle->id,
            'fuel_type'    => 'required|string|max:100',
            'description'  => 'required|string|max:1000',
            'status'       => 'required|string|in:available,in_use,maintenance',
        ]);

        $vehicle->update($validated);

        return redirect()->back()->with('success', 'Vehicle updated successfully.');
    }

    public function destroy($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return redirect()->back()->with('success', 'Vehicle deleted successfully.');
    }
}