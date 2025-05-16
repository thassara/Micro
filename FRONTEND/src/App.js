import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantList from './pages/Customer/RestaurantList';
import RestaurantCreateForm from './pages/Customer/RestaurantCreateForm';
import AdminDashboard from './pages/Admin/AdminDashboard';
import RestaurantManagement from './pages/RestaurantOwner/RestaurantManagement';
import RestaurantDetail from './pages/Customer/RestaurantDetail';
import CreateDelivery from './pages/deliveryPages/CreateDelivery';
import ViewDeliveries from './pages/deliveryPages/ViewDeliveries';
import TrackDelivery from './pages/deliveryPages/TrackDelivery';
import DriverDashboard from './pages/deliveryPages/DriverDashboard';
import DriverSimulator from './components/deliveryComponents/DriverSimulator';
import UpdateDriverAvailability from './pages/deliveryPages/UpdateDriverAvailability';
import RestaurantOwnerLayout from './components/common/RestaurantOwnerLayout';
import DeliveryLayout from './components/common/DeliveryLayout';


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Auth pages - without layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        {/* Customer/Admin/Owner routes - with normal RestaurantOwnerLayout */}
        <Route element={<RestaurantOwnerLayout />}>
          <Route path="/RestaurantList" element={<RestaurantList />} />
          <Route path="/restaurants/create" element={<RestaurantCreateForm />} />
          <Route path="/manage/:id" element={<RestaurantManagement />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/restaurants/:id" element={<RestaurantDetail />} />
        </Route>

        {/* Delivery system routes - with DeliveryLayout */}
        <Route element={<DeliveryLayout />}>
          <Route path="/create-delivery" element={<CreateDelivery />} />
          <Route path="/deliveries" element={<ViewDeliveries />} />
          <Route path="/deliveries/:deliveryId" element={<TrackDelivery />} />
          <Route path="/driver" element={<DriverDashboard />} />
          <Route path="/drivers/availability" element={<UpdateDriverAvailability />} />
          <Route path="/simulate/:deliveryId" element={<DriverSimulator />} />
        </Route>

        {/* fallback: if nothing matched */}
        <Route path="*" element={<Navigate to="/RestaurantList" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;

