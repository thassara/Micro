import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
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

    const handleAdminAccess = () => {
        if (userRole === 'RESTURENTADMIN') {
            navigate('/admin');
        } else {
            alert('You are unauthorized to access admin panel');
        }
    };

    const handleOwnerAccess = () => {
        if (userRole === 'ADMIN') {
            navigate('/admin');
        } else {
            setShowRestaurantAuth(true);
        }
    };

    const handleDeliveryAccess = () => {
        if (userRole === 'DELIVERY') {
            navigate('/delivery');
        } else {
            alert('You are unauthorized to access delivery panel');
        }
    };

    const handleOrderAccess = () => {
        if (userRole === 'ORDER') {
            navigate('/orders');
        } else {
            alert('You are unauthorized to access orders panel');
        }
    };

    const handleRestaurantAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setIsLoading(true);

        try {
            const response = await fetch(`http://localhost:8088/api/public/restaurants/${restaurantId}`);
            if (!response.ok) {
                throw new Error('Restaurant not found');
            }
            const restaurant = await response.json();

            if (restaurant.restaurantPassword === password) {
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
            <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-lg fixed w-full z-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex justify-between h-16 items-center">
                        {/* Logo */}
                        <Link to="/RestaurantList" className="flex items-center space-x-2">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                Savory Swift
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-1">
                            <NavItem to="/RestaurantList">Home</NavItem>

                            {isAuthenticated && userRole === 'RESTURENTADMIN' ? (
                                <NavButton onClick={handleAdminAccess}>
                                    Admin Dashboard
                                </NavButton>
                            ) : isAuthenticated && (
                                <>
                                    {userRole !== 'RESTURENTADMIN' && (
                                        <>
                                            <NavButton onClick={handleDeliveryAccess}>
                                                Delivery
                                            </NavButton>
                                            <NavButton onClick={handleOrderAccess}>
                                                Orders
                                            </NavButton>
                                        </>
                                    )}
                                </>
                            )}

                            {userRole !== 'RESTURENTADMIN' && (
                                <NavButton onClick={handleOwnerAccess}>
                                    Manage Restaurant
                                </NavButton>
                            )}

                            {isAuthenticated ? (
                                <NavButton onClick={handleLogout}>
                                    Logout
                                </NavButton>
                            ) : (
                                <>
                                    <NavItem to="/login">Login</NavItem>
                                    <NavItem to="/register" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600">
                                        Register
                                    </NavItem>
                                </>
                            )}
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden flex items-center">
                            <button className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none">
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Restaurant Authentication Modal */}
            {showRestaurantAuth && (
                <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Restaurant Authentication</h2>
                            <button
                                onClick={() => setShowRestaurantAuth(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleRestaurantAuthSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant ID</label>
                                <input
                                    type="text"
                                    value={restaurantId}
                                    onChange={(e) => setRestaurantId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Enter restaurant ID"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Enter restaurant password"
                                    required
                                />
                            </div>
                            {authError && (
                                <div className="text-red-500 text-sm">
                                    {authError}
                                </div>
                            )}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowRestaurantAuth(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg transition"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition shadow-md disabled:opacity-70"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Authenticating...
                                        </span>
                                    ) : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

// Reusable NavItem component
const NavItem = ({ to, children, className = '', ...props }) => (
    <Link
        to={to}
        className={`px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg transition ${className}`}
        {...props}
    >
        {children}
    </Link>
);

// Reusable NavButton component
const NavButton = ({ onClick, children, className = '', ...props }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg transition ${className}`}
        {...props}
    >
        {children}
    </button>
);

export default Navbar;