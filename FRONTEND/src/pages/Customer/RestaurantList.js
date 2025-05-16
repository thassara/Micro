import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllRestaurants } from '../../apiRestaurant/restaurantApi';
import RestaurantCard from '../../components/customer/RestaurantCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RestaurantList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const data = await getAllRestaurants();
                const approvedRestaurants = data.filter(restaurant => restaurant.approved);
                setRestaurants(approvedRestaurants);
                setFilteredRestaurants(approvedRestaurants);
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

    useEffect(() => {
        const lowerSearch = searchTerm.toLowerCase();
        const filtered = restaurants.filter(
            (restaurant) =>
                restaurant.name.toLowerCase().includes(lowerSearch) ||
                restaurant.cuisineType?.toLowerCase().includes(lowerSearch)
        );
        setFilteredRestaurants(filtered);
    }, [searchTerm, restaurants]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <LoadingSpinner />
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Error Loading Restaurants</h2>
                <p className="text-red-500 text-center">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Restaurants</h1>
                        <p className="text-gray-600 mb-4">Browse and order from your favorite places</p>
                        <div className="max-w-md mx-auto relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg
                                className="h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 3a7.5 7.5 0 006.15 13.65z"/>
                            </svg>
                          </span>
                            <input
                                type="text"
                                placeholder="Search by restaurant name or cuisine type..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            />
                        </div>

                    </div>

                    {filteredRestaurants.length === 0 ? (
                        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-sm text-center">
                            <p className="text-gray-600 mb-4">No restaurants match your search.</p>
                            <p className="text-gray-400">Try a different name or cuisine type.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredRestaurants.map((restaurant) => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant}/>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Savory Swift</h3>
                            <p className="text-gray-600">Fast, fresh, and delicious food delivered to your doorstep.</p>
                            <div className="mt-4">
                                <Link
                                    to="/restaurants/create"
                                    className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition"
                                >
                                    Add Your Restaurant
                                </Link>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li><Link to="#" className="text-gray-600 hover:text-blue-600 transition">About Us</Link></li>
                                <li><Link to="#" className="text-gray-600 hover:text-blue-600 transition">Contact</Link></li>
                                <li><Link to="#" className="text-gray-600 hover:text-blue-600 transition">FAQs</Link></li>
                                <li><Link to="#" className="text-gray-600 hover:text-blue-600 transition">Careers</Link></li>
                            </ul>
                        </div>

                        {/* For Restaurants */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">For Restaurants</h3>
                            <ul className="space-y-2">
                                <li><Link to="/restaurants/create" className="text-gray-600 hover:text-blue-600 transition">Register Restaurant</Link></li>
                                <li><Link to="#" className="text-gray-600 hover:text-blue-600 transition">Restaurant Login</Link></li>
                                <li><Link to="#" className="text-gray-600 hover:text-blue-600 transition">Benefits</Link></li>
                                <li><Link to="#" className="text-gray-600 hover:text-blue-600 transition">Pricing</Link></li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h3>
                            <address className="not-italic text-gray-600 space-y-2">
                                <p>123 World Trade Center</p>
                                <p>Colombo 2, Sri Lanka</p>
                                <p>Email: <a href="mailto:info@savoryswift.com" className="text-blue-600 hover:underline">info@savoryswift.com</a></p>
                                <p>Phone: <a href="tel:+94112345678" className="text-blue-600 hover:underline">+94 (112) 345-678</a></p>
                            </address>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500">
                        <p>© {new Date().getFullYear()} Savory Swift. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default RestaurantList;
