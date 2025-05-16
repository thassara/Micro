import { useState, useEffect } from 'react';
import { getDrivers, updateDriver } from '../../service/deliveryApi';

function UpdateDriverAvailability() {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoading(true);
      try {
        const response = await getDrivers();
        setDrivers(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        setError('Failed to load drivers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const handleAvailabilityToggle = async (driverId, driver) => {
    setIsLoading(true);
    try {
      const updatedDriver = { ...driver, available: !driver.available };
      await updateDriver(driverId, updatedDriver);
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === driverId ? { ...d, available: !d.available } : d
        )
      );
      setError(null);
    } catch (error) {
      console.error('Error updating driver availability:', error);
      setError('Failed to update driver availability. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && drivers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="mt-4 text-lg">Loading drivers...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Update Driver Availability</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.length === 0 && !isLoading ? (
          <p className="text-gray-500">No drivers found.</p>
        ) : (
          drivers.map((driver) => (
            <div key={driver.id} className="border p-4 rounded-md">
              <p><strong>Name:</strong> {driver.name}</p>
              <p><strong>Availability:</strong> {driver.available ? 'Yes' : 'No'}</p>
              <p><strong>Contact:</strong> {driver.contactNumber}</p>
              <p><strong>Vehicle ID:</strong> {driver.vehicleId}</p>
              <button
                onClick={() => handleAvailabilityToggle(driver.id, driver)}
                className={`mt-2 w-full px-4 py-2 rounded text-white ${
                  driver.available
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-green-500 hover:bg-green-600'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {driver.available ? 'Set Unavailable' : 'Set Available'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default UpdateDriverAvailability;