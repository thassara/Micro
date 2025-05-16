import React, { useState, useEffect } from 'react';
import { getPendingRestaurants, updateApprovalStatus } from '../../apiRestaurant/adminApi';
import { getRestaurantOrders, updateOrderStatus } from '../../apiRestaurant/orderApi';
import PendingRestaurantRow from '../../components/admin/PendingRestaurantRow';
import OrderRow from '../../components/admin/OrderRow';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
    const [pendingRestaurants, setPendingRestaurants] = useState([]);
    const [restaurantOrders, setRestaurantOrders] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('approvals');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (activeTab === 'approvals') {
                    const data = await getPendingRestaurants();
                    setPendingRestaurants(data);
                } else if (selectedRestaurant) {
                    const data = await getRestaurantOrders(selectedRestaurant);
                    setRestaurantOrders(data);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeTab, selectedRestaurant]);

    const handleApproval = async (id, approved) => {
        try {
            await updateApprovalStatus(id, approved);
            setPendingRestaurants(pendingRestaurants.filter(restaurant => restaurant.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);
            setRestaurantOrders(restaurantOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
            <LoadingSpinner />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Data</h2>
                <p className="text-red-500">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-8">
                        {/* Tab navigation */}
                        <div className="flex border-b border-gray-200 mb-8">
                            <button
                                className={`py-3 px-6 font-medium text-sm ${activeTab === 'approvals'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('approvals')}
                            >
                                Pending Approvals
                            </button>
                        </div>

                        {activeTab === 'approvals' ? (
                            <>
                                <h1 className="text-2xl font-bold text-gray-900 mb-6">Pending Restaurant Approvals</h1>
                                {pendingRestaurants.length === 0 ? (
                                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                                        <p className="text-gray-600">No pending restaurant approvals</p>
                                    </div>
                                ) : (
                                    <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
                                        <div className="overflow-x-auto">
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
                                    </div>
                                )}
                            </>
                        ) : (
                            <>

                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;