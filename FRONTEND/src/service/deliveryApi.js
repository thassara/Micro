import axios from 'axios';

const API_BASE_URL = 'http://localhost:8083/api';

// Existing API functions (unchanged)
export const createDelivery = (data) => axios.post(`${API_BASE_URL}/delivery`, data);
export const assignDriver = (deliveryId) => axios.post(`${API_BASE_URL}/delivery/${deliveryId}/assign-driver`);
export const getDeliveries = () => axios.get(`${API_BASE_URL}/delivery`);
export const getDeliveryById = (deliveryId) => axios.get(`${API_BASE_URL}/delivery/${deliveryId}`);
export const getDrivers = () => axios.get(`${API_BASE_URL}/drivers`);
export const getDriverById = (driverId) => axios.get(`${API_BASE_URL}/drivers/${driverId}`);
export const updateDriverResponse = (deliveryId, response) =>
  axios.put(`${API_BASE_URL}/delivery/${deliveryId}/driver-response`, { response });
export const deleteDelivery = (deliveryId) => axios.delete(`${API_BASE_URL}/delivery/${deliveryId}`);
export const updateDriver = (driverId, data) => axios.put(`${API_BASE_URL}/drivers/${driverId}`, data);
export const updateDriverLocation = (deliveryId, location) =>
  axios.put(`${API_BASE_URL}/delivery/${deliveryId}/location`, location);
export const updateDeliveryStatus = (deliveryId, status) =>
  axios.put(`${API_BASE_URL}/delivery/${deliveryId}/status`, { status });

// New function to confirm delivery
export const confirmDelivery = (deliveryId) =>
  axios.put(`${API_BASE_URL}/delivery/${deliveryId}/confirm`, {});