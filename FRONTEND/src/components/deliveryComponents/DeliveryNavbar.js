import React from 'react';
import { Link } from 'react-router-dom';

const DeliveryNavbar = () => {
    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm fixed w-full z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/driver" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Delivery Panel
                        </span>
                    </Link>

                    {/* Links */}
                    <div className="hidden md:flex items-center space-x-1">
                        <NavItem to="/create-delivery">Create Delivery</NavItem>
                        <NavItem to="/deliveries">View Deliveries</NavItem>
                        <NavItem to="/driver">Driver Dashboard</NavItem>
                        <NavItem to="/drivers/availability">Availability</NavItem>
                    </div>
                </div>
            </div>
        </nav>
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

export default DeliveryNavbar;