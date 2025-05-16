import { useState, useEffect, useRef } from 'react';
import DeliveryCard from '../../components/deliveryComponents/DeliveryCard';
import StatusUpdate from '../../components/deliveryComponents/StatusUpdate';
import { getDeliveries, deleteDelivery } from '../../service/deliveryApi';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

function ViewDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const clientRef = useRef(null);
  const subscriptionsRef = useRef([]);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await getDeliveries();
        setDeliveries(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
        setError('Failed to load deliveries. Please try again.');
        setStatus('ERROR');
      }
    };

    fetchDeliveries();

    // Set up WebSocket connection
    const socket = new SockJS('http://localhost:8083/delivery-websocket');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        clientRef.current = stompClient;

        // Subscribe to updates for each delivery
        deliveries.forEach((delivery) => {
          const subscription = stompClient.subscribe(`/topic/delivery/${delivery.id}`, (message) => {
            const update = JSON.parse(message.body);
            console.log('Received WebSocket update for delivery:', update);
            setDeliveries((prev) =>
              prev.map((d) =>
                d.id === update.id ? { ...d, status: update.status, driverLocation: update.driverLocation } : d
              )
            );
            setStatus(update.status);
          });
          subscriptionsRef.current.push(subscription);
        });

        // Subscribe to new deliveries
        const newDeliverySub = stompClient.subscribe('/topic/deliveries', (message) => {
          const newDelivery = JSON.parse(message.body);
          setDeliveries((prev) => {
            if (prev.some((d) => d.id === newDelivery.id)) {
              return prev;
            }
            return [...prev, newDelivery];
          });
          setStatus(newDelivery.status);
        });
        subscriptionsRef.current.push(newDeliverySub);
      },
      onStompError: (frame) => {
        console.error('Broker error:', frame.headers['message']);
        setError('WebSocket connection error');
        setStatus('ERROR');
      },
    });

    stompClient.activate();

    return () => {
      if (clientRef.current) {
        subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
        subscriptionsRef.current = [];
        clientRef.current.deactivate();
        console.log('WebSocket disconnected');
      }
    };
  }, []);

  // Re-subscribe to WebSocket topics when deliveries change
  useEffect(() => {
    if (clientRef.current && clientRef.current.connected) {
      // Unsubscribe from previous subscriptions
      subscriptionsRef.current.forEach((sub) => sub.unsubscribe());
      subscriptionsRef.current = [];

      // Subscribe to updates for each delivery
      deliveries.forEach((delivery) => {
        const subscription = clientRef.current.subscribe(`/topic/delivery/${delivery.id}`, (message) => {
          const update = JSON.parse(message.body);
          console.log('Received WebSocket update for delivery:', update);
          setDeliveries((prev) =>
            prev.map((d) =>
              d.id === update.id ? { ...d, status: update.status, driverLocation: update.driverLocation } : d
            )
          );
          setStatus(update.status);
        });
        subscriptionsRef.current.push(subscription);
      });

      // Ensure the new deliveries subscription persists
      const newDeliverySub = clientRef.current.subscribe('/topic/deliveries', (message) => {
        const newDelivery = JSON.parse(message.body);
        setDeliveries((prev) => {
          if (prev.some((d) => d.id === newDelivery.id)) {
            return prev;
          }
          return [...prev, newDelivery];
        });
        setStatus(newDelivery.status);
      });
      subscriptionsRef.current.push(newDeliverySub);
    }
  }, [deliveries]);

  const handleDelete = async (deliveryId) => {
    if (window.confirm('Are you sure you want to delete this delivery?')) {
      try {
        await deleteDelivery(deliveryId);
        setDeliveries((prev) => prev.filter((delivery) => delivery.id !== deliveryId));
        setError(null);
      } catch (error) {
        console.error('Error deleting delivery:', error);
        setError('Failed to delete delivery. Please try again.');
        setStatus('ERROR');
      }
    }
  };

  // Handle error status
  const getStatusMessage = () => {
    if (status === 'ERROR') {
      return 'An error occurred while processing deliveries';
    }
    return status;
  };

  return (
    <div className="container mx-auto p-4">
      <StatusUpdate status={getStatusMessage()} />
      <h1 className="text-2xl font-bold mb-4">Deliveries</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Delivery List</h2>
          <div className="space-y-2">
            {deliveries.length === 0 ? (
              <p className="text-gray-500">No deliveries found.</p>
            ) : (
              deliveries.map((delivery) => (
                <div key={delivery.id} className="flex items-center space-x-2">
                  <div className="flex-1">
                    <DeliveryCard delivery={delivery} />
                  </div>
                  <button
                    onClick={() => handleDelete(delivery.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewDeliveries;