import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurantById, updateRestaurant, toggleAvailability } from '../../apiRestaurant/restaurantApi';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem, toggleItemAvailability } from '../../apiRestaurant/menuApi';
import { getRestaurantOrders, updateOrderStatus } from '../../apiRestaurant/orderApi';
import MenuItemForm from '../../components/restaurant/MenuItemForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RestaurantManagement = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [menuItemsLoading, setMenuItemsLoading] = useState(true);
    const [menuItemsError, setMenuItemsError] = useState(null);
    const [activeTab, setActiveTab] = useState('menu');
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const restaurantData = await getRestaurantById(id);
                if (isMounted) {
                    setRestaurant(restaurantData);
                    setFormData(restaurantData);
                }

                try {
                    const menuData = await getMenuItems(id);
                    if (isMounted) setMenuItems(menuData);
                } catch (menuError) {
                    if (isMounted) setMenuItemsError(menuError.message);
                    if (isMounted) setMenuItems([]);
                } finally {
                    if (isMounted) setMenuItemsLoading(false);
                }

            } catch (err) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const fetchOrders = async () => {
        try {
            setOrdersLoading(true);
            const data = await getRestaurantOrders(id);
            setOrders(data);
        } catch (err) {
            setOrdersError(err.message);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleToggleAvailability = async () => {
        try {
            const updatedRestaurant = await toggleAvailability(id);
            setRestaurant(updatedRestaurant);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const updatedRestaurant = await updateRestaurant(id, formData);
            setRestaurant(updatedRestaurant);
            setIsEditing(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddItem = async (itemData) => {
        try {
            const newItem = await addMenuItem(id, itemData);
            setMenuItems([...menuItems, newItem]);
            setIsAddingItem(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateItem = async (itemData) => {
        try {
            const updatedItem = await updateMenuItem(id, editingItem.id, itemData);
            setMenuItems(menuItems.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            ));
            setEditingItem(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteItem = async (itemId) => {
        try {
            await deleteMenuItem(id, itemId);
            setMenuItems(menuItems.filter(item => item.id !== itemId));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleToggleItemAvailability = async (itemId) => {
        try {
            const updatedItem = await toggleItemAvailability(id, itemId);
            setMenuItems(menuItems.map(item =>
                item.id === updatedItem.id ? updatedItem : item
            ));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleOrderStatusChange = async (orderId, newStatus) => {
        try {
            const updatedOrder = await updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: updatedOrder.status } : order
            ));
        } catch (err) {
            console.error('Status update failed:', err);
            setError(`Failed to update status: ${err.message}`);
            fetchOrders();
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
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Restaurant</h2>
                <p className="text-red-500">{error}</p>
            </div>
        </div>
    );

    if (!restaurant) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-600">Restaurant not found</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-8">
                    <div className="p-6">
                        {/* Tab navigation */}
                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                className={`py-3 px-6 font-medium text-sm ${activeTab === 'menu'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('menu')}
                            >
                                Menu Management
                            </button>
                            <button
                                className={`py-3 px-6 font-medium text-sm ${activeTab === 'orders'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => {
                                    setActiveTab('orders');
                                    fetchOrders();
                                }}
                            >
                                Order Management
                            </button>
                        </div>

                        {/* Restaurant header with toggle button */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">{restaurant.name}</h1>
                            <button
                                onClick={handleToggleAvailability}
                                className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm ${
                                    restaurant.available
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                                        : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
                                }`}
                            >
                                {restaurant.available ? 'Open - Tap to Close' : 'Closed - Tap to Open'}
                            </button>
                        </div>

                        {activeTab === 'menu' ? (
                            <>
                                {/* Restaurant details section */}
                                {isEditing ? (
                                    <form onSubmit={handleUpdate} className="space-y-6 mb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                                                <input
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number*</label>
                                                <input
                                                    type="tel"
                                                    value={formData.contactNumber}
                                                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Password*</label>
                                                <input
                                                    type="password"
                                                    value={formData.restaurantPassword}
                                                    onChange={(e) => setFormData({...formData, restaurantPassword: e.target.value})}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                    required
                                                    minLength="8"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address*</label>
                                            <input
                                                type="text"
                                                value={formData.address}
                                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                                rows="4"
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition shadow-md"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <h2 className="text-xl font-semibold text-gray-900">Restaurant Details</h2>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition shadow-md"
                                            >
                                                Edit Details
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <p><span className="font-medium text-gray-700">Name:</span> {restaurant.name}</p>
                                                <p><span className="font-medium text-gray-700">Address:</span> {restaurant.address}</p>
                                                <p><span className="font-medium text-gray-700">Status:</span>
                                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                                        restaurant.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {restaurant.available ? 'Open' : 'Closed'}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <p><span className="font-medium text-gray-700">Hours:</span> {restaurant.openingTime} - {restaurant.closingTime}</p>
                                                <p><span className="font-medium text-gray-700">Contact:</span> {restaurant.contactNumber}</p>
                                                <p><span className="font-medium text-gray-700">Email:</span> {restaurant.email}</p>
                                            </div>
                                        </div>
                                        {restaurant.description && (
                                            <div className="mt-4">
                                                <h3 className="font-medium text-gray-700 mb-1">Description</h3>
                                                <p className="text-gray-600">{restaurant.description}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Menu items section */}
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
                                    <button
                                        onClick={() => {
                                            setIsAddingItem(true);
                                            setEditingItem(null);
                                        }}
                                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-md"
                                    >
                                        Add Menu Item
                                    </button>
                                </div>

                                {/* Menu item form */}
                                {(isAddingItem || editingItem) && (
                                    <MenuItemForm
                                        initialData={editingItem || {}}
                                        onSubmit={editingItem ? handleUpdateItem : handleAddItem}
                                        onCancel={() => {
                                            setIsAddingItem(false);
                                            setEditingItem(null);
                                        }}
                                    />
                                )}

                                {/* Menu items list */}
                                {menuItemsLoading ? (
                                    <div className="flex justify-center py-12">
                                        <LoadingSpinner />
                                    </div>
                                ) : menuItemsError ? (
                                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-yellow-700">
                                                    Couldn't load menu items: {menuItemsError}. <button
                                                    onClick={() => window.location.reload()}
                                                    className="text-yellow-700 underline hover:text-yellow-800"
                                                >
                                                    Try again
                                                </button>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : menuItems.length === 0 ? (
                                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                                        <p className="text-gray-600 mb-4">This restaurant currently has no menu items</p>
                                        <button
                                            onClick={() => setIsAddingItem(true)}
                                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition shadow-md"
                                        >
                                            Add Your First Menu Item
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                {menuItems.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.description}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs {item.price?.toFixed(2) || '0.00'}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <button
                                                                onClick={() => handleToggleItemAvailability(item.id)}
                                                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                    item.available
                                                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                                                                }`}
                                                            >
                                                                {item.available ? 'Available' : 'Unavailable'}
                                                            </button>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                            <button
                                                                onClick={() => setEditingItem(item)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteItem(item.id)}
                                                                className="text-red-600 hover:text-red-800"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold text-gray-900 mb-6">Current Orders</h2>

                                {ordersLoading ? (
                                    <div className="flex justify-center py-12">
                                        <LoadingSpinner />
                                    </div>
                                ) : ordersError ? (
                                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mb-6">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-700">
                                                    Error loading orders: {ordersError}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                                        <p className="text-gray-600">No orders found</p>
                                    </div>
                                ) : (
                                    <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Status</th>
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                {orders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {order.customerName}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            Rs {order.totalPrice?.toFixed(2) || '0.00'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                    order.status === 'PREPARING' ? 'bg-blue-100 text-blue-800' :
                                                                        order.status === 'READY_FOR_PICKUP' ? 'bg-green-100 text-green-800' :
                                                                            'bg-red-100 text-red-800'
                                                            }`}>
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                            >
                                                                <option value="RESTAURANT_CONFIRMED">Confirm Order</option>
                                                                <option value="PREPARING">Preparing</option>
                                                                <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                                                                <option value="CANCELLED">Cancel Order</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantManagement;