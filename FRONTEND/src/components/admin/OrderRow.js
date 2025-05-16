// src/components/admin/OrderRow.jsx
import React from 'react';

const OrderRow = ({ order, onStatusChange }) => {
    const handleStatusChange = (newStatus) => {
        onStatusChange(order.id, newStatus);
    };

    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.totalPrice}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
          ${order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                order.status === 'READY_FOR_PICKUP' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'}`}>
          {order.status}
        </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {order.status === 'PENDING' && (
                    <button
                        onClick={() => handleStatusChange('RESTAURANT_CONFIRMED')}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                        Confirm
                    </button>
                )}
                {order.status === 'RESTAURANT_CONFIRMED' && (
                    <button
                        onClick={() => handleStatusChange('PREPARING')}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                        Start Preparing
                    </button>
                )}
                {order.status === 'PREPARING' && (
                    <button
                        onClick={() => handleStatusChange('READY_FOR_PICKUP')}
                        className="text-green-600 hover:text-green-900 mr-2"
                    >
                        Mark as Ready
                    </button>
                )}
                {(order.status === 'PENDING' || order.status === 'RESTAURANT_CONFIRMED') && (
                    <button
                        onClick={() => handleStatusChange('CANCELLED')}
                        className="text-red-600 hover:text-red-900"
                    >
                        Cancel
                    </button>
                )}
            </td>
        </tr>
    );
};

export default OrderRow;