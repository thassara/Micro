import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // 👈 import jwt-decode

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token;

    let userRole = null;

    if (token) {
        try {
            const decoded = jwtDecode(token);
            userRole = decoded.role; 
    
            console.log(userRole); 
    
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
        if (userRole === 'ADMIN') {
            navigate('/admin');
        } else {
            alert('You are unauthorized person');
        }
    };

    const handleOwnerAccess = () => {
        if (userRole == 'RESTURENTADMIN') {
            navigate('/manage');
            console.log ('You are authorized person');
        } else {
            alert('You are unauthorized person');
        }
    };
    const handledelivaryAccess = () => {
        if (userRole == 'Delivary') {
            navigate('/manage');
            console.log ('You are authorized person');
        } else {
            alert('You are unauthorized person');
        }
    };
    const handleOrderAccess = () => {
        if (userRole == 'Order') {
            navigate('/manage');
            console.log ('You are authorized person');
        } else {
            alert('You are unauthorized person');
        }
    };

    return (
        <nav className="bg-blue-600 text-white shadow-lg">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold">Restaurant App</Link>

                <div className="flex space-x-4">
                    <Link to="/" className="hover:bg-blue-700 px-3 py-2 rounded">Home</Link>

                    {isAuthenticated && (
                        <>
                            <button
                                onClick={handleAdminAccess}
                                className="hover:bg-blue-700 px-3 py-2 rounded"
                            >
                                Admin
                            </button>

                            <button
                                onClick={handleOwnerAccess}
                                className="hover:bg-blue-700 px-3 py-2 rounded"
                            >
                                Manage Restaurant
                            </button>
                            <button
                                onClick={handledelivaryAccess}
                                className="hover:bg-blue-700 px-3 py-2 rounded"
                            >
                                Delivery
                            </button>
                            <button
                                onClick={handleOrderAccess}
                                className="hover:bg-blue-700 px-3 py-2 rounded"
                            >
                                Manage Orders
                            </button>
                        </>
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
    );
};

export default Navbar;
