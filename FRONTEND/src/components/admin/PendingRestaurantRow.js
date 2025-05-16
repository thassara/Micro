import React from 'react';

const PendingRestaurantRow = ({ restaurant, onApprove }) => {
    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">{restaurant.name}</td>
            <td className="px-6 py-4 whitespace-nowrap">{restaurant.address}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <button
                    onClick={() => onApprove(restaurant.id, true)}
                    className="mr-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                    Approve
                </button>
                <button
                    onClick={() => onApprove(restaurant.id, false)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                    Reject
                </button>
            </td>
        </tr>
    );
};

export default PendingRestaurantRow;