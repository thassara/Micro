import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getRestaurantById } from '../../apiRestaurant/restaurantApi';
import { getMenuItems } from '../../apiRestaurant/menuApi';
import MenuItemCard from '../../components/customer/MenuItemCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RestaurantDetail = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [menuLoading, setMenuLoading] = useState(true);
    const [menuError, setMenuError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const restaurantData = await getRestaurantById(id);
                setRestaurant(restaurantData);

                try {
                    const menuData = await getMenuItems(id);
                    setMenuItems(menuData);
                } catch (menuErr) {
                    setMenuError("Could not load menu items");
                    setMenuItems([]);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                setMenuLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
            <LoadingSpinner />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Restaurant</h2>
                <p className="text-red-500">{error}</p>
            </div>
        </div>
    );

    if (!restaurant) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-gray-600">Restaurant not found</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Restaurant Header */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
                    <div className="flex justify-center items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                            restaurant.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {restaurant.available ? 'Open' : 'Closed'}
                        </span>
                        {restaurant.cuisineType && (
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm">
                                {restaurant.cuisineType}
                            </span>
                        )}
                    </div>
                </div>

                {/* Restaurant Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    {restaurant.coverImageUrl && (
                        <div className="h-64 w-full overflow-hidden">
                            <img
                                src={restaurant.coverImageUrl}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="p-6 space-y-6">
                        {/* Contact Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {restaurant.address && (
                                <div className="flex items-start">
                                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Address</p>
                                        <p className="text-gray-700">{restaurant.address}</p>
                                    </div>
                                </div>
                            )}

                            {restaurant.contactNumber && (
                                <div className="flex items-start">
                                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Contact</p>
                                        <a href={`tel:${restaurant.contactNumber}`} className="text-blue-600 hover:underline">
                                            {restaurant.contactNumber}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {(restaurant.openingTime && restaurant.closingTime) && (
                                <div className="flex items-start">
                                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Hours</p>
                                        <p className="text-gray-700">
                                            {restaurant.openingTime} - {restaurant.closingTime}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {restaurant.email && (
                                <div className="flex items-start">
                                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500 mb-1">Email</p>
                                        <a href={`mailto:${restaurant.email}`} className="text-blue-600 hover:underline">
                                            {restaurant.email}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {restaurant.description && (
                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
                                <p className="text-gray-700">{restaurant.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Menu Section */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
                    </div>

                    <div className="p-6">
                        {menuLoading ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner small />
                            </div>
                        ) : menuError ? (
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            {menuError}. Please check back later.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : menuItems.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">This restaurant hasn't added any menu items yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {menuItems.map((item) => (
                                    <MenuItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetail;