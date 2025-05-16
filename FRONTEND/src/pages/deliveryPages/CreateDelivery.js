import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '@googlemaps/js-api-loader';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { createDelivery, assignDriver, deleteDelivery } from '../../service/deliveryApi';

function CreateDelivery() {
  const [customerId, setCustomerId] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [restaurantLocation, setRestaurantLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryId, setDeliveryId] = useState(null);
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const autocompleteDeliveryRef = useRef(null);
  const autocompleteRestaurantRef = useRef(null);
  const stompClientRef = useRef(null);

// CreateDelivery.js
useEffect(() => {
  const loader = new Loader({
    apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    version: 'weekly',
    libraries: ['places', 'geometry'], // Add 'geometry' here
  });

  loader.load().then(() => {
    const mapCenter = { lat: 6.9147, lng: 79.9710 }; // Near SLIIT

    const map = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: 13,
    });

    const autocompleteOptions = {
      location: new window.google.maps.LatLng(mapCenter),
      radius: 5000, // 5km radius
      componentRestrictions: { country: 'lk' },
    };

    // Delivery
    autocompleteDeliveryRef.current = new window.google.maps.places.Autocomplete(
      document.getElementById('delivery-address'),
      {
        ...autocompleteOptions,
        types: ['geocode'],
      }
    );

    autocompleteDeliveryRef.current.addListener('place_changed', () => {
      const place = autocompleteDeliveryRef.current.getPlace();
      if (place.geometry) {
        setDeliveryLocation({
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          address: place.formatted_address,
          lastUpdated: new Date().toISOString(),
        });

        map.setCenter(place.geometry.location);
        new window.google.maps.Marker({
          position: place.geometry.location,
          map,
          title: 'Delivery Location',
        });
      }
    });

    // Restaurant
    autocompleteRestaurantRef.current = new window.google.maps.places.Autocomplete(
      document.getElementById('restaurant-address'),
      {
        ...autocompleteOptions,
        types: ['establishment'],
      }
    );

    autocompleteRestaurantRef.current.addListener('place_changed', () => {
      const place = autocompleteRestaurantRef.current.getPlace();
      if (place.geometry) {
        setRestaurantLocation({
          latitude: place.geometry.location.lat(),
          longitude: place.geometry.location.lng(),
          address: place.formatted_address,
          lastUpdated: new Date().toISOString(),
        });

        map.setCenter(place.geometry.location);
        new window.google.maps.Marker({
          position: place.geometry.location,
          map,
          title: 'Restaurant Location',
        });
      }
    });
  });
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerId || !deliveryLocation || !restaurantLocation) {
      alert('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      const response = await createDelivery({
        orderId: `ORDER_${Date.now()}`,
        customerId,
        deliveryLocation,
        restaurantLocation,
      });
      const newDeliveryId = response.data.id;
      setDeliveryId(newDeliveryId);

      // Initialize WebSocket to listen for driver response
      const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8083/delivery-websocket'),
        reconnectDelay: 5000,
      });

      client.onConnect = () => {
        stompClientRef.current = client;
        client.subscribe(`/topic/delivery/${newDeliveryId}/driver-response`, (message) => {
          const update = JSON.parse(message.body);
          if (update.response === 'ACCEPT') {
            setIsLoading(false);
            navigate('/deliveries');
          }
        });
      };

      client.onStompError = (frame) => {
        console.error('Broker error:', frame.headers['message']);
      };

      client.activate();

      // Assign driver
      await assignDriver(newDeliveryId);
    } catch (error) {
      console.error('Error creating delivery:', error);
      alert('Failed to create delivery');
      setIsLoading(false);
      setDeliveryId(null);
    }
  };

  const handleCancel = async () => {
    if (deliveryId) {
      try {
        await deleteDelivery(deliveryId);
        if (stompClientRef.current) {
          stompClientRef.current.deactivate();
        }
        navigate('/deliveries');
      } catch (error) {
        console.error('Error deleting delivery:', error);
        alert('Failed to cancel delivery');
      }
    } else {
      navigate('/deliveries');
    }
  };

  useEffect(() => {
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        <p className="mt-4 text-lg">Assigning Driver...</p>
        <button
          onClick={handleCancel}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cancel Delivery
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Delivery</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Customer ID</label>
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Delivery Address</label>
          <input
            id="delivery-address"
            type="text"
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="Search for delivery address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Restaurant Address</label>
          <input
            id="restaurant-address"
            type="text"
            className="mt-1 block w-full border rounded-md p-2"
            placeholder="Search for restaurant"
          />
        </div>
        <div ref={mapRef} className="h-96 w-full"></div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Delivery
        </button>
      </form>
    </div>
  );
}

export default CreateDelivery;