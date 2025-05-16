import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getDriverById, confirmDelivery } from '../../service/deliveryApi';
import toast from 'react-hot-toast';

function DeliveryCard({ delivery }) {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [error, setError] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (delivery.driverId) {
      getDriverById(delivery.driverId)
        .then((response) => {
          setDriver(response.data);
          setError(null);
        })
        .catch((err) => {
          console.error('Error fetching driver:', err);
          setError('Failed to load driver details');
          setDriver(null);
        });
    }
  }, [delivery.driverId]);

  const handleConfirmDelivery = async () => {
    if (window.confirm('Are you sure you want to confirm the delivery?')) {
      setIsConfirming(true);
      try {
        await confirmDelivery(delivery.id);
        toast.success('Delivery confirmed successfully');
      } catch (err) {
        console.error('Error confirming delivery:', err);
        toast.error('Failed to confirm delivery');
      } finally {
        setIsConfirming(false);
      }
    }
  };

  return (
    <div
      className="border p-4 rounded-md hover:bg-gray-100 cursor-pointer"
      onClick={() => navigate(`/deliveries/${delivery.id}`)}
    >
      <div className="flex justify-between items-center">
        <p>
          <strong>Order ID:</strong> {delivery.orderId}
        </p>
        {delivery.status === 'DELIVERY_CONFIRMED' && (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            Confirmed
          </span>
        )}
      </div>
      <p>
        <strong>Status:</strong> {delivery.status}
      </p>
      <p>
        <strong>Customer ID:</strong> {delivery.customerId}
      </p>
      {delivery.driverId ? (
        driver ? (
          <>
            <p>
              <strong>Driver Name:</strong> {driver.name}
            </p>
            <p>
              <strong>Driver Contact:</strong> {driver.contactNumber}
            </p>
          </>
        ) : error ? (
          <p className="text-red-500">
            <strong>Error:</strong> {error}
          </p>
        ) : (
          <p>Loading driver details...</p>
        )
      ) : (
        <p>
          <strong>Driver:</strong> Not assigned
        </p>
      )}
      {delivery.status === 'DRIVER_ARRIVED' && (
        <button
          className={`mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
            isConfirming ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleConfirmDelivery();
          }}
          disabled={isConfirming}
        >
          {isConfirming ? 'Confirming...' : 'Confirm Delivery'}
        </button>
      )}
    </div>
  );
}

export default DeliveryCard;