<?php

namespace App;

enum VehicleStatus: string
{
    case Available = 'available';
    case InUse = 'in_use';
    case InRepair = 'in_repair';
}
