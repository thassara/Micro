import React, { useState, useEffect } from 'react';
import { getAllRestaurants } from '../../apiRestaurant/restaurantApi';
import RestaurantCard from '../../components/customer/RestaurantCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const data = await getAllRestaurants();
                // Filter to only show approved restaurants
                const approvedRestaurants = data.filter(restaurant => restaurant.approved);
                setRestaurants(approvedRestaurants);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurants().catch(err => {
            setError(err.message);
            setLoading(false);
        });
    }, []);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="text-red-500 text-center mt-8">Error: {error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Restaurants</h1>
            {restaurants.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <p className="text-gray-500 text-lg">No approved restaurants available at this time.</p>
                    <p className="text-gray-400 mt-2">Please check back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {restaurants.map((restaurant) => (
                        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default RestaurantList;