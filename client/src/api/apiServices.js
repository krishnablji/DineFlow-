import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (userData) => axiosClient.post('/auth/register', userData),
  getMe: () => axiosClient.get('/auth/me'),
  demoLogin: (role, tableNumber = 4) =>
    axiosClient.post('/auth/demo-login', { role, tableNumber }),
};

export const menuApi = {
  getMenuItems: (params) => axiosClient.get('/menu', { params }),
  getMenuItemById: (id) => axiosClient.get(`/menu/${id}`),
  getCategories: () => axiosClient.get('/menu/categories/all'),
  createMenuItem: (dishData) => axiosClient.post('/menu', dishData),
  updateMenuItem: (id, dishData) => axiosClient.put(`/menu/${id}`, dishData),
  deleteMenuItem: (id) => axiosClient.delete(`/menu/${id}`),
  uploadMedia: (formData) =>
    axiosClient.post('/menu/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const tableApi = {
  getTables: () => axiosClient.get('/tables'),
  getTableByNumber: (tableNumber) => axiosClient.get(`/tables/${tableNumber}`),
  getTableQRCode: (tableNumber) => axiosClient.get(`/tables/${tableNumber}/qr`),
  updateTableStatus: (tableNumber, statusData) =>
    axiosClient.put(`/tables/${tableNumber}/status`, statusData),
  createTable: (tableData) => axiosClient.post('/tables', tableData),
};

export const orderApi = {
  createOrder: (orderData) => axiosClient.post('/orders', orderData),
  getOrders: (params) => axiosClient.get('/orders', { params }),
  getOrderById: (id) => axiosClient.get(`/orders/${id}`),
  getActiveTableOrder: (tableNumber) =>
    axiosClient.get(`/orders/table/${tableNumber}/active`),
  updateOrderStatus: (id, statusData) =>
    axiosClient.put(`/orders/${id}/status`, statusData),
  updateOrderPriority: (id, priority) =>
    axiosClient.put(`/orders/${id}/priority`, { priority }),
};

export const paymentApi = {
  createRazorpayOrder: (paymentData) =>
    axiosClient.post('/payment/create-order', paymentData),
  verifyPayment: (verificationData) =>
    axiosClient.post('/payment/verify', verificationData),
};

export const userApi = {
  getStaffList: () => axiosClient.get('/users/staff'),
  getPendingStaff: () => axiosClient.get('/users/staff/pending'),
  updateStaffVerification: (id, verificationData) =>
    axiosClient.put(`/users/staff/${id}/verify`, verificationData),
  deleteStaffMember: (id) => axiosClient.delete(`/users/staff/${id}`),
};

export const analyticsApi = {
  getDashboardAnalytics: () => axiosClient.get('/analytics/dashboard'),
};
