import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';
import { getDeliveryById, updateDriverLocation, updateDeliveryStatus } from '../../service/deliveryApi';

function DriverSimulator() {
  const { deliveryId } = useParams();
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const intervalRef = useRef(null);
  const routeRef = useRef([]);
  const stepIndexRef = useRef(0);
  const phaseRef = useRef('TO_RESTAURANT'); // TO_RESTAURANT, AT_RESTAURANT, TO_DELIVERY
  const googleMapsRef = useRef(null);

  // Load Google Maps and fetch delivery
  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    loader.load().then((google) => {
      googleMapsRef.current = google;
      console.log('Google Maps API loaded');
    }).catch((err) => {
      console.error('Error loading Google Maps:', err);
      setError('Failed to load Google Maps API');
    });

    const fetchDelivery = async () => {
      try {
        const response = await getDeliveryById(deliveryId);
        setDelivery(response.data);
        if (response.data.driverLocation) {
          setCurrentLocation({
            lat: response.data.driverLocation.latitude,
            lng: response.data.driverLocation.longitude,
          });
          console.log('Driver starting location:', response.data.driverLocation);
        } else {
          setError('No driver starting location available. Ensure a driver is assigned.');
        }
      } catch (err) {
        console.error('Error fetching delivery:', err);
        setError('Failed to load delivery');
      }
    };

    fetchDelivery();

    return () => stopSimulation();
  }, [deliveryId]);

  // Calculate a single route with waypoints (start → restaurant → delivery)
  const calculateRoutes = async () => {
    if (!googleMapsRef.current || !delivery || !currentLocation) {
      console.error('Missing required data for route calculation', {
        googleMaps: !!googleMapsRef.current,
        delivery: !!delivery,
        currentLocation: !!currentLocation,
      });
      setError('Cannot calculate routes: Missing Google Maps, delivery data, or driver location');
      return false;
    }

    const directionsService = new googleMapsRef.current.maps.DirectionsService();
    const start = { lat: currentLocation.lat, lng: currentLocation.lng };
    const restaurant = {
      lat: delivery.restaurantLocation.latitude,
      lng: delivery.restaurantLocation.longitude,
    };
    const deliveryLoc = {
      lat: delivery.deliveryLocation.latitude,
      lng: delivery.deliveryLocation.longitude,
    };

    try {
      const route = await new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: start,
            destination: deliveryLoc,
            waypoints: [{ location: restaurant, stopover: true }],
            optimizeWaypoints: false, // Preserve order (restaurant before delivery)
            travelMode: googleMapsRef.current.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK') resolve(result);
            else reject(new Error(`Directions request failed: ${status}`));
          }
        );
      });

      // Extract coordinates from the route
      const routePoints = route.routes[0].overview_path.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }));

      routeRef.current = routePoints;
      console.log('Route calculated (start → restaurant → delivery):', routePoints);
      return true;
    } catch (err) {
      console.error('Error calculating route:', err);
      setError(`Failed to calculate route: ${err.message}`);
      return false;
    }
  };

  // Simulate movement along the route
  const simulateMovement = async () => {
    if (stepIndexRef.current >= routeRef.current.length) {
      try {
        await updateDeliveryStatus(deliveryId, 'DRIVER_ARRIVED');
        console.log('Driver arrived at delivery location');
        stopSimulation();
        setError('Driver has arrived at the delivery location');
      } catch (err) {
        console.error('Error updating status to DRIVER_ARRIVED:', err);
        setError('Failed to update delivery status');
      }
      return;
    }

    const currentPoint = routeRef.current[stepIndexRef.current];
    const restaurant = {
      lat: delivery.restaurantLocation.latitude,
      lng: delivery.restaurantLocation.longitude,
    };

    try {
      // Update driver location
      await updateDriverLocation(deliveryId, {
        latitude: currentPoint.lat,
        longitude: currentPoint.lng,
        address: `Simulated Location (${currentPoint.lat}, ${currentPoint.lng})`,
      });
      console.log('Driver location updated:', currentPoint);

      // Check for status changes
      const distanceToRestaurant = googleMapsRef.current.maps.geometry.spherical.computeDistanceBetween(
        new googleMapsRef.current.maps.LatLng(currentPoint.lat, currentPoint.lng),
        new googleMapsRef.current.maps.LatLng(restaurant.lat, restaurant.lng)
      );
      console.log('Distance to restaurant:', distanceToRestaurant);

      if (phaseRef.current === 'TO_RESTAURANT' && distanceToRestaurant < 100) {
        try {
          await updateDeliveryStatus(deliveryId, 'DRIVER_AT_RESTAURANT');
          console.log('Driver arrived at restaurant');
          phaseRef.current = 'AT_RESTAURANT';
          setError('Driver has arrived at the restaurant. Click Continue to proceed to delivery.');
          stopSimulation();
        } catch (err) {
          console.error('Error updating status to DRIVER_AT_RESTAURANT:', err);
          setError('Failed to update delivery status');
        }
      } else if (phaseRef.current === 'TO_DELIVERY' && stepIndexRef.current === routeRef.current.length - 1) {
        try {
          await updateDeliveryStatus(deliveryId, 'DRIVER_ARRIVED');
          console.log('Driver arrived at delivery location');
          stopSimulation();
          setError('Driver has arrived at the delivery location');
        } catch (err) {
          console.error('Error updating status to DRIVER_ARRIVED:', err);
          setError('Failed to update delivery status');
        }
      }

      // Update state
      setCurrentLocation({ lat: currentPoint.lat, lng: currentPoint.lng });
      setError(null);
      stepIndexRef.current += 1;
    } catch (err) {
      console.error('Error updating location:', err);
      setError('Failed to update driver location');
      stopSimulation();
    }
  };

  // Start simulation
  const startSimulation = async () => {
    if (!delivery || !currentLocation) {
      console.error('Cannot start simulation: Missing delivery or location', { delivery, currentLocation });
      setError('Delivery or driver starting location not loaded');
      return;
    }

    if (phaseRef.current === 'TO_RESTAURANT' && routeRef.current.length === 0) {
      const success = await calculateRoutes();
      if (!success) return;
      try {
        await updateDeliveryStatus(deliveryId, 'DRIVER_ON_WAY_TO_RESTAURANT');
        console.log('Status updated to DRIVER_ON_WAY_TO_RESTAURANT');
      } catch (err) {
        console.error('Error updating status to DRIVER_ON_WAY_TO_RESTAURANT:', err);
        setError('Failed to update delivery status');
        return;
      }
    } else if (phaseRef.current === 'AT_RESTAURANT') {
      try {
        await updateDeliveryStatus(deliveryId, 'DRIVER_LEFT_RESTAURANT');
        await updateDeliveryStatus(deliveryId, 'DRIVER_ON_WAY_TO_DELIVERY');
        console.log('Status updated to DRIVER_ON_WAY_TO_DELIVERY');
        phaseRef.current = 'TO_DELIVERY';
      } catch (err) {
        console.error('Error updating status for restaurant departure:', err);
        setError('Failed to update delivery status');
        return;
      }
    }

    setIsSimulating(true);
    setError(null);
    intervalRef.current = setInterval(simulateMovement, 5000);
    console.log('Simulation started');
  };

  // Stop simulation
  const stopSimulation = () => {
    setIsSimulating(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    console.log('Simulation stopped');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Driver Simulator for Delivery {deliveryId}</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {currentLocation ? (
          <div className="mb-4">
            <p>
              <strong>Starting Location:</strong> Latitude: {currentLocation.lat.toFixed(6)}, Longitude: {currentLocation.lng.toFixed(6)}
            </p>
            <p>
              <strong>Phase:</strong> {phaseRef.current}
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <p>Loading driver location...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <div className="flex items-center justify-between">
          {!isSimulating ? (
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={startSimulation}
              disabled={!currentLocation || isSimulating}
            >
              {phaseRef.current === 'AT_RESTAURANT' ? 'Continue to Delivery' : 'Start Simulation'}
            </button>
          ) : (
            <button
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={stopSimulation}
            >
              Stop Simulation
            </button>
          )}
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => navigate(`/deliveries/${deliveryId}`)}
          >
            View Tracking
          </button>
        </div>
      </div>
    </div>
  );
}

export default DriverSimulator;