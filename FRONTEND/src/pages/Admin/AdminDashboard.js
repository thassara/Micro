import React, { useState, useEffect } from 'react';
import { getPendingRestaurants, updateApprovalStatus } from '../../apiRestaurant/adminApi';
import PendingRestaurantRow from '../../components/admin/PendingRestaurantRow';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
    const [pendingRestaurants, setPendingRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPendingRestaurants = async () => {
            try {
                const data = await getPendingRestaurants();
                setPendingRestaurants(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPendingRestaurants();
    }, []);

    const handleApproval = async (id, approved) => {
        try {
            await updateApprovalStatus(id, approved);
            setPendingRestaurants(pendingRestaurants.filter(restaurant => restaurant.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center mt-8">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Pending Restaurant Approvals</h1>
            {pendingRestaurants.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p>No pending restaurant approvals</p>
                </div>
            ) : (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {pendingRestaurants.map((restaurant) => (
                            <PendingRestaurantRow
                                key={restaurant.id}
                                restaurant={restaurant}
                                onApprove={handleApproval}
                            />
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;