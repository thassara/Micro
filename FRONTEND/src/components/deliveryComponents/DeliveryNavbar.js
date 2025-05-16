import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const DeliveryNavbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm fixed w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/driver" className="flex items-center space-x-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Delivery Panel
                        </span>
                    </Link>

                    {/* Desktop Links - Hidden on mobile */}
                    <div className="hidden md:flex items-center space-x-1">
                        <NavItem to="/create-delivery">Create Delivery</NavItem>
                        <NavItem to="/deliveries">View Deliveries</NavItem>
                        <NavItem to="/driver">Driver Dashboard</NavItem>
                        <NavItem to="/drivers/availability">Availability</NavItem>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none transition"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu - show/hide based on menu state */}
            <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
                    <MobileNavItem to="/create-delivery">Create Delivery</MobileNavItem>
                    <MobileNavItem to="/deliveries">View Deliveries</MobileNavItem>
                    <MobileNavItem to="/driver">Driver Dashboard</MobileNavItem>
                    <MobileNavItem to="/drivers/availability">Availability</MobileNavItem>
                </div>
            </div>
        </nav>
    );
};

// Reusable Desktop NavItem component
const NavItem = ({ to, children, className = '', ...props }) => (
    <Link
        to={to}
        className={`px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg transition ${className}`}
        {...props}
    >
        {children}
    </Link>
);

// Reusable Mobile NavItem component
const MobileNavItem = ({ to, children, className = '', ...props }) => (
    <Link
        to={to}
        className={`block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 ${className}`}
        {...props}
    >
        {children}
    </Link>
);

export default DeliveryNavbar;
