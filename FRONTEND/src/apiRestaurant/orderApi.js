// src/apiRestaurant/orderApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8088'; // No trailing slash

export const getRestaurantOrders = async (restaurantId) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/orders/restaurant/${restaurantId}/orders`, // Added /orders
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error('API Error:', {
            url: `${API_BASE_URL}/api/orders/restaurant/${restaurantId}/orders`,
            error: error.response ? error.response.data : error.message
        });
        throw error;
    }
};

export const updateOrderStatus = async (orderId, status) => {
    try {
        let endpoint;
        switch(status) {
            case 'RESTAURANT_CONFIRMED':
                endpoint = `${API_BASE_URL}/api/owner/restaurants/${orderId}/confirm`;
                break;
            case 'PREPARING':
                endpoint = `${API_BASE_URL}/api/owner/restaurants/${orderId}/preparing`;
                break;
            case 'READY_FOR_PICKUP':
                endpoint = `${API_BASE_URL}/api/owner/restaurants/${orderId}/ready`;
                break;
            case 'CANCELLED':
                endpoint = `${API_BASE_URL}/api/owner/restaurants/${orderId}/cancel`;
                break;
            default:
                throw new Error('Invalid status');
        }

        const response = await axios.put(
            endpoint,
            {},
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );
        return response.data;
    } catch (error) {
        console.error('Update Status Error:', error);
        throw new Error(error.response?.data?.message || 'Failed to update order status');
    }
};