import React from 'react';
import { Outlet } from 'react-router-dom';
import DeliveryNavbar from '../deliveryComponents/DeliveryNavbar';

const DeliveryLayout = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <DeliveryNavbar />
            <main className="container mx-auto px-4 py-8 pt-20">
                <Outlet />
            </main>
        </div>
    );
};

export default DeliveryLayout;
