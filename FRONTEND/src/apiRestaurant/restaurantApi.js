const API_BASE_URL = 'http://localhost:8081'; 

export const getAllRestaurants = async () => {
    const response = await fetch(`${API_BASE_URL}/api/public/restaurants`);
    if (!response.ok) throw new Error('Failed to fetch restaurants');
    return await response.json();
};

export const getRestaurantById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/public/restaurants/${id}`);
    if (!response.ok) throw new Error('Failed to fetch restaurant');
    return await response.json();
};

export const createRestaurant = async (restaurantData) => {
    const response = await fetch(`${API_BASE_URL}/restaurants/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(restaurantData),
    });
    if (!response.ok) throw new Error('Failed to create restaurant');
    return await response.json();
};

export const updateRestaurant = async (id, restaurantData) => {
    const response = await fetch(`${API_BASE_URL}/api/owner/restaurants/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(restaurantData),
    });
    if (!response.ok) throw new Error('Failed to update restaurant');
    return await response.json();
};

export const toggleAvailability = async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/owner/restaurants/${id}/availability`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error('Failed to toggle availability');
    }

    return response.json();
};