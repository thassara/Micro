import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const RestaurantOwnerNavBar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;
    const [showRestaurantAuth, setShowRestaurantAuth] = useState(false);
    const [restaurantId, setRestaurantId] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    let userRole = null;

    if (token) {
        try {
            const decoded = jwtDecode(token);
            userRole = decoded.role;
        } catch (error) {
            console.error('Invalid token:', error);
            userRole = null;
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleOwnerAccess = () => {
        setShowRestaurantAuth(true);
    };

    const handleRestaurantAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setIsLoading(true);

        try {
            // 1. Fetch restaurant data from backend
            const response = await fetch(`http://localhost:8082/api/public/restaurants/${restaurantId}`);

            if (!response.ok) {
                throw new Error('Restaurant not found');
            }

            const restaurant = await response.json();

            // 2. Verify password
            if (restaurant.restaurantPassword === password) {
                // 3. If approved, navigate to management page
                if (restaurant.approved) {
                    navigate(`/manage/${restaurantId}`);
                    setShowRestaurantAuth(false);
                } else {
                    setAuthError('Restaurant not approved yet');
                }
            } else {
                setAuthError('Invalid password');
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setAuthError(error.message || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <nav className="bg-blue-600 text-white shadow-lg">
                <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                    <Link to="/RestaurantList" className="text-xl font-bold">Restaurant App</Link>

                    <div className="flex space-x-4">
                        <Link to="/RestaurantList" className="hover:bg-blue-700 px-3 py-2 rounded">Home</Link>

                        {isAuthenticated && (
                            <button
                                onClick={handleOwnerAccess}
                                className="hover:bg-blue-700 px-3 py-2 rounded"
                            >
                                Manage Restaurant
                            </button>
                        )}

                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="hover:bg-blue-700 px-3 py-2 rounded"
                            >
                                Logout
                            </button>
                        ) : (
                            <>
                                <Link to="/login" className="hover:bg-blue-700 px-3 py-2 rounded">Login</Link>
                                <Link to="/register" className="hover:bg-blue-700 px-3 py-2 rounded">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Restaurant Authentication Modal */}
            {showRestaurantAuth && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Restaurant Authentication</h2>

                        <form onSubmit={handleRestaurantAuthSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Restaurant ID</label>
                                <input
                                    type="text"
                                    value={restaurantId}
                                    onChange={(e) => setRestaurantId(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter restaurant ID"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter restaurant password"
                                    required
                                />
                            </div>

                            {authError && (
                                <div className="mb-4 text-red-500 text-sm">
                                    {authError}
                                </div>
                            )}

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRestaurantAuth(false)}
                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Authenticating...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default RestaurantOwnerNavBar;