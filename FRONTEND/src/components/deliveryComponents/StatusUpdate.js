import { useState, useEffect } from 'react';

function StatusUpdate({ status, onClose }) {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  // Define major status updates and their corresponding messages
  const statusMessages = {
    DRIVER_ON_WAY_TO_RESTAURANT: 'Driver is on the way to the restaurant',
    DRIVER_AT_RESTAURANT: 'Driver has arrived at the restaurant',
    DRIVER_LEFT_RESTAURANT: 'Driver has left the restaurant',
    DRIVER_ON_WAY_TO_DELIVERY: 'Driver is on the way to you',
    DRIVER_ARRIVED: 'Driver has arrived at your location',
    DELIVERY_CONFIRMED: 'Delivery confirmed',
  };

  useEffect(() => {
    // Only show messages for major status updates
    if (statusMessages[status]) {
      setMessage(statusMessages[status]);
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [status]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg flex items-center justify-between max-w-sm">
      <span>{message}</span>
      <button
        onClick={handleClose}
        className="ml-4 text-blue-700 hover:text-blue-900 font-bold"
      >
        ✕
      </button>
    </div>
  );
}

export default StatusUpdate;