import api from './axiosConfig';

export const fetchSellerDashboard = () => api.get('/sellers/dashboard');
export const fetchSellerProducts = () => api.get('/sellers/products');
export const fetchSellerOrders = () => api.get('/sellers/orders');
