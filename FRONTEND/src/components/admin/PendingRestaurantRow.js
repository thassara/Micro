import React from 'react';

const PendingRestaurantRow = ({ restaurant, onApprove }) => {
    return (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium">{restaurant.name}</div>
                <div className="text-sm text-gray-500">{restaurant.cuisineType}</div>
            </td>
            <td className="px-6 py-4">
                <div className="text-gray-900">{restaurant.formattedAddress}</div>
                <div className="text-sm text-gray-500">
                    <span className="font-medium">Contact:</span> {restaurant.contactNumber}
                </div>
                <div className="text-sm text-gray-500">
                    <span className="font-medium">Hours:</span> {restaurant.openingTime} - {restaurant.closingTime}
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm">
                    <span className="font-medium">Email:</span> {restaurant.email}
                </div>
                <div className="text-sm">
                    <span className="font-medium">Registered:</span> {restaurant.registrationDate}
                </div>
                <div className="text-sm">
                    <span className="font-medium">Status:</span>
                    <span className={`ml-1 px-2 py-1 text-xs rounded-full ${
                        restaurant.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {restaurant.approved ? 'Approved' : 'Pending'}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right">
                {!restaurant.approved && (
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onApprove(restaurant.id, true)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => onApprove(restaurant.id, false)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                            Reject
                        </button>
                    </div>
                )}
                {restaurant.approved && (
                    <span className="text-green-600 text-sm font-medium">Approved</span>
                )}
            </td>
        </tr>
    );
};

export default PendingRestaurantRow;