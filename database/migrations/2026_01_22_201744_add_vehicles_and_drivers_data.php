<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Insert Vehicles
        $vehicles = [
            ['plate_number' => 'SHR 805', 'model' => '2013', 'fuel_type' => 'Diesel', 'description' => 'Toyota Fortuner', 'status' => 'available'],
            ['plate_number' => 'SGZ 685', 'model' => '2004', 'fuel_type' => 'Diesel', 'description' => 'Isuzu Hi-Lander Crosswind', 'status' => 'available'],
            ['plate_number' => 'SED 985', 'model' => '1994', 'fuel_type' => 'Diesel', 'description' => 'Mitsubishi L200', 'status' => 'available'],
            ['plate_number' => 'SNA 1454', 'model' => '2024', 'fuel_type' => 'Diesel', 'description' => 'Yutong ZK6907H Bus', 'status' => 'available'],
            ['plate_number' => 'SNA 1455', 'model' => '2024', 'fuel_type' => 'Diesel', 'description' => 'Yutong ZK6729D2 Bus', 'status' => 'available'],
            ['plate_number' => 'SBS 512', 'model' => '2002', 'fuel_type' => 'Diesel', 'description' => 'Nissan Urvan Escapade VJA12', 'status' => 'available'],
            ['plate_number' => 'SDV 858', 'model' => '1998', 'fuel_type' => 'Diesel', 'description' => 'Isuzu Jitney', 'status' => 'available'],
            ['plate_number' => 'SAA 4719', 'model' => '2015', 'fuel_type' => 'Diesel', 'description' => 'Foton View Ambulance', 'status' => 'available'],
            ['plate_number' => 'SAA 1185', 'model' => '2020', 'fuel_type' => 'Diesel', 'description' => 'Nissan NV350 Urvan', 'status' => 'available'],
            ['plate_number' => 'SJS 190', 'model' => '-', 'fuel_type' => 'Diesel', 'description' => 'Mitsubishi L300 Cab', 'status' => 'available'],
        ];

        foreach ($vehicles as $vehicle) {
            DB::table('vehicles')->insert(array_merge($vehicle, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Insert Drivers
        $drivers = [
            ['name' => 'Ceasar M. Bangloy', 'contact_number' => '09682454920', 'description' => 'Chief Driver', 'available' => true],
            ['name' => 'Julius G. Gumayagay', 'contact_number' => '09956539760', 'description' => null, 'available' => true],
            ['name' => 'Ronald M. Buscayno', 'contact_number' => '-', 'description' => null, 'available' => true],
            ['name' => 'Jaysar R. Matias', 'contact_number' => '09676257827', 'description' => null, 'available' => true],
            ['name' => 'Norman Jay E. Bulong', 'contact_number' => '-', 'description' => null, 'available' => true],
            ['name' => 'John-John T. Saldivar', 'contact_number' => '-', 'description' => null, 'available' => true],
            ['name' => 'Rico L. Clemente', 'contact_number' => '-', 'description' => null, 'available' => true],
            ['name' => 'Dexter N. Vincente', 'contact_number' => '-', 'description' => null, 'available' => true],
            ['name' => 'Mike B. Binwag', 'contact_number' => '-', 'description' => null, 'available' => true],
            ['name' => 'Franklin R. Castro', 'contact_number' => '-', 'description' => null, 'available' => true],
            ['name' => 'Jayson C. Trinidad', 'contact_number' => '-', 'description' => null, 'available' => true],
            ['name' => 'Manuel B. Salviejo, Jr.', 'contact_number' => '-', 'description' => null, 'available' => true],
            ['name' => 'Roldan C. Yangat', 'contact_number' => '-', 'description' => null, 'available' => true],
            ['name' => 'Marcelino G. Damance', 'contact_number' => '-', 'description' => null, 'available' => true],
            ['name' => 'Paul Genesis A. Naval', 'contact_number' => '-', 'description' => null, 'available' => true],
            ['name' => 'Joshua B. Dacquel', 'contact_number' => '-', 'description' => null, 'available' => true],
        ];

        foreach ($drivers as $driver) {
            DB::table('drivers')->insert(array_merge($driver, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Delete all vehicles
        DB::table('vehicles')->whereIn('plate_number', [
            'SHR 805', 'SGZ 685', 'SED 985', 'SNA 1454', 'SNA 1455',
            'SBS 512', 'SDV 858', 'SAA 4719', 'SAA 1185', 'SJS 190'
        ])->delete();

        // Delete all drivers
        DB::table('drivers')->whereIn('name', [
            'Ceasar M. Bangloy', 'Julius G. Gumayagay', 'Ronald M. Buscayno',
            'Jaysar R. Matias', 'Norman Jay E. Bulong', 'John-John T. Saldivar',
            'Rico L. Clemente', 'Dexter N. Vincente', 'Mike B. Binwag',
            'Franklin R. Castro', 'Jayson C. Trinidad', 'Manuel B. Salviejo, Jr.',
            'Roldan C. Yangat', 'Marcelino G. Damance', 'Paul Genesis A. Naval',
            'Joshua B. Dacquel'
        ])->delete();
    }
};