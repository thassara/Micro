import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

function DriverDashboard() {
  const [deliveries, setDeliveries] = useState([]);
  const stompClientRef = useRef(null);
  const subscriptionsRef = useRef([]);

  // Fetch initial deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await axios.get('http://localhost:8083/api/delivery');
        setDeliveries(response.data.filter(d => d.status === 'WAITING_FOR_DRIVER_RESPONSE'));
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      }
    };

    fetchDeliveries();
  }, []);

  // Set up WebSocket connection
  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8083/delivery-websocket'),
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      stompClientRef.current = client;

      // Subscribe to new delivery notifications
      const newDeliverySub = client.subscribe('/topic/deliveries', (message) => {
        const newDelivery = JSON.parse(message.body);
        if (newDelivery.status === 'WAITING_FOR_DRIVER_RESPONSE') {
          setDeliveries((prev) => {
            // Avoid duplicates by checking if delivery ID already exists
            if (prev.some((d) => d.id === newDelivery.id)) {
              return prev;
            }
            return [...prev, newDelivery];
          });
        }
      });
      subscriptionsRef.current.push(newDeliverySub);

      // Subscribe to driver response updates for all deliveries
      const driverResponseSub = client.subscribe('/topic/driver-responses', (message) => {
        const update = JSON.parse(message.body);
        setDeliveries((prev) =>
          prev.map((d) =>
            d.id === update.deliveryId
              ? { ...d, status: update.response === 'ACCEPT' ? 'DRIVER_ASSIGNED' : 'DRIVER_REJECTED' }
              : d
          ).filter((d) => d.status === 'WAITING_FOR_DRIVER_RESPONSE') // Remove non-pending deliveries
        );
      });
      subscriptionsRef.current.push(driverResponseSub);
    };

    client.onStompError = (frame) => {
      console.error('Broker error:', frame.headers['message']);
    };

    client.activate();

    // Cleanup on unmount
    return () => {
      if (stompClientRef.current) {
        subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
        subscriptionsRef.current = [];
        stompClientRef.current.deactivate();
        console.log('WebSocket disconnected');
      }
    };
  }, []);

  const handleDriverResponse = async (deliveryId, response) => {
    try {
      await axios.put(`http://localhost:8083/api/delivery/${deliveryId}/driver-response`, {
        response,
      });
      setDeliveries((prev) =>
        prev.filter((d) => d.id !== deliveryId) // Remove delivery from list after response
      );
    } catch (error) {
      console.error('Error sending driver response:', error);
      alert('Failed to send response');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>
      <ul className="space-y-4">
        {deliveries.length === 0 ? (
          <p className="text-gray-500">No deliveries awaiting driver assignment.</p>
        ) : (
          deliveries.map((delivery) => (
            <li key={delivery.id} className="border p-4 rounded-md">
              <p><strong>Order ID:</strong> {delivery.orderId}</p>
              <p><strong>Customer ID:</strong> {delivery.customerId}</p>
              <p><strong>Delivery Address:</strong> {delivery.deliveryLocation.address}</p>
              <p><strong>Restaurant Address:</strong> {delivery.restaurantLocation.address}</p>
              <p><strong>Status:</strong> {delivery.status}</p>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => handleDriverResponse(delivery.id, 'ACCEPT')}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDriverResponse(delivery.id, 'REJECT')}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default DriverDashboard;