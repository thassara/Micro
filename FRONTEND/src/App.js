import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login'
import Register from './pages/Register'
import RestaurantList from "./pages/Customer/RestaurantList"
import RestaurantCreateForm from "./pages/Customer/RestaurantCreateForm"
import AdminDashboard from "./pages/Admin/AdminDashboard"
import RestaurantManagement from "./pages/RestaurantOwner/RestaurantManagement"
import RestaurantDetail from "./pages/Customer/RestaurantDetail"
import Layout from "./components/common/Layout"


export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth routes without Layout */}
                <Route path="/login" element={<Login />} /> 
                <Route path="/register" element={<Register />} />

                {/* All other routes wrapped with Layout */}
                <Route element={<Layout />}>
                    <Route path="/RestaurantList" element={<RestaurantList />} />
                    <Route path="/restaurants/create" element={<RestaurantCreateForm />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/manage/:id" element={<RestaurantManagement />} />
                    <Route path="/restaurants/:id" element={<RestaurantDetail />} />

                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}