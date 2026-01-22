<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\FuelConsumption;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Style\Font;
use Carbon\Carbon;

class FuelConsumptionController extends Controller
{
    /**
     * Display the fuel consumption management page
     */
    public function index()
    {
        $vehicles = Vehicle::orderBy('plate_number')->get();
        
        // Get all fuel consumption records and format them for easy lookup
        $fuelData = [];
        $consumptions = FuelConsumption::all();
        
        foreach ($consumptions as $consumption) {
            // Store with month as-is (1-12 from database)
            $key = "{$consumption->vehicle_id}-{$consumption->year}-{$consumption->month}";
            $fuelData[$key] = [
                'id' => $consumption->id,
                'liters' => $consumption->liters,
                'updated_at' => $consumption->updated_at
            ];
        }

        return inertia('Tickets/FuelConsumption', [
            'vehicles' => $vehicles,
            'fuelData' => $fuelData
        ]);
    }

    /**
     * Store or update fuel consumption data
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'year' => 'required|integer|min:2000|max:2100',
            'month' => 'required|integer|min:1|max:12',
            'liters' => 'required|numeric|min:0|max:999999.99'
        ]);

        try {
            // Update or create the fuel consumption record
            FuelConsumption::updateOrCreate(
                [
                    'vehicle_id' => $validated['vehicle_id'],
                    'year' => $validated['year'],
                    'month' => $validated['month']
                ],
                [
                    'liters' => $validated['liters']
                ]
            );

            return redirect()->back()->with('success', 'Fuel consumption saved successfully');

        } catch (\Exception $e) {
            \Log::error('Fuel consumption save error', [
                'message' => $e->getMessage(),
                'data' => $validated
            ]);

            return redirect()->back()
                ->with('error', 'Failed to save fuel consumption: ' . $e->getMessage());
        }
    }

    /**
     * Delete fuel consumption record
     */
    public function destroy(FuelConsumption $fuelConsumption)
    {
        try {
            $fuelConsumption->delete();
            return redirect()->back()->with('success', 'Fuel consumption record deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete record');
        }
    }

    /**
     * Export fuel consumption data to Excel
     */
    public function export(Request $request)
    {
        $year = $request->input('year');
        
        // 1. Get all vehicles ordered by ID (lowest to highest)
        $vehicles = Vehicle::orderBy('id')->get();
        
        // 2. Load the Excel template
        $templatePath = storage_path('app/templates/fuel-consumption-template.xlsx');
        
        if (!file_exists($templatePath)) {
            return redirect()->back()->with('error', 'Excel template not found');
        }
        
        $spreadsheet = IOFactory::load($templatePath);
        
        // 3. Select the specific sheet "INVENTORY OF VEHICLES FORM C"
        try {
            $sheet = $spreadsheet->getSheetByName('INVENTORY OF VEHICLES FORM C');
            
            if ($sheet === null) {
                return redirect()->back()->with('error', 'Sheet "INVENTORY OF VEHICLES FORM C" not found in template');
            }
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to load sheet: ' . $e->getMessage());
        }
        
        // 4. Set Date Generated in G8
        $dateGenerated = 'Date: ' . Carbon::now()->format('F d, Y');
        $sheet->setCellValue('G8', $dateGenerated);
        
        // 5. Define the cells for year display (10 vehicles worth)
        $yearCells = ['E10', 'E27', 'E44', 'E61', 'E78', 'E95', 'E112', 'E129', 'E146', 'E163'];
        
        // 6. Set year text in all year cells with formatting
        $yearText = $year . ' FUEL CONSUMPTION (L)';
        foreach ($yearCells as $cell) {
            $sheet->setCellValue($cell, $yearText);
            $sheet->getStyle($cell)->getFont()->setBold(true);
            $sheet->getStyle($cell)->getFont()->setName('Calibri');
            $sheet->getStyle($cell)->getFont()->setSize(11);
        }
        
        // 7. Define starting rows for each vehicle's fuel data
        $vehicleStartRows = [12, 29, 46, 63, 80, 97, 114, 131, 148, 165];
        
        // 8. Process each vehicle (up to 10)
        foreach ($vehicles as $index => $vehicle) {
            if ($index >= 10) {
                // If more than 10 vehicles, we'd need to expand template dynamically
                // For now, we'll handle first 10 vehicles
                break;
            }
            
            $startRow = $vehicleStartRows[$index];
            
            // 9. Get fuel consumption for this vehicle for all 12 months
            for ($month = 1; $month <= 12; $month++) {
                $consumption = FuelConsumption::where('vehicle_id', $vehicle->id)
                    ->where('year', $year)
                    ->where('month', $month)
                    ->first();
                
                $liters = $consumption ? $consumption->liters : 0;
                
                // Calculate row: startRow + (month - 1)
                // F12 = January (month 1), F13 = February (month 2), etc.
                $row = $startRow + ($month - 1);
                $cell = 'F' . $row;
                
                $sheet->setCellValue($cell, $liters);
            }
        }
        
        // 10. Return the file as download
        $fileName = "fuel-consumption-{$year}.xlsx";
        
        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        
        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }
}