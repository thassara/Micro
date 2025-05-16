const API_BASE_URL = 'http://localhost:8081'; 
export const getMenuItems = async (restaurantId) => {
    const response = await fetch(`${API_BASE_URL}/api/public/restaurants/${restaurantId}/menu`);
    if (!response.ok) throw new Error('Failed to fetch menu items');
    return await response.json();
};

export const addMenuItem = async (restaurantId, menuItem) => {
    const response = await fetch(`${API_BASE_URL}/api/owner/restaurants/${restaurantId}/menu`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(menuItem),
    });
    if (!response.ok) throw new Error('Failed to add menu item');
    return await response.json();
};

export const updateMenuItem = async (restaurantId, itemId, menuItem) => {
    const response = await fetch(`${API_BASE_URL}/api/owner/restaurants/${restaurantId}/menu/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(menuItem),
    });
    if (!response.ok) throw new Error('Failed to update menu item');
    return await response.json();
};

export const deleteMenuItem = async (restaurantId, itemId) => {
    const response = await fetch(`${API_BASE_URL}/api/owner/restaurants/${restaurantId}/menu/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to delete menu item');
};

// In menuApi.js
export const toggleItemAvailability = async (restaurantId, itemId) => {
    const response = await fetch(`${API_BASE_URL}/api/owner/restaurants/${restaurantId}/menu/${itemId}/availability`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to toggle item availability');
    return await response.json();
};