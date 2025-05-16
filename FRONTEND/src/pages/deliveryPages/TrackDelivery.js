import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Loader } from '@googlemaps/js-api-loader';
import Map from '../../components/deliveryComponents/Map';
import StatusUpdate from '../../components/deliveryComponents/StatusUpdate';
import { formatTimestamp } from '../../utils/helpers';
import { getDeliveryById, getDriverById, confirmDelivery } from '../../service/deliveryApi';

// Custom icons
const DRIVER_ICON = {
  url: '/icons/car.svg',
  scaledSize: { width: 20, height: 20 },
  anchor: { x: 10, y: 10 }
};

const RESTAURANT_ICON = {
  url: '/icons/utensils.svg',
  scaledSize: { width: 20, height: 20 },
  anchor: { x: 10, y: 10 }
};

const DELIVERY_ICON = {
  url: '/icons/home.svg',
  scaledSize: { width: 20, height: 20 },
  anchor: { x: 10, y: 10 }
};



function TrackDelivery() {
  const { deliveryId } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [driver, setDriver] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [displayLocation, setDisplayLocation] = useState(null); // For smooth animation
  const [status, setStatus] = useState('');
  const [routePath, setRoutePath] = useState([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const clientRef = useRef(null);
  const googleMapsRef = useRef(null);
  const animationRef = useRef(null);
  const previousLocationRef = useRef(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });

    loader.load().then((google) => {
      googleMapsRef.current = google;
    });

    const fetchDelivery = async () => {
      try {
        const response = await getDeliveryById(deliveryId);
        setDelivery(response.data);
        if (response.data.driverLocation) {
          setDriverLocation(response.data.driverLocation);
          setDisplayLocation({
            lat: response.data.driverLocation.latitude,
            lng: response.data.driverLocation.longitude
          });
          previousLocationRef.current = {
            lat: response.data.driverLocation.latitude,
            lng: response.data.driverLocation.longitude
          };
        }
        setStatus(response.data.status);
        calculateRoute(response.data);
        
        if (response.data.driverId) {
          try {
            const driverResponse = await getDriverById(response.data.driverId);
            setDriver(driverResponse.data);
          } catch (err) {
            console.error('Error fetching driver:', err);
            setStatus('ERROR');
          }
        }
      } catch (error) {
        console.error('Error fetching delivery:', error);
        setStatus('ERROR');
      }
    };

    fetchDelivery();

    const socket = new SockJS('http://localhost:8083/delivery-websocket');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        stompClient.subscribe(`/topic/delivery/${deliveryId}`, (message) => {
          const update = JSON.parse(message.body);
          console.log('Received WebSocket update:', update);
          setStatus(update.status);
          
          if (update.driverLocation) {
            const newLocation = {
              lat: update.driverLocation.latitude,
              lng: update.driverLocation.longitude
            };
            setDriverLocation(update.driverLocation);
            animateDriverMovement(newLocation);
          }
          
          if (update.driver) {
            setDriver(update.driver);
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker error:', frame.headers['message']);
        setStatus('ERROR');
      },
    });

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [deliveryId]);

  // Smooth animation for driver movement
  const animateDriverMovement = (newLocation) => {
    if (!previousLocationRef.current || !newLocation) return;
    
    const startLocation = previousLocationRef.current;
    const endLocation = newLocation;
    const duration = 10000; // 10 seconds to match update interval
    let startTime = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Linear interpolation between points
      const currentLat = startLocation.lat + (endLocation.lat - startLocation.lat) * progress;
      const currentLng = startLocation.lng + (endLocation.lng - startLocation.lng) * progress;

      setDisplayLocation({
        lat: currentLat,
        lng: currentLng
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousLocationRef.current = endLocation;
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const calculateRoute = async (deliveryData) => {
    if (!googleMapsRef.current || !deliveryData || !deliveryData.driverLocation) return;

    const directionsService = new googleMapsRef.current.maps.DirectionsService();
    try {
      const result = await new Promise((resolve, reject) => {
        directionsService.route(
          {
            origin: {
              lat: deliveryData.driverLocation.latitude,
              lng: deliveryData.driverLocation.longitude,
            },
            destination: {
              lat: deliveryData.deliveryLocation.latitude,
              lng: deliveryData.deliveryLocation.longitude,
            },
            waypoints: [
              {
                location: {
                  lat: deliveryData.restaurantLocation.latitude,
                  lng: deliveryData.restaurantLocation.longitude,
                },
                stopover: true,
              },
            ],
            optimizeWaypoints: false,
            travelMode: googleMapsRef.current.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK') resolve(result);
            else reject(new Error(`Directions request failed: ${status}`));
          }
        );
      });

      const path = result.routes[0].overview_path.map((point) => ({
        lat: point.lat(),
        lng: point.lng(),
      }));
      setRoutePath(path);
    } catch (err) {
      console.error('Error calculating route:', err);
      setStatus('ERROR');
    }
  };

  const handleConfirmDelivery = async () => {
    if (window.confirm('Are you sure you want to confirm the delivery?')) {
      setIsConfirming(true);
      try {
        await confirmDelivery(deliveryId);
        setStatus('DELIVERY_CONFIRMED');
      } catch (err) {
        console.error('Error confirming delivery:', err);
        setStatus('ERROR');
      } finally {
        setIsConfirming(false);
      }
    }
  };

  if (!delivery) {
    return <div>Loading...</div>;
  }

  const markers = [
    {
      position: { 
        lat: delivery.deliveryLocation.latitude, 
        lng: delivery.deliveryLocation.longitude 
      },
      title: 'Delivery Location',
      icon: DELIVERY_ICON
    },
    {
      position: { 
        lat: delivery.restaurantLocation.latitude, 
        lng: delivery.restaurantLocation.longitude 
      },
      title: 'Restaurant Location',
      icon: RESTAURANT_ICON
    }
  ];

  if (displayLocation) {
    markers.push({
      position: displayLocation,
      title: 'Driver Location',
      icon: DRIVER_ICON
    });
  }

  return (
    <div className="container mx-auto p-4">
      <StatusUpdate status={status} />
      <h1 className="text-2xl font-bold mb-4">Track Delivery: {delivery.orderId}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Delivery Details</h2>
          {status === 'DELIVERY_CONFIRMED' && (
            <p className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-2 rounded mb-2">
              Delivery Confirmed
            </p>
          )}
          <p>
            <strong>Status:</strong> {status}
          </p>
          <p>
            <strong>Customer ID:</strong> {delivery.customerId}
          </p>
          <p>
            <strong>Delivery Address:</strong> {delivery.deliveryLocation.address}
          </p>
          <p>
            <strong>Restaurant Address:</strong> {delivery.restaurantLocation.address}
          </p>
          {delivery.driverId && driver ? (
            <>
              <p>
                <strong>Driver Name:</strong> {driver.name}
              </p>
              <p>
                <strong>Driver Contact:</strong> {driver.contactNumber}
              </p>
            </>
          ) : (
            <p>
              <strong>Driver:</strong> Not assigned
            </p>
          )}
          {status === 'DRIVER_ARRIVED' && (
            <button
              className={`mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                isConfirming ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleConfirmDelivery}
              disabled={isConfirming}
            >
              {isConfirming ? 'Confirming...' : 'Confirm Delivery'}
            </button>
          )}
          <h3 className="text-lg font-semibold mt-4">Status History</h3>
          <ul className="list-disc pl-5">
            {delivery.statusHistory.map((status, index) => (
              <li key={index}>
                {status.status} - {formatTimestamp(status.timestamp)}
              </li>
            ))}
          </ul>
        </div>
        <Map
          center={{ 
            lat: delivery.deliveryLocation.latitude, 
            lng: delivery.deliveryLocation.longitude 
          }}
          zoom={12}
          markers={markers}
          polylinePath={routePath}
          driverLocation={displayLocation}
        />
      </div>
    </div>
  );
}

export default TrackDelivery;