const API_BASE_URL = 'http://localhost:8081'; // Update with your backend URL

export const getPendingRestaurants = async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/restaurants/pending"`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch pending restaurants');
    return await response.json();
};

export const updateApprovalStatus = async (id, approved) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/restaurants/${id}/approval?approved=${approved}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    if (!response.ok) throw new Error('Failed to update approval status');
    return await response.json();
};