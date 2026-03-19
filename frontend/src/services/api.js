import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const getSummaries = () => api.get('/summaries');
export const getTransactions = () => api.get('/transactions-history');
export const getInventory = () => api.get('/inventory');
export const addTransaction = (data) => api.post('/transactions', data);
export const updateInventory = (data) => api.post('/inventory', data);
export const deleteInventory = (productName) => api.delete(`/inventory/${productName}`);
export const chatWithAI = (session_id, question) => api.post('/chat', { session_id, question });
export const recognizeProduct = (image) => api.post('/vision/recognize', { image });

export default api;
