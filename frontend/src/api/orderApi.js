import api from './axiosConfig';

export const createOrder = (orderData) => api.post('/orders', orderData);
export const fetchMyOrders = () => api.get('/orders/myorders');
export const fetchOrderById = (id) => api.get(`/orders/${id}`);
export const updateOrderStatus = (id, status) =>
  api.put(`/orders/${id}/status`, { status });
