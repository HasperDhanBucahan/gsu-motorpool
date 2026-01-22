export default function VehicleListing({ vehicles }) {
    if (!vehicles || vehicles.length === 0) {
        return (
            <p className="text-gray-600 italic text-center">
                No vehicles currently available.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
                Available Vehicles
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
            </div>
        </div>
    );
}

function VehicleCard({ vehicle }) {
    return (
        <div className="bg-white shadow rounded-lg overflow-hidden transition hover:shadow-lg">
            <img
                src={`/storage/${vehicle.image}`}
                alt={vehicle.description}
                className="w-full h-40 object-cover"
            />
            <div className="p-4">
                <h4 className="text-lg font-semibold text-gray-800">
                    {vehicle.description} ({vehicle.plate_number})
                </h4>
                <StatusBadge status={vehicle.status} />
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const color =
        status === 'available'
            ? 'bg-green-100 text-green-800'
            : status === 'assigned'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800';

    return (
        <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${color}`}>
            Status: {status}
        </span>
    );
}