import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';
import { getDeliveryById, updateDriverLocation, updateDeliveryStatus } from '../../service/deliveryApi';
import Map from './Map'; // Your Map component

function DriverSimulator() {
  const { deliveryId } = useParams();
  const navigate = useNavigate();
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [displayLocation, setDisplayLocation] = useState(null); // For smooth animation
  const intervalRef = useRef(null);
  const animationRef = useRef(null);
  const routeRef = useRef([]);
  const stepIndexRef = useRef(0);
  const phaseRef = useRef('TO_RESTAURANT');
  const googleMapsRef = useRef(null);
  const startTimeRef = useRef(null);
  const previousPointRef = useRef(null);
  const nextPointRef = useRef(null);

  // Load Google Maps and fetch delivery
  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyDN5v0Dye3EK1hPw25deXl2EbG_cu2bouM',
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
          const loc = {
            lat: response.data.driverLocation.latitude,
            lng: response.data.driverLocation.longitude,
          };
          setCurrentLocation(loc);
          setDisplayLocation(loc);
          previousPointRef.current = loc;
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

    return () => {
      stopSimulation();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [deliveryId]);

  // Animation function for smooth movement
  const animateMovement = () => {
    if (!previousPointRef.current || !nextPointRef.current) {
      return;
    }

    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    const duration = 10000; // Match the update interval
    const progress = Math.min(elapsed / duration, 1);

    // Calculate intermediate position
    const lat = previousPointRef.current.lat + 
      (nextPointRef.current.lat - previousPointRef.current.lat) * progress;
    const lng = previousPointRef.current.lng + 
      (nextPointRef.current.lng - previousPointRef.current.lng) * progress;

    setDisplayLocation({ lat, lng });

    if (progress < 1) {
      animationRef.current = requestAnimationFrame(animateMovement);
    } else {
      // Animation complete
      previousPointRef.current = nextPointRef.current;
    }
  };

  // Calculate routes
  const calculateRoutes = async () => {
    if (!googleMapsRef.current || !delivery || !currentLocation) {
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
            optimizeWaypoints: false,
            travelMode: googleMapsRef.current.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK') resolve(result);
            else reject(new Error(`Directions request failed: ${status}`));
          }
        );
      });

      const routePoints = route.routes[0].overview_path.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }));

      routeRef.current = routePoints;
      return true;
    } catch (err) {
      setError(`Failed to calculate route: ${err.message}`);
      return false;
    }
  };

  // Update location and trigger animation
  const updateLocation = async (point) => {
    try {
      await updateDriverLocation(deliveryId, {
        latitude: point.lat,
        longitude: point.lng,
        address: `Simulated Location (${point.lat}, ${point.lng})`,
      });

      nextPointRef.current = point;
      startTimeRef.current = Date.now();
      animationRef.current = requestAnimationFrame(animateMovement);

      // Check for status changes
      const restaurant = {
        lat: delivery.restaurantLocation.latitude,
        lng: delivery.restaurantLocation.longitude,
      };

      const distanceToRestaurant = googleMapsRef.current.maps.geometry.spherical.computeDistanceBetween(
        new googleMapsRef.current.maps.LatLng(point.lat, point.lng),
        new googleMapsRef.current.maps.LatLng(restaurant.lat, restaurant.lng)
      );

      if (phaseRef.current === 'TO_RESTAURANT' && distanceToRestaurant < 100) {
        await updateDeliveryStatus(deliveryId, 'DRIVER_AT_RESTAURANT');
        phaseRef.current = 'AT_RESTAURANT';
        setError('Driver has arrived at the restaurant. Click Continue to proceed to delivery.');
        stopSimulation();
      } else if (phaseRef.current === 'TO_DELIVERY' && stepIndexRef.current === routeRef.current.length - 1) {
        await updateDeliveryStatus(deliveryId, 'DRIVER_ARRIVED');
        stopSimulation();
        setError('Driver has arrived at the delivery location');
      }

      setCurrentLocation(point);
      setError(null);
    } catch (err) {
      console.error('Error updating location:', err);
      setError('Failed to update driver location');
      stopSimulation();
    }
  };

  // Move to next point in route
  const moveToNextPoint = async () => {
    if (stepIndexRef.current >= routeRef.current.length) {
      return;
    }

    const point = routeRef.current[stepIndexRef.current];
    await updateLocation(point);
    stepIndexRef.current += 1;
  };

  // Start simulation
  const startSimulation = async () => {
    if (!delivery || !currentLocation) {
      setError('Delivery or driver starting location not loaded');
      return;
    }

    if (phaseRef.current === 'TO_RESTAURANT' && routeRef.current.length === 0) {
      const success = await calculateRoutes();
      if (!success) return;
      try {
        await updateDeliveryStatus(deliveryId, 'DRIVER_ON_WAY_TO_RESTAURANT');
      } catch (err) {
        setError('Failed to update delivery status');
        return;
      }
    } else if (phaseRef.current === 'AT_RESTAURANT') {
      try {
        await updateDeliveryStatus(deliveryId, 'DRIVER_LEFT_RESTAURANT');
        await updateDeliveryStatus(deliveryId, 'DRIVER_ON_WAY_TO_DELIVERY');
        phaseRef.current = 'TO_DELIVERY';
      } catch (err) {
        setError('Failed to update delivery status');
        return;
      }
    }

    setIsSimulating(true);
    setError(null);
    intervalRef.current = setInterval(moveToNextPoint, 10000);
  };

  // Stop simulation
  const stopSimulation = () => {
    setIsSimulating(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Driver Simulator for Delivery {deliveryId}</h1>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        {displayLocation && (
          <div className="mb-4">
            <Map 
              center={displayLocation} 
              zoom={15}
              markers={[
                {
                  position: {
                    lat: delivery?.restaurantLocation?.latitude,
                    lng: delivery?.restaurantLocation?.longitude
                  },
                  title: 'Restaurant'
                },
                {
                  position: {
                    lat: delivery?.deliveryLocation?.latitude,
                    lng: delivery?.deliveryLocation?.longitude
                  },
                  title: 'Delivery Location'
                }
              ]}
              driverLocation={displayLocation}
              polylinePath={routeRef.current}
            />
            <p className="mt-4">
              <strong>Current Position:</strong> Latitude: {displayLocation.lat.toFixed(6)}, Longitude: {displayLocation.lng.toFixed(6)}
            </p>
            <p>
              <strong>Phase:</strong> {phaseRef.current}
            </p>
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