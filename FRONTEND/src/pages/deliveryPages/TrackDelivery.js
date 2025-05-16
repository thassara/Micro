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
  // Calculate initial map center point
const center = delivery ? {
  lat: (delivery.deliveryLocation.latitude + delivery.restaurantLocation.latitude) / 2,
  lng: (delivery.deliveryLocation.longitude + delivery.restaurantLocation.longitude) / 2
} : { lat: 0, lng: 0 };

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
    <div className="min-h-screen bg-gray-50">
      {/* Status Notification Bar */}
      <div className="bg-blue-600 text-white p-3 text-center">
        <StatusUpdate status={status} />
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order #{delivery.orderId}</h1>
            <p className="text-gray-600 mt-1">
              Last updated: {formatTimestamp(delivery.updatedAt || new Date().toISOString())}
            </p>
          </div>
          {status === 'DRIVER_ARRIVED' && (
            <button
              onClick={handleConfirmDelivery}
              disabled={isConfirming}
              className={`mt-4 md:mt-0 px-6 py-3 rounded-lg font-medium ${
                isConfirming
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-md transition-colors'
              }`}
            >
              {isConfirming ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Confirming...
                </span>
              ) : (
                'Confirm Delivery Received'
              )}
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Delivery Info Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Delivery Details</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Customer ID</p>
                  <p className="text-gray-800">{delivery.customerId}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 font-medium">Delivery Address</p>
                  <p className="text-gray-800">{delivery.deliveryLocation.address}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 font-medium">Restaurant Address</p>
                  <p className="text-gray-800">{delivery.restaurantLocation.address}</p>
                </div>
              </div>
            </div>

            {/* Driver Info Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Driver Information</h2>
              
              {delivery.driverId && driver ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 rounded-full p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{driver.name}</p>
                      <p className="text-sm text-gray-500">Driver</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 rounded-full p-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{driver.contactNumber}</p>
                      <p className="text-sm text-gray-500">Contact Number</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Driver not assigned yet</p>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Delivery Timeline</h2>
              <div className="flow-root">
                <ul className="-mb-8">
                  {delivery.statusHistory.map((statusItem, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== delivery.statusHistory.length - 1 ? (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              statusItem.status === 'DELIVERY_CONFIRMED' ? 'bg-green-500' : 
                              statusItem.status.includes('DRIVER') ? 'bg-blue-500' : 'bg-gray-400'
                            }`}>
                              <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                {statusItem.status === 'DELIVERY_CONFIRMED' ? (
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                ) : statusItem.status.includes('DRIVER') ? (
                                  <path d="M8 16.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                ) : (
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                )}
                              </svg>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-800 capitalize">
                                {statusItem.status.toLowerCase().replace(/_/g, ' ')}
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {formatTimestamp(statusItem.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Delivery Route</h2>
              </div>
              <div className="h-[500px] w-full">
                <Map
                  center={center}
                  zoom={14}
                  markers={markers}
                  polylinePath={routePath}
                  driverLocation={displayLocation}
                />
              </div>
              <div className="p-4 border-t bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">Driver</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm">Restaurant</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm">Delivery Location</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackDelivery;
